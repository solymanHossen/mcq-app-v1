-- CreateEnum
CREATE TYPE "TieBreakerPolicy" AS ENUM ('TIME_TAKEN_ASC', 'SUBMITTED_AT_ASC', 'ACCURACY_DESC');

-- AlterEnum
ALTER TYPE "AttemptStatus" ADD VALUE 'DISQUALIFIED';

-- AlterEnum
ALTER TYPE "GradingAuditAction" ADD VALUE 'ATTEMPT_DISQUALIFIED';

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "leaderboardEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tieBreakerPolicy" "TieBreakerPolicy" NOT NULL DEFAULT 'TIME_TAKEN_ASC';

-- AlterTable
ALTER TABLE "ExamAttempt" ADD COLUMN     "disqualifiedReason" TEXT;
