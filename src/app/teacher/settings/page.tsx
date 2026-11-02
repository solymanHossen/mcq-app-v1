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

const settingsCardClassName =
  "min-w-0 rounded-2xl border border-border/70 p-4 shadow-xs backdrop-blur-none sm:p-6 lg:p-7 dark:shadow-xs [&_h3]:text-base [&_h3]:tracking-tight sm:[&_h3]:text-xl [&_label]:text-sm [&_label]:font-semibold [&_label]:tracking-normal [&_label]:normal-case sm:[&_label]:text-base [&_input]:h-11 [&_input]:rounded-xl [&_input]:border [&_input]:border-input/60 [&_input]:bg-muted/20 [&_input]:px-4 sm:[&_input]:h-12 sm:[&_input]:rounded-2xl md:[&_input]:text-sm [&_input[type=password]]:pr-12 [&_button[type=submit]]:h-auto [&_button[type=submit]]:min-h-10 [&_button[type=submit]]:whitespace-normal [&_button[type=submit]]:py-2.5 [&_button[type=submit]]:text-sm [&_button[type=submit]]:font-semibold"

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
    <div className="w-full min-w-0 space-y-6 pb-12 sm:space-y-8 sm:pb-16">
      <div className="border-b border-border/60 pb-3 sm:pb-4">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          Teacher Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Manage your faculty credentials, account security, and {APP_NAME}{" "}
          preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <div className="w-full scrollbar-none overflow-x-auto pb-1">
          <TabsList className="flex min-h-11 w-max items-center gap-1 rounded-xl border border-border/60 bg-muted/20 p-1 shadow-2xs group-data-horizontal/tabs:h-auto">
            <TabsTrigger
              value="profile"
              className="h-10 shrink-0 cursor-pointer rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-5"
            >
              Faculty Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="h-10 shrink-0 cursor-pointer rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-5"
            >
              Security
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="h-10 shrink-0 cursor-pointer rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-5"
            >
              Appearance
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-6">
          {teacher.role === "TEACHER" && (
            <VerificationStatusCard
              className="rounded-2xl border border-border/70 shadow-xs backdrop-blur-none sm:rounded-2xl dark:shadow-xs"
              status={teacher.teacherVerificationStatus}
              note={overview.teacherVerificationNote}
            />
          )}
          <div className="grid min-w-0 grid-cols-1 gap-6 sm:gap-8">
            <ProfileCard
              variant="outlined"
              className={settingsCardClassName}
              name={teacher.name}
              email={teacher.email}
              role={teacher.role}
              joinedAt={joinedFormatted}
              lastLoginAt={lastLoginFormatted}
            />
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid min-w-0 grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-2">
            <ChangePasswordCard
              variant="outlined"
              className={settingsCardClassName}
            />
            <SessionsCard className={settingsCardClassName} />
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <div className="grid min-w-0 grid-cols-1 gap-6 sm:gap-8">
            <AppearanceCard className={settingsCardClassName} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
