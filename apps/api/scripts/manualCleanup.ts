import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function dbConnection() {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
        return true;
    } catch (error) {
        console.error("Database connection error:", error);
        return false;
    }
}

async function cleanup() {
    const now = new Date();

    try {
        console.log(`[${now.toISOString()}] Starting cleanup of expired endpoints...`);

        const expiredEndpointsInfo = await prisma.endpoint.findMany({
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
            console.log(`[${now.toISOString()}] No expired endpoints found.`);
            return;
        }

        const totalRequests = expiredEndpointsInfo.reduce((sum, endpoint) => sum + endpoint._count.requests, 0);
        const expiredIds = expiredEndpointsInfo.map(endpoint => endpoint.id);

        const result = await prisma.endpoint.deleteMany({
            where: {
                id: { in: expiredIds }
            }
        });

        console.log(`[${now.toISOString()}] Successfully deleted ${result.count} expired endpoints and ${totalRequests} associated requests.`);
    } catch (error) {
        console.error(`[${now.toISOString()}] Error cleaning up expired endpoints:`, error);
    }
}

async function main() {
    try {
        const connected = await dbConnection();
        if (!connected) {
            console.error("Failed to connect to database. Exiting.");
            process.exit(1);
        }
        
        await cleanup();
        
        await prisma.$disconnect();
        console.log("Database disconnected successfully");
    } catch (error) {
        console.error("Error in main execution:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error("Unhandled error:", e);
        process.exit(1);
    });