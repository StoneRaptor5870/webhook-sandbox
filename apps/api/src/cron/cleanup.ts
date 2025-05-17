import db from "../db/prisma";
import cron from "node-cron";

interface Endpoint {
    id: string;
    _count: {
        requests: number;
    };
}[]

async function cleanup() {
    const now = new Date();

    try {
        console.log(`[${now.toLocaleTimeString()}] Starting cleanup of expired endpoints...`);

        const expiredEndpointsInfo: Endpoint[] = await db.endpoint.findMany({
            where: {
                expiresAt: {
                    lt: now
                },
                isPersistent: false
            },
            select: {
                id: true,
                _count: {
                    select: { requests: true }
                }
            }
        });

        if(expiredEndpointsInfo.length === 0) {
            console.log(`[${now.toLocaleTimeString()}] No expired endpoints found.`);
            return;
        }

        const totalRequests = expiredEndpointsInfo.reduce((sum: number, endpoint: Endpoint) => sum + endpoint._count.requests, 0);
        const expiredIds: string[] = expiredEndpointsInfo.map(endpoint => endpoint.id);

        const result = await db.endpoint.deleteMany({
            where: {
                id: { in: expiredIds }
            }
        });

        console.log(`[${now.toLocaleTimeString()}] Successfully deleted ${result.count} expired endpoints and ${totalRequests} associated requests.`);
    } catch (error) {
        console.error(`[${now.toLocaleTimeString()}] Error cleaning up expired endpoints:`, error);
    }
}

export function setupCleanupCronJob(cronSchedule = '0,30 * * * *') {
  try {
    cron.schedule(cronSchedule, () => {
      cleanup();
    }, {
        timezone: "UTC"
    });

    console.log(`🚀 Cleanup cron job scheduled with pattern: ${cronSchedule}`);
  } catch (err) {
    console.error("❌ Failed to schedule cron job:", err);
  }
}