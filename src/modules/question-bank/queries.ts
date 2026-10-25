import { prisma } from "@/lib/prisma"
import type {
  Difficulty,
  QuestionStatus,
  Prisma,
} from "@/prisma/generated/prisma/client"

export const QUESTION_PAGE_SIZE = 20

export type QuestionSort = "newest" | "oldest" | "subject"

export type QuestionFilters = {
  subject?: string
  topic?: string
  difficulty?: Difficulty
  status?: QuestionStatus
  search?: string
}

export async function listQuestions(opts: {
  teacherId: string
  filters?: QuestionFilters
  page?: number
  sort?: QuestionSort
}) {
  const page = Math.max(1, opts.page ?? 1)
  const f = opts.filters ?? {}

  const where: Prisma.QuestionWhereInput = {
    teacherId: opts.teacherId,
    ...(f.subject ? { subject: f.subject } : {}),
    ...(f.topic ? { topic: f.topic } : {}),
    ...(f.difficulty ? { difficulty: f.difficulty } : {}),
    ...(f.status ? { status: f.status } : {}),
    ...(f.search
      ? { questionText: { contains: f.search, mode: "insensitive" } }
      : {}),
  }

  const orderBy: Prisma.QuestionOrderByWithRelationInput =
    opts.sort === "oldest"
      ? { createdAt: "asc" }
      : opts.sort === "subject"
        ? { subject: "asc" }
        : { createdAt: "desc" }

  const [items, total] = await prisma.$transaction([
    prisma.question.findMany({
      where,
      orderBy,
      skip: (page - 1) * QUESTION_PAGE_SIZE,
      take: QUESTION_PAGE_SIZE,
      include: { _count: { select: { examQuestions: true, reports: true } } },
    }),
    prisma.question.count({ where }),
  ])

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / QUESTION_PAGE_SIZE)),
  }
}

export async function getDistinctSubjects(teacherId: string) {
  const rows = await prisma.question.findMany({
    where: { teacherId },
    select: { subject: true },
    distinct: ["subject"],
    orderBy: { subject: "asc" },
  })
  return rows.map((r) => r.subject)
}

export async function getDistinctTopics(teacherId: string, subject?: string) {
  const rows = await prisma.question.findMany({
    where: { teacherId, ...(subject ? { subject } : {}) },
    select: { topic: true },
    distinct: ["topic"],
    orderBy: { topic: "asc" },
  })
  return rows.map((r) => r.topic)
}

export function getQuestionById(id: string) {
  return prisma.question.findUnique({
    where: { id },
    include: {
      reports: { orderBy: { createdAt: "desc" } },
      _count: { select: { examQuestions: true } },
    },
  })
}

export async function listActiveUnusedQuestions(opts: {
  teacherId: string
  examId: string
  filters?: QuestionFilters
  page?: number
}) {
  const page = Math.max(1, opts.page ?? 1)
  const f = opts.filters ?? {}

  const where: Prisma.QuestionWhereInput = {
    teacherId: opts.teacherId,
    status: "ACTIVE",
    examQuestions: { none: { examId: opts.examId } },
    ...(f.subject ? { subject: f.subject } : {}),
    ...(f.topic ? { topic: f.topic } : {}),
    ...(f.difficulty ? { difficulty: f.difficulty } : {}),
    ...(f.search
      ? { questionText: { contains: f.search, mode: "insensitive" } }
      : {}),
  }

  const [items, total] = await prisma.$transaction([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * QUESTION_PAGE_SIZE,
      take: QUESTION_PAGE_SIZE,
    }),
    prisma.question.count({ where }),
  ])

  return {
    items,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / QUESTION_PAGE_SIZE)),
  }
}

export async function findDuplicateQuestion(
  teacherId: string,
  contentHash: string,
  excludeId?: string
) {
  return prisma.question.findFirst({
    where: {
      teacherId,
      contentHash,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, questionText: true },
  })
}
