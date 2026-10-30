import { requireRole, TEACHER_ROLES } from "@/lib/authorization"
import { getAccountOverview } from "@/modules/account/queries"
import { ProfileCard } from "@/modules/account/components/profile-card"
import { VerificationStatusCard } from "@/modules/account/components/verification-status-card"
import { ChangePasswordCard } from "@/modules/account/components/change-password-card"
import { SessionsCard } from "@/modules/account/components/sessions-card"
import { AppearanceCard } from "@/modules/account/components/appearance-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { APP_NAME } from "@/lib/config"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function TeacherSettingsPage() {
  const teacher = await requireRole(...TEACHER_ROLES)
  const overview = await getAccountOverview(teacher.id)

  const joinedFormatted = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(overview.createdAt))

  const lastLoginFormatted = overview.lastLoginAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(overview.lastLoginAt))
    : null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Teacher Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Manage your faculty credentials, account security, and {APP_NAME} preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <TabsList className="group-data-horizontal/tabs:!h-auto !h-auto flex w-fit items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/60 p-1.5 backdrop-blur-xl shadow-2xs sm:gap-2 sm:p-2 min-h-12 sm:min-h-14">
            <TabsTrigger
              value="profile"
              className="group relative flex !h-auto min-h-9.5 sm:min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 select-none sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-[15px] text-muted-foreground hover:bg-background/80 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm focus-visible:ring-0 focus-visible:outline-none"
            >
              Faculty Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="group relative flex !h-auto min-h-9.5 sm:min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 select-none sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-[15px] text-muted-foreground hover:bg-background/80 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm focus-visible:ring-0 focus-visible:outline-none"
            >
              Security
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="group relative flex !h-auto min-h-9.5 sm:min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 select-none sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-[15px] text-muted-foreground hover:bg-background/80 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm focus-visible:ring-0 focus-visible:outline-none"
            >
              Appearance
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-6">
          {teacher.role === "TEACHER" && (
            <VerificationStatusCard
              status={teacher.teacherVerificationStatus}
              note={overview.teacherVerificationNote}
            />
          )}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <ProfileCard
              name={teacher.name}
              email={teacher.email}
              role={teacher.role}
              joinedAt={joinedFormatted}
              lastLoginAt={lastLoginFormatted}
            />
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <ChangePasswordCard />
            <SessionsCard />
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <AppearanceCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

