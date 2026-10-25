import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }))

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/modules/auth/password"
import { ForbiddenError } from "@/lib/errors"
import {
  reportViolationAction,
  reviewViolationEventAction,
  fileAppealAction,
  resolveAppealAction,
} from "./actions"
import { disqualifyAttemptAction } from "@/modules/grading/actions"

const mockAuth = vi.mocked(auth)

function asUser(user: { id: string; tokenVersion: number }) {
  mockAuth.mockResolvedValue({
    user: { id: user.id, tokenVersion: user.tokenVersion },
    expires: "",
  } as never)
}

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const userIds: string[] = []
const examIds: string[] = []

async function makeUser(role: "TEACHER" | "STUDENT", label: string) {
  const user = await prisma.user.create({
    data: {
      name: label,
      email: `${label}-${suffix}@example.com`,
      passwordHash: await hashPassword("irrelevant"),
      role,
      isEmailVerified: true,
    },
  })
  userIds.push(user.id)
  return user
}

async function makeInProgressAttempt(
  teacherId: string,
  studentId: string,
  opts: { violationReviewThreshold?: number } = {}
) {
  const exam = await prisma.exam.create({
    data: {
      teacherId,
      title: `anti-cheat exam ${suffix}-${Math.random()}`,
      durationMinutes: 60,
      status: "PUBLISHED",
      publishedAt: new Date(),
      violationReviewThreshold: opts.violationReviewThreshold ?? 5,
    },
  })
  examIds.push(exam.id)

  const now = new Date()
  const attempt = await prisma.examAttempt.create({
    data: {
      examId: exam.id,
      studentId,
      attemptNumber: 1,
      startedAt: now,
      deadline: new Date(now.getTime() + 60 * 60_000),
    },
  })

  return { exam, attempt }
}

let teacherA: Awaited<ReturnType<typeof makeUser>>
let teacherB: Awaited<ReturnType<typeof makeUser>>
let studentA: Awaited<ReturnType<typeof makeUser>>
let studentB: Awaited<ReturnType<typeof makeUser>>

beforeAll(async () => {
  teacherA = await makeUser("TEACHER", "ac-teacher-a")
  teacherB = await makeUser("TEACHER", "ac-teacher-b")
  studentA = await makeUser("STUDENT", "ac-student-a")
  studentB = await makeUser("STUDENT", "ac-student-b")
})

afterAll(async () => {
  await prisma.examAttempt.deleteMany({ where: { examId: { in: examIds } } })
  await prisma.exam.deleteMany({ where: { id: { in: examIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
})

describe("reportViolationAction", () => {
  it("records a client-reported event for the student's own attempt", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id)
    asUser(studentA)

    const result = await reportViolationAction({
      attemptId: attempt.id,
      type: "TAB_SWITCH",
      metadata: { awayDurationMs: 2000 },
    })
    expect(result).toEqual({ success: true })

    const events = await prisma.violationEvent.findMany({
      where: { attemptId: attempt.id },
    })
    expect(events).toHaveLength(1)
    expect(events[0].source).toBe("CLIENT_REPORTED")
    expect(events[0].severity).toBe("LOW")
  })

  it("rejects a report for a different student's attempt", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id)
    asUser(studentB)

    const result = await reportViolationAction({
      attemptId: attempt.id,
      type: "TAB_SWITCH",
    })
    expect(result && "error" in result).toBe(true)

    const events = await prisma.violationEvent.findMany({
      where: { attemptId: attempt.id },
    })
    expect(events).toHaveLength(0)
  })

  it("rejects a client claiming a server-only detection type", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id)
    asUser(studentA)

    // SESSION_CONFLICT / SUSPICIOUS_REQUEST_PATTERN aren't in the
    // client-reportable enum at all, so this must fail validation.
    const result = await reportViolationAction({
      attemptId: attempt.id,
      type: "SESSION_CONFLICT",
    })
    expect(result && "error" in result).toBe(true)
  })

  it("is a silent no-op for an attempt that has already ended", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id)
    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: { status: "COMPLETED", submittedAt: new Date() },
    })
    asUser(studentA)

    const result = await reportViolationAction({
      attemptId: attempt.id,
      type: "TAB_SWITCH",
    })
    expect(result).toEqual({ success: true })

    const events = await prisma.violationEvent.findMany({
      where: { attemptId: attempt.id },
    })
    expect(events).toHaveLength(0) // nothing was actually recorded
  })
})

describe("flagging for review — never auto-disqualifies", () => {
  it("a single tab switch does not flag the attempt", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id, {
      violationReviewThreshold: 5,
    })
    asUser(studentA)

    await reportViolationAction({
      attemptId: attempt.id,
      type: "TAB_SWITCH",
      metadata: { awayDurationMs: 1000 },
    })

    const fresh = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: attempt.id },
    })
    expect(fresh.flaggedForReviewAt).toBeNull()
    expect(fresh.status).toBe("IN_PROGRESS")
  })

  it("crossing the threshold flags for review but never changes attempt status", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id, {
      violationReviewThreshold: 3,
    })
    asUser(studentA)

    // 4 LOW-severity events (weight 1 each) crosses a threshold of 3.
    for (let i = 0; i < 4; i++) {
      const result = await reportViolationAction({
        attemptId: attempt.id,
        type: "TAB_SWITCH",
        metadata: { awayDurationMs: 1000 },
      })
      expect(result).toEqual({ success: true })
    }

    const fresh = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: attempt.id },
    })
    expect(fresh.flaggedForReviewAt).not.toBeNull()
    expect(fresh.status).toBe("IN_PROGRESS") // still just flagged, never disqualified

    const flagLog = await prisma.gradingAuditLog.findFirst({
      where: { attemptId: attempt.id, action: "ATTEMPT_FLAGGED_FOR_REVIEW" },
    })
    expect(flagLog).not.toBeNull()
  })

  it("even many HIGH-severity events never auto-disqualify", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id, {
      violationReviewThreshold: 3,
    })
    asUser(studentA)

    for (let i = 0; i < 10; i++) {
      await reportViolationAction({ attemptId: attempt.id, type: "DEVTOOLS_DETECTED" })
    }
    // DEVTOOLS_DETECTED has an empty metadata schema (z.object({})), so no
    // metadata field is needed here — unlike TAB_SWITCH.

    const fresh = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: attempt.id },
    })
    expect(fresh.status).not.toBe("DISQUALIFIED")
    expect(fresh.status).toBe("IN_PROGRESS")
  })

  it("only flags once even if the threshold is crossed repeatedly", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id, {
      violationReviewThreshold: 1,
    })
    asUser(studentA)

    const metadata = { awayDurationMs: 1000 }
    await reportViolationAction({ attemptId: attempt.id, type: "TAB_SWITCH", metadata })
    await reportViolationAction({ attemptId: attempt.id, type: "TAB_SWITCH", metadata })
    await reportViolationAction({ attemptId: attempt.id, type: "TAB_SWITCH", metadata })

    const flagLogs = await prisma.gradingAuditLog.findMany({
      where: { attemptId: attempt.id, action: "ATTEMPT_FLAGGED_FOR_REVIEW" },
    })
    expect(flagLogs).toHaveLength(1)
  })
})

describe("reviewViolationEventAction", () => {
  it("rejects a teacher who doesn't own the exam", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id)
    asUser(studentA)
    await reportViolationAction({
      attemptId: attempt.id,
      type: "TAB_SWITCH",
      metadata: { awayDurationMs: 1000 },
    })
    const event = await prisma.violationEvent.findFirstOrThrow({
      where: { attemptId: attempt.id },
    })

    asUser(teacherB)
    const formData = new FormData()
    formData.set("status", "REVIEWED_NO_ACTION")
    await expect(
      reviewViolationEventAction(event.id, undefined, formData)
    ).rejects.toThrow(ForbiddenError)
  })

  it("updates review status/note without touching the original evidence", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id)
    asUser(studentA)
    await reportViolationAction({
      attemptId: attempt.id,
      type: "TAB_SWITCH",
      metadata: { awayDurationMs: 1234 },
    })
    const before = await prisma.violationEvent.findFirstOrThrow({
      where: { attemptId: attempt.id },
    })

    asUser(teacherA)
    const formData = new FormData()
    formData.set("status", "REVIEWED_WARNING_ISSUED")
    formData.set("reviewNote", "Spoke with the student")
    const result = await reviewViolationEventAction(before.id, undefined, formData)
    expect(result).toEqual({ success: true })

    const after = await prisma.violationEvent.findUniqueOrThrow({
      where: { id: before.id },
    })
    expect(after.reviewStatus).toBe("REVIEWED_WARNING_ISSUED")
    expect(after.reviewNote).toBe("Spoke with the student")
    expect(after.reviewedById).toBe(teacherA.id)
    // The original evidence is immutable — only review fields changed.
    expect(after.type).toBe(before.type)
    expect(after.source).toBe(before.source)
    expect(after.severity).toBe(before.severity)
    expect(after.occurredAt).toEqual(before.occurredAt)
    expect(after.metadata).toEqual(before.metadata)
  })
})

describe("appeals", () => {
  it("can only be filed against a disqualified attempt", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id)
    asUser(studentA)

    const formData = new FormData()
    formData.set("explanation", "I was not cheating, this is a mistake")
    const result = await fileAppealAction(attempt.id, undefined, formData)
    expect(result && "error" in result).toBe(true)
  })

  it("rejects a second pending appeal for the same attempt", async () => {
    const { exam, attempt } = await makeInProgressAttempt(teacherA.id, studentA.id)
    asUser(teacherA)
    const dqForm = new FormData()
    dqForm.set("reason", "Suspicious pattern of answers")
    await disqualifyAttemptAction(attempt.id, undefined, dqForm)

    asUser(studentA)
    const appealForm = new FormData()
    appealForm.set("explanation", "I believe this is incorrect, please review")
    const first = await fileAppealAction(attempt.id, undefined, appealForm)
    expect(first).toEqual({ success: true })

    const second = await fileAppealAction(attempt.id, undefined, appealForm)
    expect(second && "error" in second).toBe(true)

    void exam
  })

  it("accepting an appeal restores the attempt's prior status and is audited", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id)

    // get it to COMPLETED first, so there's a real prior state to restore
    await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: { status: "COMPLETED", submittedAt: new Date() },
    })

    asUser(teacherA)
    const dqForm = new FormData()
    dqForm.set("reason", "Flagged for review, decided to disqualify")
    await disqualifyAttemptAction(attempt.id, undefined, dqForm)

    const disqualified = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: attempt.id },
    })
    expect(disqualified.status).toBe("DISQUALIFIED")
    expect(disqualified.statusBeforeDisqualification).toBe("COMPLETED")

    asUser(studentA)
    const appealForm = new FormData()
    appealForm.set("explanation", "This was a false positive, please reconsider")
    await fileAppealAction(attempt.id, undefined, appealForm)
    const appeal = await prisma.violationAppeal.findFirstOrThrow({
      where: { attemptId: attempt.id },
    })

    asUser(teacherA)
    const resolveForm = new FormData()
    resolveForm.set("decision", "ACCEPTED")
    resolveForm.set("resolutionNote", "Reviewed the evidence, overturning")
    const result = await resolveAppealAction(appeal.id, undefined, resolveForm)
    expect(result).toEqual({ success: true })

    const restored = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: attempt.id },
    })
    expect(restored.status).toBe("COMPLETED") // restored, not left disqualified
    expect(restored.disqualifiedReason).not.toBeNull() // historical record kept

    const requalifyLog = await prisma.gradingAuditLog.findFirst({
      where: { attemptId: attempt.id, action: "ATTEMPT_REQUALIFIED" },
    })
    expect(requalifyLog?.actorId).toBe(teacherA.id)
  })

  it("rejecting an appeal leaves the attempt disqualified", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id)
    asUser(teacherA)
    const dqForm = new FormData()
    dqForm.set("reason", "Clear evidence of misconduct")
    await disqualifyAttemptAction(attempt.id, undefined, dqForm)

    asUser(studentA)
    const appealForm = new FormData()
    appealForm.set("explanation", "Please reconsider this decision")
    await fileAppealAction(attempt.id, undefined, appealForm)
    const appeal = await prisma.violationAppeal.findFirstOrThrow({
      where: { attemptId: attempt.id },
    })

    asUser(teacherA)
    const resolveForm = new FormData()
    resolveForm.set("decision", "REJECTED")
    resolveForm.set("resolutionNote", "Evidence stands, appeal denied")
    await resolveAppealAction(appeal.id, undefined, resolveForm)

    const stillDisqualified = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: attempt.id },
    })
    expect(stillDisqualified.status).toBe("DISQUALIFIED")
  })

  it("rejects a teacher resolving an appeal on an exam they don't own", async () => {
    const { attempt } = await makeInProgressAttempt(teacherA.id, studentA.id)
    asUser(teacherA)
    const dqForm = new FormData()
    dqForm.set("reason", "Reason for disqualification")
    await disqualifyAttemptAction(attempt.id, undefined, dqForm)

    asUser(studentA)
    const appealForm = new FormData()
    appealForm.set("explanation", "Explanation for the appeal goes here")
    await fileAppealAction(attempt.id, undefined, appealForm)
    const appeal = await prisma.violationAppeal.findFirstOrThrow({
      where: { attemptId: attempt.id },
    })

    asUser(teacherB)
    const resolveForm = new FormData()
    resolveForm.set("decision", "ACCEPTED")
    resolveForm.set("resolutionNote", "Attempted cross-teacher resolution")
    await expect(
      resolveAppealAction(appeal.id, undefined, resolveForm)
    ).rejects.toThrow(ForbiddenError)
  })
})
