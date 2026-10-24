-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PROVISIONAL', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "GradingAuditAction" AS ENUM ('GRADED', 'REGRADED', 'RESULTS_PUBLISHED', 'QUESTION_CORRECTED', 'QUESTION_CANCELLED');

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "answerKeyReleased" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "answerKeyReleasedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ExamQuestion" ADD COLUMN     "isCancelled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "negativeMarks" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "status" "ResultStatus" NOT NULL DEFAULT 'PROVISIONAL',
    "totalMarks" DOUBLE PRECISION NOT NULL,
    "obtainedMarks" DOUBLE PRECISION NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "incorrectCount" INTEGER NOT NULL,
    "skippedCount" INTEGER NOT NULL,
    "cancelledCount" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "isPassed" BOOLEAN,
    "gradingVersion" INTEGER NOT NULL DEFAULT 1,
    "gradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradingAuditLog" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "attemptId" TEXT,
    "examQuestionId" TEXT,
    "action" "GradingAuditAction" NOT NULL,
    "actorId" TEXT,
    "previousScore" DOUBLE PRECISION,
    "newScore" DOUBLE PRECISION,
    "reason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradingAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamResult_attemptId_key" ON "ExamResult"("attemptId");

-- CreateIndex
CREATE INDEX "GradingAuditLog_examId_createdAt_idx" ON "GradingAuditLog"("examId", "createdAt");

-- CreateIndex
CREATE INDEX "GradingAuditLog_attemptId_createdAt_idx" ON "GradingAuditLog"("attemptId", "createdAt");

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradingAuditLog" ADD CONSTRAINT "GradingAuditLog_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradingAuditLog" ADD CONSTRAINT "GradingAuditLog_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradingAuditLog" ADD CONSTRAINT "GradingAuditLog_examQuestionId_fkey" FOREIGN KEY ("examQuestionId") REFERENCES "ExamQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradingAuditLog" ADD CONSTRAINT "GradingAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
