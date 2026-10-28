import { requireRole } from "@/lib/authorization"
import { getSystemSettings } from "@/modules/settings/queries"
import { VerificationSettings } from "@/modules/settings/components/verification-settings"
import { BillingModeSettings } from "@/modules/settings/components/billing-mode-settings"
import { HeroBrandingSettings } from "@/modules/settings/components/hero-branding-settings"

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
    <div className="w-full min-w-0 space-y-8">
      {/* Dynamic Branding & Hero Section Media Management with Integrated Title & Actions */}
      <HeroBrandingSettings settings={settings} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 pt-4 border-t border-border/60">
        <div className="space-y-4">
          <h2 className="font-heading text-base font-bold text-foreground">Verification Policies</h2>
          <VerificationSettings settings={settings} />
        </div>

        <div className="space-y-4">
          <h2 className="font-heading text-base font-bold text-foreground">Billing & Monetization</h2>
          <BillingModeSettings settings={settings} />
        </div>
      </div>
    </div>
  )
}
