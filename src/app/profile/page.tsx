import Link from "next/link"
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  Palette,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  User as UserIcon,
  Users,
} from "lucide-react"

import { requireUser } from "@/lib/authorization"
import { getFullProfileData } from "@/modules/account/queries"
import { getSystemSettings } from "@/modules/settings/queries"
import { ProfileHero } from "@/modules/account/components/profile-hero"
import { ProfileCard } from "@/modules/account/components/profile-card"
import { ChangePasswordCard } from "@/modules/account/components/change-password-card"
import { SessionsCard } from "@/modules/account/components/sessions-card"
import { AppearanceCard } from "@/modules/account/components/appearance-card"
import { VerificationStatusCard } from "@/modules/account/components/verification-status-card"
import { AccountDetailsCard } from "@/modules/account/components/account-details-card"
import { StudentActivityCard } from "@/modules/account/components/student-activity-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

  const joinedFormatted = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(profile.createdAt))

  const lastLoginFormatted = profile.lastLoginAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(profile.lastLoginAt))
    : null

  const activeSubscription = profile.subscriptions[0] ?? null

  return (
    <div className="space-y-8">
      {/* World-Class Hero Banner */}
      <ProfileHero user={profile} />

      {/* Profile Management Tabs System */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl border border-border/60 bg-muted/60 p-1.5 sm:grid-cols-4 lg:inline-flex lg:w-auto">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all data-[state=active]:shadow-xs sm:text-sm"
          >
            <UserIcon className="size-4" />
            <span>Profile</span>
          </TabsTrigger>

          <TabsTrigger
            value="security"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all data-[state=active]:shadow-xs sm:text-sm"
          >
            <KeyRound className="size-4" />
            <span>Security</span>
          </TabsTrigger>

          <TabsTrigger
            value="activity"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all data-[state=active]:shadow-xs sm:text-sm"
          >
            {profile.role === "STUDENT" && <Trophy className="size-4" />}
            {profile.role === "TEACHER" && <ClipboardList className="size-4" />}
            {(profile.role === "ADMIN" || profile.role === "SUPER_ADMIN") && (
              <ShieldCheck className="size-4" />
            )}
            <span>Activity</span>
          </TabsTrigger>

          <TabsTrigger
            value="appearance"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all data-[state=active]:shadow-xs sm:text-sm"
          >
            <Palette className="size-4" />
            <span>Appearance</span>
          </TabsTrigger>

          {billingEnabled && (
            <TabsTrigger
              value="billing"
              className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all data-[state=active]:shadow-xs sm:text-sm"
            >
              <CreditCard className="size-4" />
              <span>Billing</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* ================= TAB 1: PROFILE & PERSONAL DETAILS ================= */}
        <TabsContent value="profile" className="space-y-6 pt-6">
          {profile.role === "TEACHER" && (
            <VerificationStatusCard
              status={profile.teacherVerificationStatus}
              note={profile.teacherVerificationNote}
            />
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ProfileCard
              name={profile.name}
              email={profile.email}
              role={profile.role}
              joinedAt={joinedFormatted}
              lastLoginAt={lastLoginFormatted}
            />

            <AccountDetailsCard
              id={profile.id}
              role={profile.role}
              createdAt={profile.createdAt}
              isEmailVerified={profile.isEmailVerified}
            />
          </div>
        </TabsContent>

        {/* ================= TAB 2: SECURITY & PASSWORDS ================= */}
        <TabsContent value="security" className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChangePasswordCard />
            <SessionsCard />
          </div>
        </TabsContent>

        {/* ================= TAB 3: DYNAMIC ACTIVITY PER ROLE ================= */}
        <TabsContent value="activity" className="space-y-6 pt-6">
          {profile.role === "STUDENT" && (
            <StudentActivityCard
              recentAttempts={profile.recentAttempts}
              bookmarksCount={profile._count.bookmarks}
            />
          )}

          {profile.role === "TEACHER" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ClipboardList className="size-4 text-primary" />
                      Created Exams
                    </CardTitle>
                    <CardDescription>
                      Total exams authored and scheduled for students.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-extrabold text-foreground">
                      {profile._count.exams}
                    </p>
                    <div className="mt-4">
                      <Button asChild size="sm" variant="outline">
                        <Link href="/teacher/exams">Manage Exams</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BookOpen className="size-4 text-amber-500" />
                      Question Bank
                    </CardTitle>
                    <CardDescription>
                      MCQs and assessment questions authored in your repository.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-extrabold text-foreground">
                      {profile._count.questions}
                    </p>
                    <div className="mt-4">
                      <Button asChild size="sm" variant="outline">
                        <Link href="/teacher/questions">Explore Questions</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {(profile.role === "ADMIN" || profile.role === "SUPER_ADMIN") && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link
                  href="/admin/users"
                  className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="space-y-2">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Users className="size-5" />
                    </span>
                    <h3 className="font-semibold text-foreground">
                      User Management
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Manage students, teachers, suspensions, and role changes.
                    </p>
                  </div>
                  <span className="mt-4 text-xs font-semibold text-primary group-hover:underline">
                    Open Directory →
                  </span>
                </Link>

                <Link
                  href="/admin/teachers"
                  className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="space-y-2">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                      <ShieldCheck className="size-5" />
                    </span>
                    <h3 className="font-semibold text-foreground">
                      Teacher Verifications
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Review pending teacher applications and grant publishing
                      rights.
                    </p>
                  </div>
                  <span className="mt-4 text-xs font-semibold text-primary group-hover:underline">
                    Review Queue →
                  </span>
                </Link>

                <Link
                  href="/admin/audit-log"
                  className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="space-y-2">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                      <ScrollText className="size-5" />
                    </span>
                    <h3 className="font-semibold text-foreground">Audit Log</h3>
                    <p className="text-xs text-muted-foreground">
                      Inspect security events, logins, and administrative
                      actions.
                    </p>
                  </div>
                  <span className="mt-4 text-xs font-semibold text-primary group-hover:underline">
                    View Logs →
                  </span>
                </Link>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ================= TAB 4: APPEARANCE & PREFERENCES ================= */}
        <TabsContent value="appearance" className="space-y-6 pt-6">
          <AppearanceCard />
        </TabsContent>

        {/* ================= TAB 5: BILLING & SUBSCRIPTIONS ================= */}
        {billingEnabled && (
          <TabsContent value="billing" className="space-y-6 pt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subscription & Plan</CardTitle>
                    <CardDescription>
                      Review your current tier, billing frequency, and active
                      perks.
                    </CardDescription>
                  </div>
                  <Badge variant={activeSubscription ? "default" : "secondary"}>
                    {activeSubscription
                      ? activeSubscription.status
                      : "Free Tier"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeSubscription ? (
                  <div className="space-y-2 rounded-xl border border-border/70 bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">
                        {activeSubscription.plan.name}
                      </p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {activeSubscription.plan.billingInterval.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Period renews on{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(new Date(activeSubscription.currentPeriodEnd))}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 rounded-xl border border-border/70 bg-muted/20 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      Free Tier
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You are enjoying standard platform access. Upgrade anytime
                      for unlimited exams and pro features.
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button asChild>
                    <Link href="/billing">Manage Billing & Plans</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
