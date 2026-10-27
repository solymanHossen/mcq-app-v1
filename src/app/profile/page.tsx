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
      <Tabs defaultValue="profile" className="w-full space-y-6">
        <div className="flex scrollbar-none items-center justify-start overflow-x-auto pb-1">
          <TabsList className="flex h-14 w-full items-center gap-1.5 rounded-2xl border border-border/80 bg-card p-1.5 shadow-xs sm:w-auto">
            <TabsTrigger
              value="profile"
              className="flex h-11 cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md sm:text-base"
            >
              <UserIcon className="size-4" />
              <span>Profile</span>
            </TabsTrigger>

            <TabsTrigger
              value="security"
              className="flex h-11 cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md sm:text-base"
            >
              <KeyRound className="size-4" />
              <span>Security</span>
            </TabsTrigger>

            <TabsTrigger
              value="activity"
              className="flex h-11 cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md sm:text-base"
            >
              {profile.role === "STUDENT" && <Trophy className="size-4" />}
              {profile.role === "TEACHER" && (
                <ClipboardList className="size-4" />
              )}
              {(profile.role === "ADMIN" || profile.role === "SUPER_ADMIN") && (
                <ShieldCheck className="size-4" />
              )}
              <span>Activity</span>
            </TabsTrigger>

            <TabsTrigger
              value="appearance"
              className="flex h-11 cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md sm:text-base"
            >
              <Palette className="size-4" />
              <span>Appearance</span>
            </TabsTrigger>

            {billingEnabled && (
              <TabsTrigger
                value="billing"
                className="flex h-11 cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md sm:text-base"
              >
                <CreditCard className="size-4" />
                <span>Billing</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* ================= TAB 1: PROFILE & PERSONAL DETAILS ================= */}
        <TabsContent value="profile" className="space-y-6 pt-2">
          {profile.role === "TEACHER" && (
            <VerificationStatusCard
              status={profile.teacherVerificationStatus}
              note={profile.teacherVerificationNote}
            />
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
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
        <TabsContent value="security" className="space-y-6 pt-2">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <ChangePasswordCard />
            <SessionsCard />
          </div>
        </TabsContent>

        {/* ================= TAB 3: DYNAMIC ACTIVITY PER ROLE ================= */}
        <TabsContent value="activity" className="space-y-6 pt-2">
          {profile.role === "STUDENT" && (
            <StudentActivityCard
              recentAttempts={profile.recentAttempts}
              bookmarksCount={profile._count.bookmarks}
            />
          )}

          {profile.role === "TEACHER" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Card className="rounded-[24px] border border-border/80 shadow-xs">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <ClipboardList className="size-4 text-primary" />
                      Created Exams
                    </CardTitle>
                    <CardDescription>
                      Total exams authored and scheduled for students.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-heading text-3xl font-extrabold text-foreground">
                      {profile._count.exams}
                    </p>
                    <div className="mt-4">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                      >
                        <Link href="/teacher/exams">Manage Exams</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[24px] border border-border/80 shadow-xs">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-semibold">
                      <BookOpen className="size-4 text-primary" />
                      Question Bank
                    </CardTitle>
                    <CardDescription>
                      MCQs and assessment questions authored in your repository.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-heading text-3xl font-extrabold text-foreground">
                      {profile._count.questions}
                    </p>
                    <div className="mt-4">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                      >
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <Link
                  href="/admin/users"
                  className="group flex flex-col justify-between rounded-[24px] border border-border/80 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                      <Users className="size-5" />
                    </span>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      User Management
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      Manage students, teachers, suspensions, and role
                      delegation.
                    </p>
                  </div>
                  <span className="mt-5 text-xs font-semibold text-primary group-hover:underline">
                    Open Directory →
                  </span>
                </Link>

                <Link
                  href="/admin/teachers"
                  className="group flex flex-col justify-between rounded-[24px] border border-border/80 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                      <ShieldCheck className="size-5" />
                    </span>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      Teacher Verifications
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      Review pending teacher applications and grant publishing
                      credentials.
                    </p>
                  </div>
                  <span className="mt-5 text-xs font-semibold text-primary group-hover:underline">
                    Review Queue →
                  </span>
                </Link>

                <Link
                  href="/admin/audit-log"
                  className="group flex flex-col justify-between rounded-[24px] border border-border/80 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                      <ScrollText className="size-5" />
                    </span>
                    <h3 className="font-heading text-lg font-bold text-foreground">
                      Audit Log
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      Inspect security events, logins, and administrative
                      actions.
                    </p>
                  </div>
                  <span className="mt-5 text-xs font-semibold text-primary group-hover:underline">
                    View Logs →
                  </span>
                </Link>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ================= TAB 4: APPEARANCE & PREFERENCES ================= */}
        <TabsContent value="appearance" className="space-y-6 pt-2">
          <AppearanceCard />
        </TabsContent>

        {/* ================= TAB 5: BILLING & SUBSCRIPTIONS ================= */}
        {billingEnabled && (
          <TabsContent value="billing" className="space-y-6 pt-2">
            <Card className="rounded-[24px] border border-border/80 shadow-xs">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-heading text-lg font-bold text-foreground sm:text-xl">
                      Subscription & Plan
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground sm:text-[13px]">
                      Review your current tier, billing frequency, and active
                      perks.
                    </CardDescription>
                  </div>
                  <Badge
                    variant={activeSubscription ? "default" : "secondary"}
                    className="rounded-lg"
                  >
                    {activeSubscription
                      ? activeSubscription.status
                      : "Free Tier"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {activeSubscription ? (
                  <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/30 p-4">
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
                  <div className="space-y-1.5 rounded-2xl border border-border/70 bg-muted/20 p-4.5">
                    <p className="text-sm font-semibold text-foreground">
                      Free Tier Active
                    </p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      You are enjoying standard platform access. Upgrade anytime
                      for unlimited exams and premium question bank features.
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    asChild
                    className="h-11 rounded-xl px-5 text-sm font-semibold"
                  >
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
