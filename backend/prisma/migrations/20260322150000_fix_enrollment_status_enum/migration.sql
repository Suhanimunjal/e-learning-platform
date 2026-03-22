-- Fix: align DB with Prisma schema for Enrollment.accessStatus enum

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'EnrollmentStatus' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END
$$;

ALTER TABLE "Enrollment"
  ALTER COLUMN "accessStatus" DROP DEFAULT;

ALTER TABLE "Enrollment"
  ALTER COLUMN "accessStatus"
  TYPE "EnrollmentStatus"
  USING (
    CASE UPPER(COALESCE("accessStatus"::text, 'PENDING'))
      WHEN 'PENDING' THEN 'PENDING'::"EnrollmentStatus"
      WHEN 'APPROVED' THEN 'APPROVED'::"EnrollmentStatus"
      WHEN 'REJECTED' THEN 'REJECTED'::"EnrollmentStatus"
      WHEN 'ACTIVE' THEN 'APPROVED'::"EnrollmentStatus"
      ELSE 'PENDING'::"EnrollmentStatus"
    END
  );

ALTER TABLE "Enrollment"
  ALTER COLUMN "accessStatus" SET DEFAULT 'PENDING';

UPDATE "Enrollment"
SET "accessStatus" = 'PENDING'
WHERE "accessStatus" IS NULL;

ALTER TABLE "Enrollment"
  ALTER COLUMN "accessStatus" SET NOT NULL;
