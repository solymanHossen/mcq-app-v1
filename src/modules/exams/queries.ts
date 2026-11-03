import { prisma } from "@/lib/prisma"
import type { ExamStatus, Prisma } from "@/prisma/generated/prisma/client"

export const EXAM_PAGE_SIZE = 20

export async function listExams(opts: {
  teacherId: string
  status?: ExamStatus
  page?: number
  search?: string
}) {
  const page = Math.max(1, opts.page ?? 1)
  const search = opts.search?.trim()
  const where: Prisma.ExamWhereInput = {
    teacherId: opts.teacherId,
    ...(opts.status ? { status: opts.status } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
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

export type PopularHeroExam = {
  id: string
  title: string
  durationMinutes: number
  passingMarks: number | null
  teacherName: string
  institution: string | null
  totalAttempts: number
  questionCount: number
}

export async function getPopularHeroExams(limit = 2): Promise<PopularHeroExam[]> {
  try {
    const exams = await prisma.exam.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        durationMinutes: true,
        passingMarks: true,
        teacher: {
          select: {
            id: true,
            name: true,
            institution: true,
          },
        },
        _count: {
          select: {
            attempts: true,
            examQuestions: true,
          },
        },
      },
      orderBy: [
        { attempts: { _count: "desc" } },
        { createdAt: "desc" },
      ],
      take: limit,
    })

    return exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      durationMinutes: exam.durationMinutes,
      passingMarks: exam.passingMarks,
      teacherName: exam.teacher?.name || "Faculty Instructor",
      institution: exam.teacher?.institution || null,
      totalAttempts: exam._count.attempts,
      questionCount: exam._count.examQuestions,
    }))
  } catch (error) {
    console.error("Failed to fetch popular hero exams:", error)
    return []
  }
}

