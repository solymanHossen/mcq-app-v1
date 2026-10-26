import { requireRole } from "@/lib/authorization"
import { getSystemSettings } from "@/modules/settings/queries"
import { VerificationSettings } from "@/modules/settings/components/verification-settings"
import { BillingModeSettings } from "@/modules/settings/components/billing-mode-settings"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AdminSettingsPage() {
  // Stricter than the admin layout's own guard (ADMIN or SUPER_ADMIN): this
  // is platform-wide policy, reserved for SUPER_ADMIN only.
  await requireRole("SUPER_ADMIN")
  const settings = await getSystemSettings()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System settings</h1>
        <p className="text-sm text-muted-foreground">
          Platform-wide policy. Changes take effect immediately and are recorded in the
          audit log.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Verification</h2>
        <VerificationSettings settings={settings} />
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Billing</h2>
        <BillingModeSettings settings={settings} />
      </div>
    </div>
  )
}
