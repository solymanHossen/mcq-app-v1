"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { saveAnswerAction } from "@/modules/attempts/actions"
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

// A Phase 8 load-test finding: every answer click fired an immediate
// network save with no debounce, so a student changing their mind rapidly
// (A, then B, then C within a second) produced one DB write per click
// instead of one write for the answer they actually settled on. Debouncing
// only the NETWORK call — never the IndexedDB write or the local state
// update just above, both still immediate — keeps the "never lose an
// answer on reload" guarantee intact while cutting write volume for the
// common case of a student still deciding.
const AUTOSAVE_DEBOUNCE_MS = 600

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
  // One opaque token per page load, not persisted — the server uses it to
  // detect two tabs/browsers active on the same attempt at once (see
  // lib/anti-cheat/engine.ts's session-conflict detection). An ordinary
  // reload just gets a new token, which the server treats as a handoff, not
  // a conflict, once the old one goes quiet.
  const sessionTokenRef = useRef(crypto.randomUUID())

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
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
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
          sessionToken: sessionTokenRef.current,
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

      clearTimeout(debounceTimers.current[examQuestionId])
      debounceTimers.current[examQuestionId] = setTimeout(() => {
        trySaveRef.current(examQuestionId, next)
      }, AUTOSAVE_DEBOUNCE_MS)
    },
    [attemptId]
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

  // Submitting must never race the autosave debounce: a student can select
  // an answer and click Submit within the debounce window, and grading
  // reads whatever is currently stored — so every pending debounce is
  // cancelled and saved immediately, awaited here, before the caller (the
  // Submit button) proceeds to submitAttemptAction.
  const flushPending = useCallback(async () => {
    const pending = Object.entries(answersRef.current).filter(
      ([, a]) => a.syncStatus === "pending" || a.syncStatus === "error"
    )
    await Promise.all(
      pending.map(([id, answer]) => {
        clearTimeout(debounceTimers.current[id])
        return trySaveRef.current(id, answer)
      })
    )
  }, [])

  return { answers, update, flushPending }
}
