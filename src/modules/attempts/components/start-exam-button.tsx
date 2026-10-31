"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { startAttemptAction } from "@/modules/attempts/actions"

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
    <div className="flex flex-col gap-4 sm:gap-5">
      {webcamMonitoringRequired && (
        <Field
          orientation="horizontal"
          className="items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 sm:p-4"
        >
          <Checkbox
            id="webcam-consent"
            checked={webcamConsent}
            onCheckedChange={(checked) => setWebcamConsent(checked === true)}
            aria-describedby="webcam-consent-description"
          />
          <FieldContent>
            <FieldLabel
              htmlFor="webcam-consent"
              className="cursor-pointer text-sm leading-relaxed font-semibold sm:text-base"
            >
              I consent to webcam monitoring during this exam.
            </FieldLabel>
            <FieldDescription
              id="webcam-consent-description"
              className="text-xs leading-relaxed text-muted-foreground sm:text-sm"
            >
              This exam requires webcam monitoring. No recording starts without
              this checkbox.
            </FieldDescription>
          </FieldContent>
        </Field>
      )}
      <Button
        size="lg"
        className="h-12 w-full rounded-xl font-bold shadow-md sm:h-13 sm:text-lg"
        onClick={start}
        disabled={isPending || (webcamMonitoringRequired && !webcamConsent)}
      >
        {isPending && <Spinner data-icon="inline-start" />}
        {label}
      </Button>
    </div>
  )
}
