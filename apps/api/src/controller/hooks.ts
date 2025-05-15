import { Request, Response } from "express";
import { io, emitWebhookEvent } from "..";
import redis from "../db/redis";
import db from "../db/prisma";

export async function allRoutes(req: Request, res: Response): Promise<any> {
  const { slug } = req.params;

  try {
    // Find endpoint by slug
    const endpoint = await db.endpoint.findUnique({
      where: { slug },
    });

    // Return 404 if endpoint not found
    if (!endpoint) {
      return res.status(404).json({ error: "Endpoint not found" });
    }

    // Check if endpoint has expired
    if (endpoint.expiresAt < new Date()) {
      return res.status(410).json({ error: "Endpoint has expired" });
    }

    // Extract request data
    const headers = req.headers;
    const method = req.method;
    const ip = req.ip; // request.headers['x-forwarded-for']
    const userAgent = req.get("user-agent") || "";

    // Handle different body types
    let body = req.body;

    // For non-JSON content types, store raw body as string
    const contentType = req.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      body = req.body ? JSON.stringify(req.body) : null;
    }

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

    // Create request record in database
    const request = await db.request.create({
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
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({ error: "Failed to process webhook" });
  }
}
