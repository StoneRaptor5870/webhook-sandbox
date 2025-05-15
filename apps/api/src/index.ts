import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import http from "http";
import { setupSocketIO } from "./socket";
import db from "./db/prisma";
import redis from "./db/redis";
import hooksRouter from "./routes/hooks";
import endpointsRouter from "./routes/endPoints";
import { setupCleanupCronJob } from "./cron/cleanup";

dotenv.config();

const app = express();
const server = http.createServer(app);
export const { io, emitWebhookEvent } = setupSocketIO(server);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/hooks", hooksRouter);
app.use("/api/endpoints", endpointsRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

async function startServer() {
  try {
    await db.$connect();
    console.log("✅ Connected to database");

    const pong = await redis.ping();
    if (pong !== "PONG") {
      throw new Error("Redis ping failed");
    }
    console.log("✅ Connected to Redis");

    const PORT = process.env.PORT;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    setupCleanupCronJob();
    console.log(`🚀 Cron jobs initialized`);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

const shutdown = async () => {
  console.log("Shutting down gracefully...");
  server.close();
  await db.$disconnect();
  await redis.quit();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();
