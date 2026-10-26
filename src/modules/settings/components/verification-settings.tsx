"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import {
  setRequireEmailVerificationAction,
  setRequireTeacherVerificationAction,
} from "@/modules/settings/actions"
import type { SystemSettings } from "@/modules/settings/queries"

export function VerificationSettings({ settings }: { settings: SystemSettings }) {
  return (
    <div className="space-y-4">
      <SettingToggle
        title="Require email verification"
        description="A new account must confirm its email with a one-time code before it can log in. Turning this off lets anyone log in right after registering."
        enabled={settings.requireEmailVerification}
        action={setRequireEmailVerificationAction}
      />
      <SettingToggle
        title="Require teacher verification before publishing"
        description="A teacher's exams stay unpublishable until an admin approves their account here. Turning this off lets any teacher publish immediately — verification status is still tracked and reviewable on the Teacher verification page."
        enabled={settings.requireTeacherVerification}
        action={setRequireTeacherVerificationAction}
      />
    </div>
  )
}

function SettingToggle({
  title,
  description,
  enabled,
  action,
}: {
  title: string
  description: string
  enabled: boolean
  action: (enabled: boolean) => Promise<{ success: true } | { error: string }>
}) {
  const [isPending, startTransition] = useTransition()

  function handleChange(next: boolean) {
    startTransition(async () => {
      const result = await action(next)
      if ("error" in result) toast.error(result.error)
      else toast.success("Setting updated")
    })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          {isPending && <Spinner className="size-4 text-muted-foreground" />}
          <Switch checked={enabled} onCheckedChange={handleChange} disabled={isPending} />
        </div>
      </CardHeader>
    </Card>
  )
}
