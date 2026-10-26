import { requireRole } from "@/lib/authorization"
import { getSystemSettings } from "@/modules/settings/queries"
import { VerificationSettings } from "@/modules/settings/components/verification-settings"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AdminSettingsPage() {
  // Stricter than the admin layout's own guard (ADMIN or SUPER_ADMIN): this
  // is platform-wide verification policy, reserved for SUPER_ADMIN only.
  await requireRole("SUPER_ADMIN")
  const settings = await getSystemSettings()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System settings</h1>
        <p className="text-sm text-muted-foreground">
          Platform-wide verification policy. Changes take effect immediately and are
          recorded in the audit log.
        </p>
      </div>

      <VerificationSettings settings={settings} />
    </div>
  )
}
