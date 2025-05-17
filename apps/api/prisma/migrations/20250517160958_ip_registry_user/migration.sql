/*
  Warnings:

  - Made the column `name` on table `Endpoint` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AccountTier" AS ENUM ('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Endpoint" ADD COLUMN     "creatorIp" TEXT,
ADD COLUMN     "hasCustomDomain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wasAnonymous" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "name" SET NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountTier" "AccountTier" NOT NULL DEFAULT 'FREE',
    "endpointLimit" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpRegistry" (
    "ip" TEXT NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usageCount" INTEGER NOT NULL DEFAULT 1,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "convertedToUser" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,

    CONSTRAINT "IpRegistry_pkey" PRIMARY KEY ("ip")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "IpRegistry_isBlocked_idx" ON "IpRegistry"("isBlocked");

-- CreateIndex
CREATE INDEX "Endpoint_ownerId_idx" ON "Endpoint"("ownerId");

-- CreateIndex
CREATE INDEX "Endpoint_creatorIp_idx" ON "Endpoint"("creatorIp");

-- AddForeignKey
ALTER TABLE "Endpoint" ADD CONSTRAINT "Endpoint_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
