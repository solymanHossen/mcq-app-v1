import { Skeleton } from "@/components/ui/skeleton"
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
    <div className="w-full min-w-0 space-y-6 pb-12 sm:space-y-8 sm:pb-16">
      {/* World-Class Hero Banner */}
      <ProfileHero user={profile} className="rounded-2xl border border-solid border-border/70 p-4 shadow-xs backdrop-blur-none sm:p-6 lg:p-7 dark:shadow-xs [&_h1]:text-2xl [&_h1]:break-words sm:[&_h1]:text-3xl lg:[&_h1]:text-4xl [&_button]:max-w-full [&_button_span]:break-all [&>div[aria-hidden]]:hidden" />

      {/* Ultra-Smooth Large-Size Tabs System */}
      <Suspense
        fallback={
          <Skeleton className="h-48 w-full rounded-2xl" />
        }
      >
        <ProfileTabs profile={profile} billingEnabled={billingEnabled} />
      </Suspense>
    </div>
  )
}
