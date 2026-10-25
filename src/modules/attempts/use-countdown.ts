"use client"

import { useEffect, useRef, useState } from "react"

/** Countdown display only — the server's `deadline` is the real authority;
 * this never decides anything on its own besides triggering `onExpire` once. */
export function useCountdown(deadline: string, onExpire: () => void) {
  const onExpireRef = useRef(onExpire)
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])
  const firedRef = useRef(false)
  const [remainingMs, setRemainingMs] = useState(
    () => new Date(deadline).getTime() - Date.now()
  )

  useEffect(() => {
    firedRef.current = false
    const tick = () => {
      const remaining = new Date(deadline).getTime() - Date.now()
      setRemainingMs(remaining)
      if (remaining <= 0 && !firedRef.current) {
        firedRef.current = true
        onExpireRef.current()
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  return Math.max(0, remainingMs)
}

export function formatRemaining(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}
