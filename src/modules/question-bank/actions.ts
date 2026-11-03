"use server"

import Papa from "papaparse"
import { redirect } from "next/navigation"
import { safeRevalidatePath } from "@/lib/safe-revalidate"
import { prisma } from "@/lib/prisma"
import { assertRole, assertOwner, TEACHER_ROLES, type CurrentUser } from "@/lib/authorization"
import { computeQuestionContentHash } from "@/modules/question-bank/content-hash"
import { findDuplicateQuestion } from "@/modules/question-bank/queries"
import {
  questionSchema,
  questionImportRowSchema,
  questionReportSchema,
  questionReportResolutionSchema,
} from "@/modules/question-bank/validators"

async function requireQuestionOwner(questionId: string, user: CurrentUser) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  })
  if (!question) throw new Error("Question not found")
  assertOwner(user, question.teacherId)
  return question
}

export type QuestionFormState =
  | { error: string }
  | { success: true }
  | {
      duplicateWarning: true
      duplicateQuestionId: string
      duplicateText: string
    }
  | undefined

// ─── Create ────────────────────────────────────────────
export async function createQuestionAction(
  _state: QuestionFormState,
  formData: FormData
): Promise<QuestionFormState> {
  const user = await assertRole(...TEACHER_ROLES)

  const parsed = questionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const contentHash = computeQuestionContentHash(parsed.data)
  const confirmDuplicate = formData.get("confirmDuplicate") === "true"

  if (!confirmDuplicate) {
    const duplicate = await findDuplicateQuestion(user.id, contentHash)
    if (duplicate) {
      return {
        duplicateWarning: true,
        duplicateQuestionId: duplicate.id,
        duplicateText: duplicate.questionText,
      }
    }
  }

  const question = await prisma.question.create({
    data: { ...parsed.data, teacherId: user.id, contentHash },
  })

  safeRevalidatePath("/teacher/questions")
  redirect(`/teacher/questions/${question.id}`)
}

// ─── Update ────────────────────────────────────────────
export async function updateQuestionAction(
  questionId: string,
  _state: QuestionFormState,
  formData: FormData
): Promise<QuestionFormState> {
  const user = await assertRole(...TEACHER_ROLES)
  const existing = await requireQuestionOwner(questionId, user)

  const parsed = questionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const contentHash = computeQuestionContentHash(parsed.data)
  const confirmDuplicate = formData.get("confirmDuplicate") === "true"

  if (!confirmDuplicate && contentHash !== existing.contentHash) {
    const duplicate = await findDuplicateQuestion(
      user.id,
      contentHash,
      questionId
    )
    if (duplicate) {
      return {
        duplicateWarning: true,
        duplicateQuestionId: duplicate.id,
        duplicateText: duplicate.questionText,
      }
    }
  }

  await prisma.question.update({
    where: { id: questionId },
    data: { ...parsed.data, contentHash },
  })

  safeRevalidatePath("/teacher/questions")
  safeRevalidatePath(`/teacher/questions/${questionId}`)
  return { success: true }
}

// ─── Status transitions ────────────────────────────────
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["ACTIVE"],
  ACTIVE: ["ARCHIVED"],
  ARCHIVED: ["ACTIVE"],
}

export async function setQuestionStatusAction(
  questionId: string,
  nextStatus: "DRAFT" | "ACTIVE" | "ARCHIVED"
) {
  const user = await assertRole(...TEACHER_ROLES)
  const existing = await requireQuestionOwner(questionId, user)

  if (!ALLOWED_TRANSITIONS[existing.status]?.includes(nextStatus)) {
    return {
      error: `Can't move a question from ${existing.status} to ${nextStatus}`,
    }
  }

  await prisma.question.update({
    where: { id: questionId },
    data: { status: nextStatus },
  })

  safeRevalidatePath("/teacher/questions")
  safeRevalidatePath(`/teacher/questions/${questionId}`)
  return { success: true }
}

export async function bulkSetQuestionStatusAction(
  questionIds: string[],
  nextStatus: "DRAFT" | "ACTIVE" | "ARCHIVED"
): Promise<{ success: true; count: number } | { error: string }> {
  const user = await assertRole(...TEACHER_ROLES)
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return { error: "No questions selected" }
  }

  const questions = await prisma.question.findMany({
    where: {
      id: { in: questionIds },
      teacherId: user.id,
    },
    select: { id: true, status: true },
  })

  if (questions.length === 0) {
    return { error: "No matching questions found" }
  }

  // Determine which questions can legally transition
  const validIds = questions
    .filter(
      (q) =>
        ALLOWED_TRANSITIONS[q.status]?.includes(nextStatus) ||
        q.status === nextStatus
    )
    .map((q) => q.id)

  if (validIds.length === 0) {
    return {
      error: `None of the selected questions can be moved to ${nextStatus.toLowerCase()}`,
    }
  }

  await prisma.question.updateMany({
    where: {
      id: { in: validIds },
      teacherId: user.id,
    },
    data: { status: nextStatus },
  })

  safeRevalidatePath("/teacher/questions")
  return { success: true, count: validIds.length }
}

export async function bulkPublishFilteredQuestionsAction(filters: {
  subject?: string
  topic?: string
  difficulty?: "EASY" | "MEDIUM" | "HARD"
  search?: string
}): Promise<{ success: true; count: number } | { error: string }> {
  const user = await assertRole(...TEACHER_ROLES)

  const where = {
    teacherId: user.id,
    status: "DRAFT" as const,
    ...(filters.subject ? { subject: filters.subject } : {}),
    ...(filters.topic ? { topic: filters.topic } : {}),
    ...(filters.difficulty ? { difficulty: filters.difficulty } : {}),
    ...(filters.search
      ? { questionText: { contains: filters.search, mode: "insensitive" as const } }
      : {}),
  }

  const result = await prisma.question.updateMany({
    where,
    data: { status: "ACTIVE" },
  })

  safeRevalidatePath("/teacher/questions")
  return { success: true, count: result.count }
}

export async function bulkDeleteQuestionsAction(questionIds: string[]): Promise<
  | { success: true; deletedCount: number; skippedCount: number }
  | { error: string }
> {
  const user = await assertRole(...TEACHER_ROLES)
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return { error: "No questions selected" }
  }

  // Ensure questions belong to this teacher
  const questions = await prisma.question.findMany({
    where: {
      id: { in: questionIds },
      teacherId: user.id,
    },
    select: { id: true },
  })
  const ownedIds = questions.map((q) => q.id)
  if (ownedIds.length === 0) {
    return { error: "No questions found to delete" }
  }

  // Check which questions are used in exams
  const usedQuestions = await prisma.examQuestion.findMany({
    where: { questionId: { in: ownedIds } },
    select: { questionId: true },
  })
  const usedIds = new Set(usedQuestions.map((q) => q.questionId))
  const deletableIds = ownedIds.filter((id) => !usedIds.has(id))

  if (deletableIds.length === 0) {
    return {
      error: `All selected questions are currently linked to exams and cannot be deleted. Archive them instead.`,
    }
  }

  await prisma.question.deleteMany({
    where: {
      id: { in: deletableIds },
      teacherId: user.id,
    },
  })

  safeRevalidatePath("/teacher/questions")
  return {
    success: true,
    deletedCount: deletableIds.length,
    skippedCount: usedIds.size,
  }
}

// ─── Delete ────────────────────────────────────────────
export async function deleteQuestionAction(questionId: string) {
  const user = await assertRole(...TEACHER_ROLES)
  await requireQuestionOwner(questionId, user)

  const usageCount = await prisma.examQuestion.count({
    where: { questionId },
  })
  if (usageCount > 0) {
    return {
      error: `This question is used in ${usageCount} exam${usageCount === 1 ? "" : "s"}. Archive it instead of deleting.`,
    }
  }

  await prisma.question.delete({ where: { id: questionId } })

  safeRevalidatePath("/teacher/questions")
  redirect("/teacher/questions")
}

// ─── Reporting & correction workflow ───────────────────
export async function createQuestionReportAction(
  questionId: string,
  _state: unknown,
  formData: FormData
) {
  const user = await assertRole(...TEACHER_ROLES)
  await requireQuestionOwner(questionId, user)

  const parsed = questionReportSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  await prisma.questionReport.create({
    data: {
      questionId,
      reportedById: user.id,
      reason: parsed.data.reason,
    },
  })

  safeRevalidatePath(`/teacher/questions/${questionId}`)
  return { success: true }
}

export async function resolveQuestionReportAction(
  reportId: string,
  _state: unknown,
  formData: FormData
) {
  const user = await assertRole(...TEACHER_ROLES)

  const report = await prisma.questionReport.findUnique({
    where: { id: reportId },
    include: { question: { select: { teacherId: true } } },
  })
  if (!report) return { error: "Report not found" }
  assertOwner(user, report.question.teacherId)

  const parsed = questionReportResolutionSchema.safeParse(
    Object.fromEntries(formData)
  )
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  await prisma.questionReport.update({
    where: { id: reportId },
    data: {
      status: parsed.data.status,
      resolutionNote: parsed.data.resolutionNote,
      resolvedById: user.id,
      resolvedAt: new Date(),
    },
  })

  safeRevalidatePath(`/teacher/questions/${report.questionId}`)
  return { success: true }
}

// ─── Bulk import ────────────────────────────────────────
export type ImportRowError = { row: number; errors: string[] }
export type ImportSummary = {
  totalRows: number
  imported: number
  skippedDuplicates: number
  invalidRows: ImportRowError[]
}

export async function bulkImportQuestionsAction(
  _state: ImportSummary | { error: string } | undefined,
  formData: FormData
): Promise<ImportSummary | { error: string }> {
  const user = await assertRole(...TEACHER_ROLES)

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file to import" }
  }

  const text = await file.text()
  const parsedCsv = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsedCsv.errors.length > 0) {
    return { error: `Could not parse CSV: ${parsedCsv.errors[0].message}` }
  }

  const rows = parsedCsv.data
  const invalidRows: ImportRowError[] = []
  const toInsert: {
    data: ReturnType<typeof buildQuestionData>
    contentHash: string
  }[] = []
  const seenHashesInBatch = new Set<string>()

  rows.forEach((row, index) => {
    const parsed = questionImportRowSchema.safeParse(row)
    if (!parsed.success) {
      invalidRows.push({
        row: index + 2, // +1 for 0-index, +1 for the header row
        errors: parsed.error.issues.map(
          (i) => `${i.path.join(".") || "row"}: ${i.message}`
        ),
      })
      return
    }

    const contentHash = computeQuestionContentHash(parsed.data)
    if (seenHashesInBatch.has(contentHash)) {
      invalidRows.push({
        row: index + 2,
        errors: ["Duplicate of another row in this same file"],
      })
      return
    }
    seenHashesInBatch.add(contentHash)

    toInsert.push({ data: buildQuestionData(parsed.data), contentHash })
  })

  if (toInsert.length === 0) {
    return {
      totalRows: rows.length,
      imported: 0,
      skippedDuplicates: 0,
      invalidRows,
    }
  }

  const existing = await prisma.question.findMany({
    where: {
      teacherId: user.id,
      contentHash: { in: toInsert.map((r) => r.contentHash) },
    },
    select: { contentHash: true },
  })
  const existingHashes = new Set(existing.map((e) => e.contentHash))

  const rowsToCreate = toInsert.filter(
    (r) => !existingHashes.has(r.contentHash)
  )
  const skippedDuplicates = toInsert.length - rowsToCreate.length

  const publishImmediately =
    formData.get("publishImmediately") === "true" ||
    formData.get("publishImmediately") === "on"
  const targetStatus = publishImmediately ? "ACTIVE" : "DRAFT"

  await prisma.$transaction(
    rowsToCreate.map((r) =>
      prisma.question.create({
        data: {
          ...r.data,
          status: targetStatus,
          teacherId: user.id,
          contentHash: r.contentHash,
        },
      })
    )
  )

  safeRevalidatePath("/teacher/questions")

  return {
    totalRows: rows.length,
    imported: rowsToCreate.length,
    skippedDuplicates,
    invalidRows,
  }
}

function buildQuestionData(data: {
  subject: string
  topic: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: "A" | "B" | "C" | "D"
  explanation?: string
  imageUrl?: string
  codeSnippet?: string
  codeLanguage?: string
}) {
  return data
}
