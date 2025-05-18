/*
  Warnings:

  - Made the column `creatorIp` on table `Endpoint` required. This step will fail if there are existing NULL values in that column.
  - Made the column `endpointUsage` on table `IpRegistry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `requestUsage` on table `IpRegistry` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Endpoint" ALTER COLUMN "creatorIp" SET NOT NULL;

-- AlterTable
ALTER TABLE "IpRegistry" ALTER COLUMN "endpointUsage" SET NOT NULL,
ALTER COLUMN "requestUsage" SET NOT NULL;
