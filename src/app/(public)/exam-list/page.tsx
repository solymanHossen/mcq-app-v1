import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { APP_NAME } from "@/lib/config"
import { ExamCatalogClient, type PublicExamItem } from "./exam-catalog-client"

export const metadata: Metadata = {
  title: `Public Assessment Directory — ${APP_NAME}`,
  description:
    "Explore timed MCQ examinations, practice with verified question banks, and evaluate your knowledge with instant auto-grading.",
}

export const instant = false

export default async function PublicExamListPage() {
  const [rawExams, totalExamsCount, totalAttemptsCount] = await Promise.all([
    prisma.exam.findMany({
      where: {
        status: "PUBLISHED",
        isPublic: true,
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            teacherVerificationStatus: true,
          },
        },
        _count: {
          select: {
            examQuestions: true,
            attempts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.exam.count({
      where: {
        status: "PUBLISHED",
        isPublic: true,
      },
    }),
    prisma.examAttempt.count(),
  ])

  const exams: PublicExamItem[] = rawExams.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    durationMinutes: e.durationMinutes,
    maxAttempts: e.maxAttempts,
    allowGuestAccess: e.allowGuestAccess,
    isPublic: e.isPublic,
    startTime: e.startTime?.toISOString() ?? null,
    endTime: e.endTime?.toISOString() ?? null,
    publishedAt: e.publishedAt?.toISOString() ?? null,
    teacherName: e.teacher.name,
    teacherEmail: e.teacher.email,
    teacherVerified: e.teacher.teacherVerificationStatus === "VERIFIED",
    questionsCount: e._count.examQuestions,
    attemptsCount: e._count.attempts,
  }))

  return (
    <main className="flex-1 pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ExamCatalogClient
          exams={exams}
          totalExamsCount={totalExamsCount}
          totalAttemptsCount={totalAttemptsCount}
        />
      </div>
    </main>
  )
}
