-- CreateEnum
CREATE TYPE "PluginCategory" AS ENUM ('CONTENT', 'GAMIFICATION', 'ANALYTICS', 'USERMGMT', 'COMMUNICATION', 'PAYMENTS', 'INTEGRATIONS', 'AI', 'UTILITY');

-- DropForeignKey
ALTER TABLE "VideoGeneration" DROP CONSTRAINT "VideoGeneration_moduleId_fkey";

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "videoGenId" TEXT;

-- AlterTable
ALTER TABLE "VideoGeneration" ALTER COLUMN "script" SET DEFAULT '',
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "Plugin" (
    "id" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL,
    "author" TEXT,
    "category" "PluginCategory" NOT NULL DEFAULT 'CONTENT',
    "icon" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plugin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_pluginId_key" ON "Plugin"("pluginId");

-- CreateIndex
CREATE INDEX "VideoGeneration_moduleId_idx" ON "VideoGeneration"("moduleId");
