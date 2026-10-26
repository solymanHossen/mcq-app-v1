"use client"

import { SettingToggle } from "@/modules/settings/components/setting-toggle"
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
