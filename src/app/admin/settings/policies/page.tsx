import { requireRole } from "@/lib/authorization"
import { getSystemSettings } from "@/modules/settings/queries"
import { countPendingTeacherVerifications } from "@/modules/payments/queries"
import { PoliciesSettingsConsole } from "@/modules/settings/components/policies-settings-console"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AdminPoliciesSettingsPage() {
  await requireRole("SUPER_ADMIN")
  const [settings, pendingTeacherCount] = await Promise.all([
    getSystemSettings(),
    countPendingTeacherVerifications(),
  ])

  return (
    <PoliciesSettingsConsole
      settings={settings}
      pendingTeacherCount={pendingTeacherCount}
    />
  )
}

