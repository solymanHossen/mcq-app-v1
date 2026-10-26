import { requireRole, TEACHER_ROLES } from "@/lib/authorization"
import { getAccountOverview } from "@/modules/account/queries"
import { ProfileCard } from "@/modules/account/components/profile-card"
import { VerificationStatusCard } from "@/modules/account/components/verification-status-card"
import { ChangePasswordCard } from "@/modules/account/components/change-password-card"
import { SessionsCard } from "@/modules/account/components/sessions-card"
import { AppearanceCard } from "@/modules/account/components/appearance-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false

export default async function TeacherSettingsPage() {
  const teacher = await requireRole(...TEACHER_ROLES)
  const overview = await getAccountOverview(teacher.id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, security, and how ExamHub looks.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 pt-4">
          {teacher.role === "TEACHER" && (
            <VerificationStatusCard
              status={teacher.teacherVerificationStatus}
              note={overview.teacherVerificationNote}
            />
          )}
          <ProfileCard
            name={teacher.name}
            email={teacher.email}
            role={teacher.role}
            joinedAt={overview.createdAt.toLocaleDateString()}
            lastLoginAt={overview.lastLoginAt?.toLocaleDateString() ?? null}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-4 pt-4">
          <ChangePasswordCard />
          <SessionsCard />
        </TabsContent>

        <TabsContent value="appearance" className="pt-4">
          <AppearanceCard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
