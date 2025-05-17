import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import redis from "../db/redis";
import db from "../db/prisma";

const generateSlug = async (
  prisma: PrismaClient,
  length = 8,
): Promise<string> => {
  const { nanoid } = await import("nanoid");
  const slug = nanoid(length);
  const exists = await prisma.endpoint.findUnique({ where: { slug } });
  if (exists) return generateSlug(prisma, length);
  return slug;
};

export async function createEndpoint(
  req: Request,
  res: Response,
): Promise<any> {
  try {
    const { name, description, duration = 24, persistent = false } = req.body;
    const forwardedIp = req.headers['x-forwarded-for']

    // Generate unique slug for the endpoint
    const slug = await generateSlug(db);
    const ip = Array.isArray(forwardedIp)
      ? forwardedIp[0]
      : (forwardedIp?.split(',')[0]?.trim() || req.ip || 'unknown');

    // Calculate expiration date (default: 24 hours)
    const hoursToExpire = persistent
      ? 720
      : Math.min(Math.max(duration, 1), 168); // 1 hour to 7 days (or 30 days if persistent)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hoursToExpire);

    const { ipData, endpoint } = await db.$transaction(async (tx) => {
      const existingIp = await tx.ipRegistry.findUnique({
        where: { ip }
      });

      if (existingIp) {
        // IP exists - check if they can create more endpoints
        if (existingIp.endpointUsage == 0) {
          const error = new Error("Endpoint creation limit reached for this IP");
          (error as any).statusCode = 429;
          throw error;
        }
      }

      const ipData = await tx.ipRegistry.create({
        data: {
          ip: ip ? ip : '',
          firstSeen: new Date(),
          lastSeen: new Date(),
          usageCount: 0,
          endpointUsage: 0
        }
      })

      // Create endpoint in database
      const endpoint = await tx.endpoint.create({
        data: {
          slug,
          name: name || `Webhook ${slug}`,
          description,
          expiresAt,
          isPersistent: persistent,
          creatorIp: ip
        },
      });

      return { ipData, endpoint }
    })

    // Store in Redis for quick access and automatic expiration
    const redisKey = `endpoint:${slug}`;
    await redis.set(redisKey, endpoint.id);
    await redis.expire(redisKey, hoursToExpire * 60 * 60);

    // Return endpoint details
    return res.status(201).json({
      id: endpoint.id,
      slug,
      url: `${process.env.API_URL}/api/hooks/${slug}`,
      name: endpoint.name,
      description: endpoint.description,
      createdAt: endpoint.createdAt,
      expiresAt: endpoint.expiresAt,
      isPersistent: endpoint.isPersistent,
      endpointUsage: ipData.usageCount
    });
  } catch (error: any) {
    console.error("Error creating endpoint:", error);
    const statusCode = error.statusCode || 500;
    const message =
      error.message || "Failed to create endpoint";

    return res.status(statusCode).json({ error: message });
  }
}

export async function getEndpoint(req: Request, res: Response): Promise<any> {
  const { slug } = req.params;

  try {
    const endpoint = await db.endpoint.findUnique({
      where: { slug },
    });

    if (!endpoint) {
      return res.status(404).json({ error: "Endpoint not found" });
    }

    // Check if endpoint has expired
    if (endpoint.expiresAt < new Date()) {
      return res.status(410).json({ error: "Endpoint has expired" });
    }

    return res.json({
      id: endpoint.id,
      slug: endpoint.slug,
      url: `${process.env.API_URL}/api/hooks/${endpoint.slug}`,
      name: endpoint.name,
      description: endpoint.description,
      createdAt: endpoint.createdAt,
      expiresAt: endpoint.expiresAt,
      isPersistent: endpoint.isPersistent
    });
  } catch (error) {
    console.error("Error fetching endpoint:", error);
    return res.status(500).json({ error: "Failed to fetch endpoint" });
  }
}

export async function getRequests(req: Request, res: Response): Promise<any> {
  const { slug } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  const page = parseInt(req.query.page as string) || 1;
  const skip = (page - 1) * limit;

  try {
    const endpoint = await db.endpoint.findUnique({
      where: { slug },
    });

    if (!endpoint) {
      return res.status(404).json({ error: "Endpoint not found" });
    }

    // Check if endpoint has expired
    if (endpoint.expiresAt < new Date() && !endpoint.isPersistent) {
      return res.status(410).json({ error: "Endpoint has expired" });
    }

    // Get requests for this endpoint with pagination
    const requests = await db.request.findMany({
      where: { endpointId: endpoint.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Count total requests
    const totalRequests = await db.request.count({
      where: { endpointId: endpoint.id },
    });

    return res.json({
      requests,
      pagination: {
        total: totalRequests,
        pages: Math.ceil(totalRequests / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
}

export async function deleteRequest(req: Request, res: Response): Promise<any> {
  const { requestId } = req.params;

  try {
    await db.request.delete({
      where: { id: requestId },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting request:", error);
    return res.status(500).json({ error: "Failed to delete request" });
  }
}

export async function deleteEndpoint(
  req: Request,
  res: Response,
): Promise<any> {
  const { slug } = req.params;

  try {
    const endpoint = await db.endpoint.findUnique({
      where: { slug },
    });

    if (!endpoint) {
      return res.status(404).json({ error: "Endpoint not found" });
    }

    // Delete endpoint (cascades to requests)
    await db.endpoint.delete({
      where: { id: endpoint.id },
    });

    // Remove from Redis
    await redis.del(`endpoint:${slug}`);

    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting endpoint:", error);
    return res.status(500).json({ error: "Failed to delete endpoint" });
  }
}
