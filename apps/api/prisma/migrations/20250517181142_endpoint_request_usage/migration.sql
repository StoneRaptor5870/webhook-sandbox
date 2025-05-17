-- AlterTable
ALTER TABLE "IpRegistry" ADD COLUMN     "endpointUsage" INTEGER DEFAULT 1,
ADD COLUMN     "requestUsage" INTEGER DEFAULT 3;
