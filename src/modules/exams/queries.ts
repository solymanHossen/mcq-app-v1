import { prisma } from "@/lib/db"
import type { ExamStatus, Prisma } from "@/prisma/generated/prisma/client"

export const EXAM_PAGE_SIZE = 20

export async function listExams(opts: {
  teacherId: string
  status?: ExamStatus
  page?: number
}) {
  const page = Math.max(1, opts.page ?? 1)
  const where: Prisma.ExamWhereInput = {
    teacherId: opts.teacherId,
    ...(opts.status ? { status: opts.status } : {}),
  }

  const [items, total] = await prisma.$transaction([
    prisma.exam.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * EXAM_PAGE_SIZE,
      take: EXAM_PAGE_SIZE,
      include: { _count: { select: { examQuestions: true } } },
    }),
    prisma.exam.count({ where }),
  ])

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / EXAM_PAGE_SIZE)),
  }
}

export function getExamWithQuestions(examId: string) {
  return prisma.exam.findUnique({
    where: { id: examId },
    include: {
      examQuestions: {
        orderBy: { order: "asc" },
        include: { question: { select: { id: true, status: true } } },
      },
      _count: { select: { examQuestions: true } },
    },
  })
}

export function getExamTotalMarks(
  examQuestions: { marks: number }[]
) {
  return examQuestions.reduce((sum, q) => sum + q.marks, 0)
}
