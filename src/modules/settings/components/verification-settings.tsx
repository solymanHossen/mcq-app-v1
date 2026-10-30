"use client"

import { MailCheck, GraduationCap } from "lucide-react"
import { SettingToggle } from "@/modules/settings/components/setting-toggle"
import {
  setRequireEmailVerificationAction,
  setRequireTeacherVerificationAction,
} from "@/modules/settings/actions"
import type { SystemSettings } from "@/modules/settings/queries"

export function VerificationSettings({
  settings,
  pendingTeacherCount = 0,
}: {
  settings: SystemSettings
  pendingTeacherCount?: number
}) {
  return (
    <div className="divide-y divide-border/60">
      <SettingToggle
        id="policy-email-verification"
        title="Require email verification"
        description="Require new accounts to verify their email address before signing in"
        enabled={settings.requireEmailVerification}
        action={setRequireEmailVerificationAction}
        icon={<MailCheck className="size-6" />}
        iconColor="blue"
      />

      <SettingToggle
        id="policy-teacher-verification"
        title="Require teacher verification"
        description="Exams remain unpublishable until an administrator approves the teacher's account"
        enabled={settings.requireTeacherVerification}
        action={setRequireTeacherVerificationAction}
        icon={<GraduationCap className="size-6" />}
        iconColor="purple"
        extraLink={
          pendingTeacherCount > 0
            ? { label: `${pendingTeacherCount} pending review`, href: "/admin/teachers" }
            : undefined
        }
      />
    </div>

  )
}


