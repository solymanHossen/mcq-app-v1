"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Checkbox } from "@/components/ui/checkbox"
import { startAttemptAction } from "@/actions/attempt.actions"

export function StartExamButton({
  examId,
  label,
  webcamMonitoringRequired,
}: {
  examId: string
  label: string
  webcamMonitoringRequired: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [webcamConsent, setWebcamConsent] = useState(false)

  function start() {
    startTransition(async () => {
      const result = await startAttemptAction(examId, { webcamConsent })
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      router.push(`/exams/${examId}/attempt/${result.attemptId}`)
    })
  }

  return (
    <div className="space-y-3">
      {webcamMonitoringRequired && (
        <div className="flex items-start gap-2 rounded-md border p-3 text-sm">
          <Checkbox
            id="webcam-consent"
            checked={webcamConsent}
            onCheckedChange={(checked) => setWebcamConsent(checked === true)}
            aria-describedby="webcam-consent-description"
          />
          <label htmlFor="webcam-consent" className="cursor-pointer">
            <span className="font-medium">
              I consent to webcam monitoring during this exam.
            </span>
            <p
              id="webcam-consent-description"
              className="mt-1 text-xs text-muted-foreground"
            >
              This exam requires webcam monitoring. No recording starts
              without this checkbox.
            </p>
          </label>
        </div>
      )}
      <Button
        onClick={start}
        disabled={isPending || (webcamMonitoringRequired && !webcamConsent)}
      >
        {isPending && <Spinner data-icon="inline-start" />}
        {label}
      </Button>
    </div>
  )
}
