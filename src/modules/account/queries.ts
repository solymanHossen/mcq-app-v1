import { cache } from "react"
import { prisma } from "@/lib/prisma"

// Separate from CurrentUser (lib/authorization.ts) on purpose: that type is
// re-fetched on every guarded request, so it only carries the fields guards
// actually need to check. These are display-only and used on one page.
export const getAccountOverview = cache(async (userId: string) => {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      createdAt: true,
      lastLoginAt: true,
      teacherVerificationNote: true,
    },
  })
})

export const getFullProfileData = cache(async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isEmailVerified: true,
      createdAt: true,
      lastLoginAt: true,
      teacherVerificationStatus: true,
      teacherVerificationNote: true,
      streak: {
        select: {
          currentStreak: true,
          longestStreak: true,
          lastActiveDate: true,
        },
      },
      badges: {
        select: {
          id: true,
          badgeKey: true,
          earnedAt: true,
        },
      },
      _count: {
        select: {
          examAttempts: true,
          questions: true,
          exams: true,
          bookmarks: true,
          badges: true,
        },
      },
      subscriptions: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          currentPeriodEnd: true,
          plan: {
            select: {
              name: true,
              billingInterval: true,
            },
          },
        },
      },
    },
  })

  // For students, fetch recent attempts and total XP
  let recentAttempts: Array<{
    id: string
    status: string
    startedAt: Date
    submittedAt: Date | null
    exam: { id: string; title: string }
    result: {
      obtainedMarks: number
      totalMarks: number
      accuracy: number
      isPassed: boolean | null
    } | null
  }> = []

  let xpTotal = 0

  // For teachers, fetch authored exams, total student attempts, and subjects
  let teacherExams: Array<{
    id: string
    title: string
    description: string | null
    status: string
    durationMinutes: number
    attemptsCount: number
    questionsCount: number
  }> = []
  let teacherTotalAttempts = 0
  let teacherSubjects: string[] = []

  // For admins, fetch system overview metrics
  let adminStats: {
    totalUsers: number
    totalPlatformExams: number
    pendingVerifications: number
  } | null = null

  if (user.role === "STUDENT") {
    const [attempts, xpAggregate] = await Promise.all([
      prisma.examAttempt.findMany({
        where: { studentId: userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          startedAt: true,
          submittedAt: true,
          exam: {
            select: {
              id: true,
              title: true,
            },
          },
          result: {
            select: {
              obtainedMarks: true,
              totalMarks: true,
              accuracy: true,
              isPassed: true,
            },
          },
        },
      }),
      prisma.xPTransaction.aggregate({
        where: { studentId: userId },
        _sum: { amount: true },
      }),
    ])

    recentAttempts = attempts
    xpTotal = xpAggregate._sum.amount ?? 0
  } else if (user.role === "TEACHER") {
    const [rawExams, totalAttempts, rawQuestions] = await Promise.all([
      prisma.exam.findMany({
        where: { teacherId: userId },
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          durationMinutes: true,
          _count: {
            select: {
              attempts: true,
              examQuestions: true,
            },
          },
        },
      }),
      prisma.examAttempt.count({
        where: { exam: { teacherId: userId } },
      }),
      prisma.question.findMany({
        where: { teacherId: userId },
        select: { subject: true },
        distinct: ["subject"],
        take: 12,
      }),
    ])

    teacherExams = rawExams.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      status: e.status,
      durationMinutes: e.durationMinutes,
      attemptsCount: e._count.attempts,
      questionsCount: e._count.examQuestions,
    }))
    teacherTotalAttempts = totalAttempts
    teacherSubjects = rawQuestions
      .map((q) => q.subject.trim())
      .filter((s, idx, arr) => s.length > 0 && arr.indexOf(s) === idx)
  } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    const [totalUsers, totalPlatformExams, pendingVerifications] =
      await Promise.all([
        prisma.user.count(),
        prisma.exam.count({ where: { status: "PUBLISHED" } }),
        prisma.user.count({
          where: { role: "TEACHER", teacherVerificationStatus: "PENDING" },
        }),
      ])

    adminStats = {
      totalUsers,
      totalPlatformExams,
      pendingVerifications,
    }
  }

  return {
    ...user,
    recentAttempts,
    xpTotal,
    teacherExams,
    teacherTotalAttempts,
    teacherSubjects,
    adminStats,
  }
})

export type FullProfileData = Awaited<ReturnType<typeof getFullProfileData>>

