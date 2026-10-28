import { requireRole } from "@/lib/authorization"
import { getSystemSettings } from "@/modules/settings/queries"
import { VerificationSettings } from "@/modules/settings/components/verification-settings"
import { BillingModeSettings } from "@/modules/settings/components/billing-mode-settings"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function AdminPoliciesSettingsPage() {
  await requireRole("SUPER_ADMIN")
  const settings = await getSystemSettings()

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-1">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Platform Policies & Billing
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pt-2">
        <div className="space-y-4">
          <h2 className="font-heading text-base font-bold text-foreground">
            Verification Policies
          </h2>
          <VerificationSettings settings={settings} />
        </div>

        <div className="space-y-4">
          <h2 className="font-heading text-base font-bold text-foreground">
            Billing & Monetization
          </h2>
          <BillingModeSettings settings={settings} />
        </div>
      </div>
    </div>
  )
}
