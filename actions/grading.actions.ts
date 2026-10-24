"use server"

import { prisma } from "@/lib/db"
import { assertRole, assertOwner } from "@/lib/auth/guards"
import { safeRevalidatePath } from "@/lib/safe-revalidate"
import { applyCorrectionAndRegrade } from "@/lib/grading/regrade"
import {
  examQuestionCorrectionSchema,
  examQuestionMarksSchema,
} from "@/lib/validators/grading"

async function requireExamOwner(examId: string) {
  const user = await assertRole("TEACHER", "ADMIN")
  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) throw new Error("Exam not found")
  assertOwner(user, exam.teacherId)
  return { user, exam }
}

// ─── Post-publication answer-key correction (narrow, audited) ──
export async function correctExamQuestionAction(
  examId: string,
  examQuestionId: string,
  _state: unknown,
  formData: FormData
) {
  const { user, exam } = await requireExamOwner(examId)

  if (exam.status !== "PUBLISHED") {
    return {
      error:
        "This exam isn't published yet — edit the question directly instead of correcting it.",
    }
  }

  const examQuestion = await prisma.examQuestion.findUnique({
    where: { id: examQuestionId },
  })
  if (!examQuestion || examQuestion.examId !== examId) {
    return { error: "That question isn't part of this exam" }
  }

  const raw = Object.fromEntries(formData)
  const parsed = examQuestionCorrectionSchema.safeParse({
    ...raw,
    isCancelled: formData.get("isCancelled") === "on",
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid correction" }
  }

  const { regradedCount } = await applyCorrectionAndRegrade({
    examId,
    examQuestionId,
    correction: {
      correctOption: parsed.data.correctOption,
      isCancelled: parsed.data.isCancelled,
    },
    reason: parsed.data.reason,
    actorId: user.id,
  })

  safeRevalidatePath(`/teacher/exams/${examId}/results`)
  return { success: true, regradedCount }
}

// ─── Per-question marks configuration (DRAFT only) ──────────────
export async function updateExamQuestionMarksAction(
  examId: string,
  examQuestionId: string,
  _state: unknown,
  formData: FormData
) {
  const { exam } = await requireExamOwner(examId)

  if (exam.status !== "DRAFT") {
    return { error: "This exam is locked and its marks can no longer change." }
  }

  const examQuestion = await prisma.examQuestion.findUnique({
    where: { id: examQuestionId },
  })
  if (!examQuestion || examQuestion.examId !== examId) {
    return { error: "That question isn't part of this exam" }
  }

  const parsed = examQuestionMarksSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  await prisma.examQuestion.update({
    where: { id: examQuestionId },
    data: {
      marks: parsed.data.marks,
      negativeMarks: parsed.data.negativeMarks,
    },
  })

  safeRevalidatePath(`/teacher/exams/${examId}`)
  return { success: true }
}

// ─── Result & answer-key disclosure (two independent, one-way gates) ──
export async function publishExamResultsAction(examId: string) {
  const { user, exam } = await requireExamOwner(examId)

  if (exam.status !== "PUBLISHED") {
    return { error: "Only a published exam has results to publish" }
  }

  const { count } = await prisma.examResult.updateMany({
    where: {
      status: "PROVISIONAL",
      attempt: { examId },
    },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  })

  await prisma.gradingAuditLog.create({
    data: {
      examId,
      action: "RESULTS_PUBLISHED",
      actorId: user.id,
      metadata: { count },
    },
  })

  safeRevalidatePath(`/teacher/exams/${examId}/results`)
  return { success: true, published: count }
}

export async function releaseAnswerKeyAction(examId: string) {
  const { exam } = await requireExamOwner(examId)

  if (exam.answerKeyReleased) {
    return { error: "The answer key has already been released" }
  }

  await prisma.exam.update({
    where: { id: examId },
    data: { answerKeyReleased: true, answerKeyReleasedAt: new Date() },
  })

  safeRevalidatePath(`/teacher/exams/${examId}/results`)
  return { success: true }
}
