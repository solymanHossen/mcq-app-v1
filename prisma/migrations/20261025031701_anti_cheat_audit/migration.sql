-- CreateEnum
CREATE TYPE "ViolationType" AS ENUM ('TAB_SWITCH', 'WINDOW_BLUR', 'FULLSCREEN_EXIT', 'COPY_ATTEMPT', 'PASTE_ATTEMPT', 'RIGHT_CLICK_ATTEMPT', 'DEVTOOLS_DETECTED', 'MULTIPLE_TABS_DETECTED', 'SESSION_CONFLICT', 'SUSPICIOUS_REQUEST_PATTERN', 'WEBCAM_NO_FACE', 'WEBCAM_MULTIPLE_FACES');

-- CreateEnum
CREATE TYPE "ViolationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ViolationSource" AS ENUM ('CLIENT_REPORTED', 'SERVER_DETECTED');

-- CreateEnum
CREATE TYPE "ViolationReviewStatus" AS ENUM ('OPEN', 'REVIEWED_NO_ACTION', 'REVIEWED_WARNING_ISSUED', 'REVIEWED_DISQUALIFIED');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GradingAuditAction" ADD VALUE 'ATTEMPT_REQUALIFIED';
ALTER TYPE "GradingAuditAction" ADD VALUE 'ATTEMPT_FLAGGED_FOR_REVIEW';

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "violationReviewThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "webcamMonitoringRequired" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ExamAttempt" ADD COLUMN     "activeSessionToken" TEXT,
ADD COLUMN     "activeSessionTokenAt" TIMESTAMP(3),
ADD COLUMN     "flaggedForReviewAt" TIMESTAMP(3),
ADD COLUMN     "statusBeforeDisqualification" "AttemptStatus",
ADD COLUMN     "webcamConsentGivenAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ViolationEvent" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" "ViolationType" NOT NULL,
    "source" "ViolationSource" NOT NULL,
    "severity" "ViolationSeverity" NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewStatus" "ViolationReviewStatus" NOT NULL DEFAULT 'OPEN',
    "reviewNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ViolationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViolationAppeal" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedById" TEXT,
    "resolutionNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViolationAppeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ViolationEvent_attemptId_occurredAt_idx" ON "ViolationEvent"("attemptId", "occurredAt");

-- CreateIndex
CREATE INDEX "ViolationEvent_studentId_occurredAt_idx" ON "ViolationEvent"("studentId", "occurredAt");

-- CreateIndex
CREATE INDEX "ViolationEvent_reviewStatus_idx" ON "ViolationEvent"("reviewStatus");

-- CreateIndex
CREATE INDEX "ViolationAppeal_attemptId_idx" ON "ViolationAppeal"("attemptId");

-- CreateIndex
CREATE INDEX "ViolationAppeal_status_idx" ON "ViolationAppeal"("status");

-- AddForeignKey
ALTER TABLE "ViolationEvent" ADD CONSTRAINT "ViolationEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolationEvent" ADD CONSTRAINT "ViolationEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolationEvent" ADD CONSTRAINT "ViolationEvent_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolationAppeal" ADD CONSTRAINT "ViolationAppeal_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolationAppeal" ADD CONSTRAINT "ViolationAppeal_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViolationAppeal" ADD CONSTRAINT "ViolationAppeal_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
