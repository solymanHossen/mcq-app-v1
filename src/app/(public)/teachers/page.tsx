import type { Metadata } from "next"
import {
  TeacherDirectoryClient,
  type TeacherData,
  type DirectoryStats,
} from "./teacher-directory-client"
import { prisma } from "@/lib/prisma"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = {
  title: `Teacher Directory — ${APP_NAME}`,
  description:
    "Browse registered teachers and examiners, explore active published exams, and practice with verified academic question banks.",
}

// @next-codemod-ignore Cache Components adoption
export const instant = false

export default async function TeachersPage() {
  const [
    rawTeachers,
    totalTeachers,
    verifiedTeachers,
    totalPublishedExams,
    totalQuestions,
    totalAttempts,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        name: true,
        email: true,
        teacherVerificationStatus: true,
        createdAt: true,
        exams: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            durationMinutes: true,
            maxAttempts: true,
            _count: {
              select: {
                attempts: true,
                examQuestions: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        questions: {
          select: {
            subject: true,
            topic: true,
          },
          distinct: ["subject"],
        },
        _count: {
          select: {
            exams: true,
            questions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.user.count({
      where: { role: "TEACHER", teacherVerificationStatus: "VERIFIED" },
    }),
    prisma.exam.count({ where: { status: "PUBLISHED" } }),
    prisma.question.count(),
    prisma.examAttempt.count(),
  ])

  // Transform into pure serializable real teacher data
  const teachers: TeacherData[] = rawTeachers.map((t) => {
    const publishedExams = t.exams.filter((e) => e.status === "PUBLISHED")
    const totalAttemptsOnExams = t.exams.reduce(
      (sum, e) => sum + e._count.attempts,
      0
    )

    // Extract real subjects from authored questions
    const subjects = t.questions
      .map((q) => q.subject.trim())
      .filter((s, idx, arr) => s.length > 0 && arr.indexOf(s) === idx)

    const initials =
      t.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "T"

    return {
      id: t.id,
      name: t.name,
      email: t.email,
      initials,
      isVerified: t.teacherVerificationStatus === "VERIFIED",
      verificationStatus: t.teacherVerificationStatus,
      createdAt: t.createdAt.toISOString(),
      totalExams: t._count.exams,
      publishedExamsCount: publishedExams.length,
      totalQuestions: t._count.questions,
      totalAttempts: totalAttemptsOnExams,
      subjects,
      publishedExams: publishedExams.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        durationMinutes: e.durationMinutes,
        questionsCount: e._count.examQuestions,
        attemptsCount: e._count.attempts,
      })),
    }
  })

  const stats: DirectoryStats = {
    totalTeachers,
    verifiedTeachers,
    totalPublishedExams,
    totalQuestions,
    totalAttempts,
  }

  return (
    <div className="pt-20 pb-16 sm:pt-28 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <TeacherDirectoryClient teachers={teachers} stats={stats} />
      </div>
    </div>
  )
}
