"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { saveAnswerAction } from "@/actions/attempt.actions"
import {
  queuePendingAnswer,
  clearPendingAnswer,
  getPendingAnswersForAttempt,
} from "./offline-queue"

export type OptionChoice = "A" | "B" | "C" | "D"

export type AnswerState = {
  examQuestionId: string
  selectedOption: OptionChoice | null
  isMarkedForReview: boolean
  clientUpdatedAt: string
  syncStatus: "synced" | "pending" | "error" | "ended"
}

type TrySave = (examQuestionId: string, answer: AnswerState) => Promise<void>

/**
 * Drives autosave for one attempt: every change is (1) written to
 * IndexedDB immediately, before any network call, so a reload or dropped
 * connection can never lose it, then (2) sent to the server. On failure it
 * retries with backoff and again on the browser's `online` event. On mount,
 * any answer still pending in IndexedDB from a previous session (e.g. the
 * tab closed before the save confirmed) is recovered and re-flushed.
 */
export function useAttemptSync(
  attemptId: string,
  initial: {
    examQuestionId: string
    selectedOption: OptionChoice | null
    isMarkedForReview: boolean
  }[]
) {
  const [answers, setAnswers] = useState<Record<string, AnswerState>>(() =>
    Object.fromEntries(
      initial.map((a) => [
        a.examQuestionId,
        {
          ...a,
          clientUpdatedAt: new Date(0).toISOString(),
          syncStatus: "synced" as const,
        },
      ])
    )
  )
  const answersRef = useRef(answers)
  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  const retryTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  // Self-referential retry goes through this ref (updated in an effect,
  // never during render) instead of trySave calling itself directly.
  const trySaveRef = useRef<TrySave>(async () => {})

  const trySave = useCallback<TrySave>(
    async (examQuestionId, answer) => {
      clearTimeout(retryTimers.current[examQuestionId])

      let result
      try {
        result = await saveAnswerAction({
          attemptId,
          examQuestionId,
          selectedOption: answer.selectedOption,
          isMarkedForReview: answer.isMarkedForReview,
          clientUpdatedAt: answer.clientUpdatedAt,
        })
      } catch {
        retryTimers.current[examQuestionId] = setTimeout(() => {
          trySaveRef.current(examQuestionId, answer)
        }, 4000)
        return
      }

      if (result && "error" in result) {
        setAnswers((prev) =>
          prev[examQuestionId]?.clientUpdatedAt === answer.clientUpdatedAt
            ? {
                ...prev,
                [examQuestionId]: { ...prev[examQuestionId], syncStatus: "ended" },
              }
            : prev
        )
        return
      }

      await clearPendingAnswer(attemptId, examQuestionId)
      setAnswers((prev) =>
        // Only clear "pending" if nothing newer was queued while this save
        // was in flight — otherwise we'd mark an unsaved later edit as synced.
        prev[examQuestionId]?.clientUpdatedAt === answer.clientUpdatedAt
          ? {
              ...prev,
              [examQuestionId]: { ...prev[examQuestionId], syncStatus: "synced" },
            }
          : prev
      )
    },
    [attemptId]
  )

  useEffect(() => {
    trySaveRef.current = trySave
  }, [trySave])

  const update = useCallback(
    (
      examQuestionId: string,
      patch: Partial<Pick<AnswerState, "selectedOption" | "isMarkedForReview">>
    ) => {
      const clientUpdatedAt = new Date().toISOString()
      const next: AnswerState = {
        examQuestionId,
        selectedOption: answersRef.current[examQuestionId]?.selectedOption ?? null,
        isMarkedForReview:
          answersRef.current[examQuestionId]?.isMarkedForReview ?? false,
        ...patch,
        clientUpdatedAt,
        syncStatus: "pending",
      }
      setAnswers((prev) => ({ ...prev, [examQuestionId]: next }))
      queuePendingAnswer({
        attemptId,
        examQuestionId,
        selectedOption: next.selectedOption,
        isMarkedForReview: next.isMarkedForReview,
        clientUpdatedAt,
      })
      trySave(examQuestionId, next)
    },
    [attemptId, trySave]
  )

  // Recover anything left pending in IndexedDB from before a reload/crash.
  useEffect(() => {
    let cancelled = false
    getPendingAnswersForAttempt(attemptId).then((pending) => {
      if (cancelled) return
      for (const p of pending) {
        const current = answersRef.current[p.examQuestionId]
        if (current && p.clientUpdatedAt <= current.clientUpdatedAt) continue
        const recovered: AnswerState = {
          examQuestionId: p.examQuestionId,
          selectedOption: p.selectedOption,
          isMarkedForReview: p.isMarkedForReview,
          clientUpdatedAt: p.clientUpdatedAt,
          syncStatus: "pending",
        }
        setAnswers((prev) => ({ ...prev, [p.examQuestionId]: recovered }))
        trySave(p.examQuestionId, recovered)
      }
    })
    return () => {
      cancelled = true
    }
  }, [attemptId, trySave])

  // Flush anything unsynced when connectivity returns.
  useEffect(() => {
    function flush() {
      for (const [id, answer] of Object.entries(answersRef.current)) {
        if (answer.syncStatus === "pending" || answer.syncStatus === "error") {
          trySave(id, answer)
        }
      }
    }
    window.addEventListener("online", flush)
    return () => window.removeEventListener("online", flush)
  }, [trySave])

  return { answers, update }
}
