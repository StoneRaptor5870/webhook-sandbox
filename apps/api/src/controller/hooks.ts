import { Request, Response } from "express";
import { io, emitWebhookEvent } from "..";
import redis from "../db/redis";
import db from "../db/prisma";

export async function allRoutes(req: Request, res: Response): Promise<any> {
  const { slug } = req.params;

  try {
    // Extract request data
    const headers = req.headers;
    const method = req.method;
    const forwardedIp = req.headers['x-forwarded-for'] // req.ip
    const ip = Array.isArray(forwardedIp)
      ? forwardedIp[0]
      : (forwardedIp?.split(',')[0]?.trim() || req.ip || 'unknown');
    const userAgent = req.get("user-agent") || "";

    // Handle different body types
    let body = req.body;

    // For non-JSON content types, store raw body as string
    const contentType = req.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      body = req.body ? JSON.stringify(req.body) : null;
    }

    // Find endpoint by slug
    const endpointCheck = await db.endpoint.findUnique({
      where: { slug },
    });

    if (!endpointCheck) {
      return res.status(404).json({ error: "Endpoint not found" });
    }

    if (endpointCheck.expiresAt < new Date()) {
      return res.status(410).json({ error: "Endpoint has expired" });
    }

    const { request, endpoint } = await db.$transaction(async (tx) => {
      const endpoint = await tx.endpoint.findUnique({
        where: { slug },
      });

      if (!endpoint) {
        throw new Error("Endpoint not found");
      }

      // Check usage limits
      if (endpoint.creatorIp) {
        const ipRecord = await tx.ipRegistry.findUnique({
          where: { ip: endpoint.creatorIp },
        });

        if (ipRecord) {
          if (ipRecord.requestUsage <= 0) {
            const error = new Error('Request limit reached for this endpoint, you have to upgrade to premium tier');
            (error as any).statusCode = 429;
            throw error;
          } else {
            await tx.ipRegistry.update({
              where: { ip: endpoint.creatorIp },
              data: {
                lastSeen: new Date(),
                requestUsage: ipRecord.requestUsage - 1,
              },
            });
          }
        }
      }

      const request = await tx.request.create({
        data: {
          endpointId: endpoint.id,
          method,
          headers: headers as any,
          body: body as any,
          queryParams: req.query as any,
          ip,
          userAgent,
        },
        include: {
          endpoint: {
            select: { slug: true },
          },
        },
      });

      return { request, endpoint };
    });

    console.log(
      `Processing webhook for endpoint ${slug} with method ${method}`,
    );

    // Log Socket.io rooms status
    if (io.sockets.adapter.rooms.has(slug!)) {
      const roomSize = io.sockets.adapter.rooms.get(slug!)?.size || 0;
      console.log(`Room ${slug} exists with ${roomSize} client(s) connected`);
    } else {
      console.log(`Room ${slug} does not exist or has no clients`);
    }

    // Emit real-time event via Socket.io
    const requestData = {
      id: request.id,
      method,
      headers,
      body,
      queryParams: req.query,
      ip,
      userAgent,
      createdAt: request.createdAt,
    };

    console.log(`Emitting new-request event to room ${slug}`);

    // Emit to room with endpoint slug
    io.to(slug!).emit("new-request", requestData);

    // Also emit to all connected clients (as a fallback)
    io.emit(`webhook:${slug}`, requestData);

    // Record activity in Redis (for TTL and rate limiting purposes)
    redis.incr(`endpoint:${endpoint.slug}:requests`);
    redis.expire(`endpoint:${endpoint.slug}:requests`, 86400); // 24 hours

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Webhook received successfully",
      requestId: request.id,
    });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    const statusCode = error.statusCode || 500;
    const message =
      error.message || "Request limit reached for this endpoint";

    return res.status(statusCode).json({ error: message });
  }
}
