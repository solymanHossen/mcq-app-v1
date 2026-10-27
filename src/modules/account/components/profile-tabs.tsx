"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  BookOpen,
  ClipboardList,
  CreditCard,
  KeyRound,
  Palette,
  ScrollText,
  ShieldCheck,
  Trophy,
  User as UserIcon,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { ProfileCard } from "./profile-card"
import { AccountDetailsCard } from "./account-details-card"
import { VerificationStatusCard } from "./verification-status-card"
import { ChangePasswordCard } from "./change-password-card"
import { SessionsCard } from "./sessions-card"
import { StudentActivityCard } from "./student-activity-card"
import { AppearanceCard } from "./appearance-card"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { FullProfileData } from "../queries"

interface ProfileTabsProps {
  profile: FullProfileData
  billingEnabled: boolean
}

type TabKey = "profile" | "security" | "activity" | "appearance" | "billing"

export function ProfileTabs({ profile, billingEnabled }: ProfileTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const queryTab = searchParams.get("tab") as TabKey | null
  const initialTab: TabKey =
    queryTab &&
    ["profile", "security", "activity", "appearance", "billing"].includes(
      queryTab
    )
      ? queryTab
      : "profile"

  const [activeTab, setActiveTab] = React.useState<TabKey>(initialTab)

  // Keep state in sync if URL search param changes
  React.useEffect(() => {
    if (
      queryTab &&
      ["profile", "security", "activity", "appearance", "billing"].includes(
        queryTab
      )
    ) {
      setActiveTab(queryTab)
    }
  }, [queryTab])

  function handleSelectTab(tab: TabKey) {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    if (tab === "profile") {
      params.delete("tab")
    } else {
      params.set("tab", tab)
    }
    const queryString = params.toString()
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(targetUrl, { scroll: false })
  }

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

  const tabsConfig: Array<{
    key: TabKey
    label: string
    icon: React.ElementType
    badge?: string | number
  }> = [
    { key: "profile", label: "Profile", icon: UserIcon },
    { key: "security", label: "Security", icon: KeyRound },
    {
      key: "activity",
      label: "Activity",
      icon:
        profile.role === "STUDENT"
          ? Trophy
          : profile.role === "TEACHER"
            ? ClipboardList
            : ShieldCheck,
      badge:
        profile.role === "STUDENT"
          ? profile._count.examAttempts > 0
            ? profile._count.examAttempts
            : undefined
          : profile.role === "TEACHER"
            ? profile._count.exams > 0
              ? profile._count.exams
              : undefined
            : undefined,
    },
    { key: "appearance", label: "Appearance", icon: Palette },
  ]

  if (billingEnabled) {
    tabsConfig.push({
      key: "billing",
      label: "Billing",
      icon: CreditCard,
    })
  }

  return (
    <div className="w-full space-y-8">
      {/* ================= ULTRA-SMOOTH, LARGE-SIZE SEGMENTED TABS NAV ================= */}
      <div className="relative">
        <div className="flex scrollbar-none items-center overflow-x-auto pb-1">
          <nav
            role="tablist"
            aria-label="Profile navigation sections"
            className="flex min-w-full items-center gap-1.5 rounded-2xl border border-border/80 bg-card/90 p-1.5 shadow-xs backdrop-blur-md sm:w-auto sm:min-w-0 sm:rounded-3xl sm:p-2"
          >
            {tabsConfig.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key

              return (
                <button
                  key={tab.key}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.key}`}
                  id={`tab-${tab.key}`}
                  onClick={() => handleSelectTab(tab.key)}
                  className={cn(
                    "group relative flex h-12 shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-5 text-sm font-semibold transition-all duration-200 select-none sm:h-13 sm:rounded-2xl sm:px-6 sm:text-base",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4.5 transition-transform duration-200 group-hover:scale-110 sm:size-5",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-primary"
                    )}
                  />
                  <span>{tab.label}</span>

                  {tab.badge !== undefined && (
                    <span
                      className={cn(
                        "ml-1 inline-flex size-5 items-center justify-center rounded-full text-[11px] font-bold",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* ================= TAB PANELS WITH SMOOTH TRANSITIONS ================= */}
      <div className="w-full">
        {/* TAB 1: PROFILE & PERSONAL DETAILS */}
        {activeTab === "profile" && (
          <div
            role="tabpanel"
            id="panel-profile"
            aria-labelledby="tab-profile"
            className="animate-in space-y-6 duration-300 fade-in-50 slide-in-from-bottom-2"
          >
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
          </div>
        )}

        {/* TAB 2: SECURITY & PASSWORDS */}
        {activeTab === "security" && (
          <div
            role="tabpanel"
            id="panel-security"
            aria-labelledby="tab-security"
            className="animate-in space-y-6 duration-300 fade-in-50 slide-in-from-bottom-2"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <ChangePasswordCard />
              <SessionsCard />
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC ACTIVITY PER ROLE */}
        {activeTab === "activity" && (
          <div
            role="tabpanel"
            id="panel-activity"
            aria-labelledby="tab-activity"
            className="animate-in space-y-6 duration-300 fade-in-50 slide-in-from-bottom-2"
          >
            {profile.role === "STUDENT" && (
              <StudentActivityCard
                recentAttempts={profile.recentAttempts}
                bookmarksCount={profile._count.bookmarks}
              />
            )}

            {profile.role === "TEACHER" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
                  <Card className="rounded-[28px] border border-border/80 p-2 shadow-xs transition-all hover:shadow-md">
                    <CardHeader className="space-y-2 p-6 sm:p-7">
                      <div className="flex size-13 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <ClipboardList className="size-6" />
                      </div>
                      <CardTitle className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                        Created Exams
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground sm:text-base">
                        Total exams authored, published, and scheduled for
                        student cohorts.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6 pt-0 sm:p-7 sm:pt-0">
                      <p className="font-heading text-4xl font-black text-foreground sm:text-5xl">
                        {profile._count.exams}
                      </p>
                      <div>
                        <Button
                          asChild
                          size="lg"
                          className="h-12 rounded-xl px-6 text-sm font-semibold shadow-xs"
                        >
                          <Link href="/teacher/exams">Manage Exams Pool →</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-[28px] border border-border/80 p-2 shadow-xs transition-all hover:shadow-md">
                    <CardHeader className="space-y-2 p-6 sm:p-7">
                      <div className="flex size-13 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <BookOpen className="size-6" />
                      </div>
                      <CardTitle className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                        Question Bank
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground sm:text-base">
                        MCQs and assessment questions authored in your private
                        repository.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6 pt-0 sm:p-7 sm:pt-0">
                      <p className="font-heading text-4xl font-black text-foreground sm:text-5xl">
                        {profile._count.questions}
                      </p>
                      <div>
                        <Button
                          asChild
                          variant="outline"
                          size="lg"
                          className="h-12 rounded-xl px-6 text-sm font-semibold shadow-xs hover:border-primary/40"
                        >
                          <Link href="/teacher/questions">
                            Explore Questions Vault →
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {(profile.role === "ADMIN" || profile.role === "SUPER_ADMIN") && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
                  <Link
                    href="/admin/users"
                    className="group flex flex-col justify-between rounded-[28px] border border-border/80 bg-card p-7 shadow-xs transition-all duration-300 hover:border-primary/50 hover:bg-muted/30 hover:shadow-lg active:scale-[0.99]"
                  >
                    <div className="space-y-3.5">
                      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs transition-transform duration-300 group-hover:scale-110">
                        <Users className="size-7" />
                      </span>
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        User Management
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Inspect active students, teachers, role elevations, and
                        account status across the platform.
                      </p>
                    </div>
                    <span className="mt-6 text-sm font-semibold text-primary group-hover:underline">
                      Open Directory →
                    </span>
                  </Link>

                  <Link
                    href="/admin/teachers"
                    className="group flex flex-col justify-between rounded-[28px] border border-border/80 bg-card p-7 shadow-xs transition-all duration-300 hover:border-primary/50 hover:bg-muted/30 hover:shadow-lg active:scale-[0.99]"
                  >
                    <div className="space-y-3.5">
                      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs transition-transform duration-300 group-hover:scale-110">
                        <ShieldCheck className="size-7" />
                      </span>
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        Teacher Verification
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Review pending teacher applications and grant publishing
                        credentials to verified educators.
                      </p>
                    </div>
                    <span className="mt-6 text-sm font-semibold text-primary group-hover:underline">
                      Review Verification Queue →
                    </span>
                  </Link>

                  <Link
                    href="/admin/audit-log"
                    className="group flex flex-col justify-between rounded-[28px] border border-border/80 bg-card p-7 shadow-xs transition-all duration-300 hover:border-primary/50 hover:bg-muted/30 hover:shadow-lg active:scale-[0.99]"
                  >
                    <div className="space-y-3.5">
                      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs transition-transform duration-300 group-hover:scale-110">
                        <ScrollText className="size-7" />
                      </span>
                      <h3 className="font-heading text-xl font-bold text-foreground">
                        System Audit Logs
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Trace administrative security logs, privileged actions,
                        and system events in real-time.
                      </p>
                    </div>
                    <span className="mt-6 text-sm font-semibold text-primary group-hover:underline">
                      Inspect Audit Trail →
                    </span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: APPEARANCE & PREFERENCES */}
        {activeTab === "appearance" && (
          <div
            role="tabpanel"
            id="panel-appearance"
            aria-labelledby="tab-appearance"
            className="animate-in space-y-6 duration-300 fade-in-50 slide-in-from-bottom-2"
          >
            <AppearanceCard />
          </div>
        )}

        {/* TAB 5: BILLING & SUBSCRIPTIONS */}
        {activeTab === "billing" && billingEnabled && (
          <div
            role="tabpanel"
            id="panel-billing"
            aria-labelledby="tab-billing"
            className="animate-in space-y-6 duration-300 fade-in-50 slide-in-from-bottom-2"
          >
            <Card className="rounded-[28px] border border-border/80 p-2 shadow-xs sm:p-4">
              <CardHeader className="p-6 sm:p-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <CardTitle className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                      Subscription & Active Plan
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm text-muted-foreground sm:text-base">
                      Review your current tier, billing frequency, and active
                      privileges.
                    </CardDescription>
                  </div>
                  <Badge
                    variant={activeSubscription ? "default" : "secondary"}
                    className="self-start rounded-xl px-3.5 py-1 text-xs font-semibold sm:self-auto sm:text-sm"
                  >
                    {activeSubscription
                      ? activeSubscription.status
                      : "Free Tier Active"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6 pt-0 sm:p-7 sm:pt-0">
                {activeSubscription ? (
                  <div className="space-y-3 rounded-2xl border border-border/80 bg-muted/30 p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-foreground sm:text-xl">
                        {activeSubscription.plan.name}
                      </p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {activeSubscription.plan.billingInterval.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Period renews on{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                      }).format(new Date(activeSubscription.currentPeriodEnd))}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 rounded-2xl border border-border/80 bg-muted/20 p-5 sm:p-6">
                    <p className="text-base font-bold text-foreground sm:text-lg">
                      Free Tier Account
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      You are enjoying standard platform access. Upgrade anytime
                      for unlimited exams, priority scoring, and premium
                      question vault features.
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 rounded-xl px-7 text-sm font-semibold shadow-xs"
                  >
                    <Link href="/billing">Manage Billing & Plans →</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
