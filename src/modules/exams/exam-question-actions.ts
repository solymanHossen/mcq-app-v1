"use server"

import { safeRevalidatePath } from "@/lib/safe-revalidate"
import { prisma } from "@/lib/prisma"
import { assertRole, assertOwner, TEACHER_ROLES, type CurrentUser } from "@/lib/authorization"
import { addQuestionsToExamSchema } from "@/modules/exams/validators"

async function requireDraftExamOwner(examId: string, user: CurrentUser) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) return { error: "Exam not found" as const }
  assertOwner(user, exam.teacherId)
  if (exam.status !== "DRAFT") {
    return { error: "This exam's question list is locked." as const }
  }
  return { exam }
}

// ─── Add bank questions to an exam (snapshotted immediately) ──
export async function addQuestionsToExamAction(
  examId: string,
  questionIds: string[]
) {
  const user = await assertRole(...TEACHER_ROLES)
  const check = await requireDraftExamOwner(examId, user)
  if ("error" in check) return { error: check.error }
  const { exam } = check

  const parsed = addQuestionsToExamSchema.safeParse({ questionIds })
  if (!parsed.success) return { error: "No questions selected" }

  // Every question must belong to this same teacher and be ACTIVE — a
  // teacher can never pull another teacher's bank question into their exam,
  // even by guessing an id, and a draft/archived question can't be used.
  const questions = await prisma.question.findMany({
    where: {
      id: { in: parsed.data.questionIds },
      teacherId: exam.teacherId,
      status: "ACTIVE",
    },
  })

  const alreadyAdded = await prisma.examQuestion.findMany({
    where: { examId, questionId: { in: questions.map((q) => q.id) } },
    select: { questionId: true },
  })
  const alreadyAddedIds = new Set(alreadyAdded.map((a) => a.questionId))
  const toAdd = questions.filter((q) => !alreadyAddedIds.has(q.id))

  if (toAdd.length === 0) {
    return { error: "Those questions are unavailable or already in this exam" }
  }

  const currentMax = await prisma.examQuestion.aggregate({
    where: { examId },
    _max: { order: true },
  })
  let nextOrder = (currentMax._max.order ?? -1) + 1

  await prisma.$transaction(
    toAdd.map((q) =>
      prisma.examQuestion.create({
        data: {
          examId,
          questionId: q.id,
          order: nextOrder++,
          questionTextSnapshot: q.questionText,
          optionASnapshot: q.optionA,
          optionBSnapshot: q.optionB,
          optionCSnapshot: q.optionC,
          optionDSnapshot: q.optionD,
          correctOptionSnapshot: q.correctOption,
          explanationSnapshot: q.explanation,
        },
      })
    )
  )

  safeRevalidatePath(`/teacher/exams/${examId}`)
  return { success: true, added: toAdd.length }
}

// ─── Remove a question, then close the order gap ───────
export async function removeQuestionFromExamAction(
  examId: string,
  examQuestionId: string
) {
  const user = await assertRole(...TEACHER_ROLES)
  const check = await requireDraftExamOwner(examId, user)
  if ("error" in check) return { error: check.error }

  const remaining = await prisma.examQuestion.findMany({
    where: { examId, id: { not: examQuestionId } },
    orderBy: { order: "asc" },
  })

  await prisma.$transaction([
    prisma.examQuestion.delete({ where: { id: examQuestionId } }),
    ...remaining.map((eq, index) =>
      prisma.examQuestion.update({
        where: { id: eq.id },
        data: { order: index },
      })
    ),
  ])

  safeRevalidatePath(`/teacher/exams/${examId}`)
  return { success: true }
}

// ─── Reorder ────────────────────────────────────────────
export async function reorderExamQuestionsAction(
  examId: string,
  orderedExamQuestionIds: string[]
) {
  const user = await assertRole(...TEACHER_ROLES)
  const check = await requireDraftExamOwner(examId, user)
  if ("error" in check) return { error: check.error }

  const current = await prisma.examQuestion.findMany({
    where: { examId },
    select: { id: true },
  })
  const currentIds = new Set(current.map((c) => c.id))

  // The submitted order must be exactly this exam's current question set —
  // never trust it to reorder (or smuggle in) rows from another exam.
  if (
    orderedExamQuestionIds.length !== currentIds.size ||
    !orderedExamQuestionIds.every((id) => currentIds.has(id))
  ) {
    return { error: "That question list is out of date — reload and retry." }
  }

  await prisma.$transaction(
    orderedExamQuestionIds.map((id, index) =>
      prisma.examQuestion.update({ where: { id }, data: { order: index } })
    )
  )

  safeRevalidatePath(`/teacher/exams/${examId}`)
  return { success: true }
}
