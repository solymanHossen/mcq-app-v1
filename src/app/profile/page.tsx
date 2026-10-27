import { Suspense } from "react"
import { requireUser } from "@/lib/authorization"
import { getFullProfileData } from "@/modules/account/queries"
import { getSystemSettings } from "@/modules/settings/queries"
import { ProfileHero } from "@/modules/account/components/profile-hero"
import { ProfileTabs } from "@/modules/account/components/profile-tabs"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export const metadata = {
  title: "Account & Profile",
  description:
    "Manage your personal profile, security credentials, preferences, and activity history.",
}

export default async function ProfilePage() {
  const currentUser = await requireUser()
  const profile = await getFullProfileData(currentUser.id)
  const { billingEnabled } = await getSystemSettings()

  return (
    <div className="space-y-8">
      {/* World-Class Hero Banner */}
      <ProfileHero user={profile} />

      {/* Ultra-Smooth Large-Size Tabs System */}
      <Suspense
        fallback={
          <div className="h-48 w-full animate-pulse rounded-3xl bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)]" />
        }
      >
        <ProfileTabs profile={profile} billingEnabled={billingEnabled} />
      </Suspense>
    </div>
  )
}
