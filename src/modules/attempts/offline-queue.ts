"use client"

import { openDB, type IDBPDatabase } from "idb"

export type PendingAnswer = {
  key: string
  attemptId: string
  examQuestionId: string
  selectedOption: "A" | "B" | "C" | "D" | null
  isMarkedForReview: boolean
  clientUpdatedAt: string
}

const DB_NAME = "mcq-exam-attempts"
const STORE = "pending-answers"

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb() {
  if (typeof indexedDB === "undefined") return null
  dbPromise ??= openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: "key" })
    },
  })
  return dbPromise
}

function keyFor(attemptId: string, examQuestionId: string) {
  return `${attemptId}:${examQuestionId}`
}

/** Persisted the instant an answer is picked, before the network round trip
 * even starts — so a reload or a dropped connection can never lose it. */
export async function queuePendingAnswer(
  answer: Omit<PendingAnswer, "key">
) {
  const db = await getDb()
  if (!db) return
  await db.put(STORE, {
    ...answer,
    key: keyFor(answer.attemptId, answer.examQuestionId),
  })
}

export async function clearPendingAnswer(
  attemptId: string,
  examQuestionId: string
) {
  const db = await getDb()
  if (!db) return
  await db.delete(STORE, keyFor(attemptId, examQuestionId))
}

export async function getPendingAnswersForAttempt(attemptId: string) {
  const db = await getDb()
  if (!db) return []
  const all = (await db.getAll(STORE)) as PendingAnswer[]
  return all.filter((a) => a.attemptId === attemptId)
}
