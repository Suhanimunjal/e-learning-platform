-- Migration: Add approval workflow (user status, course status, enrollment status, pending requests)
-- Created: 2026-03-21

-- 1. Add UserStatus enum and status field to User
ALTER TYPE "Role" ADD VALUE 'PENDING_APPROVAL';
ALTER TYPE "Role" ADD VALUE 'ACTIVE';
ALTER TYPE "Role" ADD VALUE 'REJECTED';

-- 2. Add status to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" VARCHAR DEFAULT 'PENDING_APPROVAL';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "rejectionReason" VARCHAR;

-- 3. Add CourseStatus enum and fields
ALTER TYPE "Role" ADD VALUE 'PENDING_APPROVAL';
ALTER TYPE "Role" ADD VALUE 'APPROVED';
ALTER TYPE "Role" ADD VALUE 'REJECTED';

ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "status" VARCHAR DEFAULT 'PENDING_APPROVAL';
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "approvedBy" VARCHAR;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "rejectionReason" VARCHAR;
ALTER TABLE "Course" DROP COLUMN IF EXISTS "published";

-- 4. Create PendingCourseRequest table
CREATE TABLE IF NOT EXISTS "PendingCourseRequest" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "title" VARCHAR NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION DEFAULT 0,
  "instructorId" UUID NOT NULL,
  "thumbnail" VARCHAR,
  "status" VARCHAR DEFAULT 'PENDING',
  "rejectionReason" VARCHAR,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "PendingCourseRequest" ADD CONSTRAINT "fk_instructor" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "idx_pending_course_instructor" ON "PendingCourseRequest"("instructorId");
CREATE INDEX IF NOT EXISTS "idx_pending_course_status" ON "PendingCourseRequest"("status");

-- 5. Update Enrollment status
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "accessStatus" VARCHAR DEFAULT 'PENDING';
ALTER TABLE "Enrollment" DROP COLUMN IF EXISTS "accessStatus";
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "accessStatus" VARCHAR DEFAULT 'PENDING';

-- 6. Add indexes
CREATE INDEX IF NOT EXISTS "idx_user_status" ON "User"("status");
CREATE INDEX IF NOT EXISTS "idx_course_status" ON "Course"("status");
CREATE INDEX IF NOT EXISTS "idx_enrollment_accessStatus" ON "Enrollment"("accessStatus");
