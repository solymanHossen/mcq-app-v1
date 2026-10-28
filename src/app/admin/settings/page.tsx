import { requireRole } from "@/lib/authorization"
import { getSystemSettings } from "@/modules/settings/queries"
import { HeroBrandingSettings } from "@/modules/settings/components/hero-branding-settings"
import { SettingsNav } from "@/modules/settings/components/settings-nav"

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
    <div className="w-full min-w-0 space-y-6">
      <SettingsNav />
      <HeroBrandingSettings settings={settings} />
    </div>
  )
}
