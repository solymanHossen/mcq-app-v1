-- AlterTable
ALTER TABLE "Exam"
ADD COLUMN "accessCode" TEXT,
ADD COLUMN "allowGuestAccess" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "SystemSettings"
ADD COLUMN "contactEmail" TEXT,
ADD COLUMN "facebookUrl" TEXT,
ADD COLUMN "githubUrl" TEXT,
ADD COLUMN "linkedinUrl" TEXT,
ADD COLUMN "twitterUrl" TEXT,
ADD COLUMN "youtubeUrl" TEXT;

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "bio" TEXT,
ADD COLUMN "department" TEXT,
ADD COLUMN "institution" TEXT,
ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ExamTitleTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "subject" TEXT,
    "examType" TEXT,
    "year" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "teacherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamTitleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamTitleTemplate_teacherId_createdAt_idx" ON "ExamTitleTemplate"("teacherId", "createdAt");

-- CreateIndex
CREATE INDEX "ExamTitleTemplate_category_idx" ON "ExamTitleTemplate"("category");

-- AddForeignKey
ALTER TABLE "ExamTitleTemplate" ADD CONSTRAINT "ExamTitleTemplate_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
