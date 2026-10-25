-- CreateTable
CREATE TABLE "AIExplanationRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "examQuestionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIExplanationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIExplanationRequest_studentId_createdAt_idx" ON "AIExplanationRequest"("studentId", "createdAt");

-- AddForeignKey
ALTER TABLE "AIExplanationRequest" ADD CONSTRAINT "AIExplanationRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
