import { connection } from "next/server"
import { requireRole, TEACHER_ROLES } from "@/lib/authorization"
import { prisma } from "@/lib/prisma"
import { TeacherResultsClient } from "./teacher-results-client"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export const metadata = {
  title: "Results & Student Cohorts | Teacher Portal",
  description:
    "Comprehensive student submissions, scoring performance, leaderboard rankings, and exam cohort evaluation.",
}

export interface TeacherResultItem {
  id: string
  attemptNumber: number
  status: string
  startedAt: string
  submittedAt: string | null
  student: {
    id: string
    name: string
    email: string
    isGuest: boolean
  }
  exam: {
    id: string
    title: string
    status: string
    durationMinutes: number
    passingMarks: number | null
  }
  result: {
    id: string
    status: string
    totalMarks: number
    obtainedMarks: number
    correctCount: number
    incorrectCount: number
    skippedCount: number
    accuracy: number
    isPassed: boolean | null
    gradedAt: string
  } | null
}

export interface TeacherExamOption {
  id: string
  title: string
  status: string
  durationMinutes: number
  passingMarks: number | null
  createdAt: string
  attemptsCount: number
  questionsCount: number
}

export default async function TeacherResultsPage() {
  const teacher = await requireRole(...TEACHER_ROLES)
  await connection()

  // 1. Fetch all exams authored by this teacher
  const dbExams = await prisma.exam.findMany({
    where: { teacherId: teacher.id },
    select: {
      id: true,
      title: true,
      status: true,
      durationMinutes: true,
      passingMarks: true,
      createdAt: true,
      _count: {
        select: {
          attempts: true,
          examQuestions: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // 2. Fetch all student attempts across all teacher's exams
  const dbAttempts = await prisma.examAttempt.findMany({
    where: {
      exam: { teacherId: teacher.id },
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          isGuest: true,
        },
      },
      exam: {
        select: {
          id: true,
          title: true,
          status: true,
          durationMinutes: true,
          passingMarks: true,
        },
      },
      result: {
        select: {
          id: true,
          status: true,
          totalMarks: true,
          obtainedMarks: true,
          correctCount: true,
          incorrectCount: true,
          skippedCount: true,
          accuracy: true,
          isPassed: true,
          gradedAt: true,
        },
      },
    },
    orderBy: [
      { submittedAt: "desc" },
      { startedAt: "desc" },
    ],
    take: 2000,
  })

  // Format serializable data
  const exams: TeacherExamOption[] = dbExams.map((e) => ({
    id: e.id,
    title: e.title,
    status: e.status,
    durationMinutes: e.durationMinutes,
    passingMarks: e.passingMarks,
    createdAt: e.createdAt.toISOString(),
    attemptsCount: e._count.attempts,
    questionsCount: e._count.examQuestions,
  }))

  const attempts: TeacherResultItem[] = dbAttempts.map((a) => ({
    id: a.id,
    attemptNumber: a.attemptNumber,
    status: a.status,
    startedAt: a.startedAt.toISOString(),
    submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
    student: {
      id: a.student.id,
      name: a.student.name,
      email: a.student.email,
      isGuest: a.student.isGuest,
    },
    exam: {
      id: a.exam.id,
      title: a.exam.title,
      status: a.exam.status,
      durationMinutes: a.exam.durationMinutes,
      passingMarks: a.exam.passingMarks,
    },
    result: a.result
      ? {
          id: a.result.id,
          status: a.result.status,
          totalMarks: a.result.totalMarks,
          obtainedMarks: a.result.obtainedMarks,
          correctCount: a.result.correctCount,
          incorrectCount: a.result.incorrectCount,
          skippedCount: a.result.skippedCount,
          accuracy: a.result.accuracy,
          isPassed: a.result.isPassed,
          gradedAt: a.result.gradedAt.toISOString(),
        }
      : null,
  }))

  return (
    <div className="flex w-full min-w-0 flex-col gap-6 pb-12 sm:gap-8 sm:pb-16">
      <TeacherResultsClient exams={exams} attempts={attempts} />
    </div>
  )
}
