"use client"

import { useEffect, useRef } from "react"
import { reportViolationAction } from "@/modules/proctoring/actions"

/**
 * Wires up the browser event listeners for the violation types that have a
 * real, reliable client-side signal: tab visibility, window focus,
 * fullscreen exit, copy/paste, and right-click. Each is reported to the
 * server as CLIENT_REPORTED evidence — self-reported, not proof (see
 * lib/anti-cheat/engine.ts) — and only while the attempt is still active.
 *
 * Deliberately NOT implemented here: DEVTOOLS_DETECTED (every client-side
 * heuristic for this is unreliable and easy to false-positive/evade — not
 * worth shipping), MULTIPLE_TABS_DETECTED (needs cross-tab coordination via
 * BroadcastChannel, not built), and the WEBCAM_* types (no webcam capture
 * exists in this system at all — see the consent gate in
 * components/student/webcam-consent.tsx for what IS implemented there).
 */
export function useViolationReporting(attemptId: string, active: boolean) {
  const blurStartRef = useRef<number | null>(null)
  const hiddenStartRef = useRef<number | null>(null)

  useEffect(() => {
    // Listeners are only ever attached while active is true, and this
    // effect's cleanup removes them the moment active flips to false (or
    // attemptId changes) — no separate "am I still active" check needed
    // inside the handlers themselves.
    if (!active) return

    function report(
      type:
        | "TAB_SWITCH"
        | "WINDOW_BLUR"
        | "FULLSCREEN_EXIT"
        | "COPY_ATTEMPT"
        | "PASTE_ATTEMPT"
        | "RIGHT_CLICK_ATTEMPT",
      metadata?: Record<string, number>
    ) {
      reportViolationAction({ attemptId, type, metadata })
    }

    function onVisibilityChange() {
      if (document.hidden) {
        hiddenStartRef.current = Date.now()
      } else if (hiddenStartRef.current) {
        report("TAB_SWITCH", {
          awayDurationMs: Date.now() - hiddenStartRef.current,
        })
        hiddenStartRef.current = null
      }
    }

    function onBlur() {
      blurStartRef.current = Date.now()
    }
    function onFocus() {
      if (blurStartRef.current) {
        report("WINDOW_BLUR", { durationMs: Date.now() - blurStartRef.current })
        blurStartRef.current = null
      }
    }

    function onFullscreenChange() {
      if (!document.fullscreenElement) report("FULLSCREEN_EXIT")
    }

    function onCopy() {
      report("COPY_ATTEMPT", {
        selectionLength: window.getSelection()?.toString().length ?? 0,
      })
    }
    function onPaste(e: ClipboardEvent) {
      report("PASTE_ATTEMPT", {
        pastedLength: e.clipboardData?.getData("text").length ?? 0,
      })
    }
    function onContextMenu() {
      report("RIGHT_CLICK_ATTEMPT")
    }

    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("blur", onBlur)
    window.addEventListener("focus", onFocus)
    document.addEventListener("fullscreenchange", onFullscreenChange)
    document.addEventListener("copy", onCopy)
    document.addEventListener("paste", onPaste)
    document.addEventListener("contextmenu", onContextMenu)

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("blur", onBlur)
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("fullscreenchange", onFullscreenChange)
      document.removeEventListener("copy", onCopy)
      document.removeEventListener("paste", onPaste)
      document.removeEventListener("contextmenu", onContextMenu)
    }
  }, [attemptId, active])
}
