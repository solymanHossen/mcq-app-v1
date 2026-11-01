import { requireRole } from "@/lib/authorization"
import { getSystemSettings } from "@/modules/settings/queries"
import { SocialContactSettings } from "@/modules/settings/components/social-contact-settings"

export const instant = false

export default async function AdminSocialSettingsPage() {
  await requireRole("SUPER_ADMIN")
  const settings = await getSystemSettings()

  return (
    <div className="w-full min-w-0 space-y-6">
      <SocialContactSettings settings={settings} />
    </div>
  )
}
