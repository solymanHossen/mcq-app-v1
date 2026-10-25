"use server"

import { redirect } from "next/navigation"
import { safeRevalidatePath } from "@/lib/safe-revalidate"
import { prisma } from "@/lib/db"
import { assertRole, assertOwner, type CurrentUser } from "@/lib/auth/guards"
import { examSchema } from "@/lib/validators/exam"

async function requireExamOwner(examId: string, user: CurrentUser) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } })
  if (!exam) throw new Error("Exam not found")
  assertOwner(user, exam.teacherId)
  return exam
}

function parseExamFormData(formData: FormData) {
  const raw = Object.fromEntries(formData)
  return examSchema.safeParse({
    ...raw,
    // Native checkboxes are omitted from FormData entirely when unchecked —
    // convert presence to an explicit boolean before Zod sees it.
    shuffleQuestions: formData.get("shuffleQuestions") === "on",
    shuffleOptions: formData.get("shuffleOptions") === "on",
    webcamMonitoringRequired: formData.get("webcamMonitoringRequired") === "on",
  })
}

export type ExamFormState = { error: string } | { success: true } | undefined

// ─── Create ────────────────────────────────────────────
export async function createExamAction(
  _state: ExamFormState,
  formData: FormData
): Promise<ExamFormState> {
  const user = await assertRole("TEACHER", "ADMIN")

  const parsed = parseExamFormData(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const exam = await prisma.exam.create({
    data: {
      teacherId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      durationMinutes: parsed.data.durationMinutes,
      maxAttempts: parsed.data.maxAttempts,
      passingMarks: parsed.data.passingMarks,
      startTime: parsed.data.startTime ? new Date(parsed.data.startTime) : null,
      endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : null,
      shuffleQuestions: parsed.data.shuffleQuestions,
      shuffleOptions: parsed.data.shuffleOptions,
      webcamMonitoringRequired: parsed.data.webcamMonitoringRequired,
      violationReviewThreshold: parsed.data.violationReviewThreshold,
    },
  })

  safeRevalidatePath("/teacher/exams")
  redirect(`/teacher/exams/${exam.id}`)
}

// ─── Update (DRAFT only — see status-transition rules below) ──
export async function updateExamAction(
  examId: string,
  _state: ExamFormState,
  formData: FormData
): Promise<ExamFormState> {
  const user = await assertRole("TEACHER", "ADMIN")
  const exam = await requireExamOwner(examId, user)

  if (exam.status !== "DRAFT") {
    return {
      error:
        "This exam is published or archived and can no longer be edited.",
    }
  }

  const parsed = parseExamFormData(formData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  await prisma.exam.update({
    where: { id: examId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      durationMinutes: parsed.data.durationMinutes,
      maxAttempts: parsed.data.maxAttempts,
      passingMarks: parsed.data.passingMarks,
      startTime: parsed.data.startTime ? new Date(parsed.data.startTime) : null,
      endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : null,
      shuffleQuestions: parsed.data.shuffleQuestions,
      shuffleOptions: parsed.data.shuffleOptions,
      webcamMonitoringRequired: parsed.data.webcamMonitoringRequired,
      violationReviewThreshold: parsed.data.violationReviewThreshold,
    },
  })

  safeRevalidatePath(`/teacher/exams/${examId}`)
  return { success: true }
}

// ─── Status workflow: DRAFT -> PUBLISHED -> ARCHIVED ───
// A published exam is read-only (see updateExamAction and
// actions/exam-question.actions.ts) — the only further transition is to
// ARCHIVED. There's no "unpublish": once students may have seen it, its
// content must stay exactly as it was.
export async function publishExamAction(examId: string) {
  const user = await assertRole("TEACHER", "ADMIN")
  const exam = await requireExamOwner(examId, user)

  if (exam.status !== "DRAFT") {
    return { error: "Only a draft exam can be published" }
  }

  const questionCount = await prisma.examQuestion.count({ where: { examId } })
  if (questionCount === 0) {
    return { error: "Add at least one question before publishing" }
  }

  await prisma.exam.update({
    where: { id: examId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  })

  safeRevalidatePath("/teacher/exams")
  safeRevalidatePath(`/teacher/exams/${examId}`)
  return { success: true }
}

export async function archiveExamAction(examId: string) {
  const user = await assertRole("TEACHER", "ADMIN")
  const exam = await requireExamOwner(examId, user)

  if (exam.status === "ARCHIVED") {
    return { error: "This exam is already archived" }
  }

  await prisma.exam.update({
    where: { id: examId },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  })

  safeRevalidatePath("/teacher/exams")
  safeRevalidatePath(`/teacher/exams/${examId}`)
  return { success: true }
}

// ─── Delete (DRAFT only — a published/archived exam is kept forever) ──
export async function deleteExamAction(examId: string) {
  const user = await assertRole("TEACHER", "ADMIN")
  const exam = await requireExamOwner(examId, user)

  if (exam.status !== "DRAFT") {
    return {
      error: "Only a draft exam can be deleted — archive this one instead.",
    }
  }

  await prisma.exam.delete({ where: { id: examId } })

  safeRevalidatePath("/teacher/exams")
  redirect("/teacher/exams")
}
