-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('PENDING', 'GENERATING', 'GENERATED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PENDING', 'GENERATING', 'APPROVED', 'REJECTED', 'FAILED');

-- AlterTable
ALTER TABLE "Module" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "contentGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "contentStatus" "ContentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "generatedContent" JSONB,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "topic" TEXT,
ADD COLUMN     "transcript" TEXT,
ADD COLUMN     "videoGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "videoStatus" "VideoStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "voiceId" TEXT;
