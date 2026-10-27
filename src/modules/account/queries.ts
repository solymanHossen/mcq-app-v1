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
  }

  return {
    ...user,
    recentAttempts,
    xpTotal,
  }
})
