"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  ArrowRight,
  Award,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  FileSpreadsheet,
  GraduationCap,
  HelpCircle,
  KeyRound,
  Palette,
  Plus,
  ScrollText,
  ShieldCheck,
  Sparkles,
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
      label:
        profile.role === "TEACHER"
          ? "Faculty Portfolio"
          : profile.role === "STUDENT"
            ? "Academic Activity"
            : "Platform Governance",
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
      {/* ================= GORGEOUS MODERN SEGMENTED PILL DOCK ================= */}
      <div className="flex items-center overflow-x-auto pb-1 scrollbar-none">
        <nav
          role="tablist"
          aria-label="Profile navigation sections"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-border/80 bg-muted/40 p-1.5 backdrop-blur-xl sm:gap-2"
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
                  "group relative flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 select-none sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-[14px]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 transition-transform duration-200 group-hover:scale-105 sm:size-4.5",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <span>{tab.label}</span>

                {tab.badge !== undefined && (
                  <span
                    className={cn(
                      "ml-0.5 inline-flex size-5 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-foreground shadow-2xs"
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
            className="animate-in space-y-8 duration-300 fade-in-50 slide-in-from-bottom-2"
          >
            {/* 1. STUDENT VIEW */}
            {profile.role === "STUDENT" && (
              <div className="space-y-8">
                <StudentActivityCard
                  recentAttempts={profile.recentAttempts}
                  bookmarksCount={profile._count.bookmarks}
                />

                {/* Badges showcase if student has earned achievements */}
                {profile.badges.length > 0 && (
                  <Card className="rounded-[28px] border border-border/80 shadow-xs">
                    <CardHeader className="p-6 sm:p-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                            Earned Achievements &amp; Badges
                          </CardTitle>
                          <CardDescription className="mt-1 text-sm text-muted-foreground sm:text-base">
                            Milestones unlocked through continuous study and
                            examination excellence.
                          </CardDescription>
                        </div>
                        <Badge
                          variant="secondary"
                          className="gap-1.5 rounded-xl px-3 py-1 text-xs font-semibold"
                        >
                          <Trophy className="size-3.5 text-primary" />
                          <span>{profile.badges.length} Unlocked</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {profile.badges.map((badge) => (
                          <div
                            key={badge.id}
                            className="flex items-center gap-3.5 rounded-2xl border border-border/70 bg-muted/20 p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
                          >
                            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <Award className="size-5" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-heading text-sm font-bold text-foreground capitalize truncate">
                                {badge.badgeKey
                                  .replace(/_/g, " ")
                                  .toLowerCase()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Earned{" "}
                                {new Intl.DateTimeFormat("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }).format(new Date(badge.earnedAt))}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* 2. TEACHER VIEW — MATCHING TEACHER DIRECTORY SYSTEM */}
            {profile.role === "TEACHER" && (
              <div className="space-y-8">
                {/* Quick Educator Action Hub */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                  <Link
                    href="/teacher/exams/new"
                    className="group flex items-center justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:border-primary/50 hover:bg-muted/30 hover:shadow-lg active:scale-[0.99] sm:p-7"
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs transition-transform duration-300 group-hover:scale-110 sm:size-16">
                        <Plus className="size-7 sm:size-8" />
                      </span>
                      <div>
                        <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                          Create Exam
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                          Author new timed assessment
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
                  </Link>

                  <Link
                    href="/teacher/questions/new"
                    className="group flex items-center justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:border-primary/50 hover:bg-muted/30 hover:shadow-lg active:scale-[0.99] sm:p-7"
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 shadow-2xs transition-transform duration-300 group-hover:scale-110 sm:size-16 dark:bg-indigo-500/15 dark:text-indigo-400">
                        <BookOpen className="size-7 sm:size-8" />
                      </span>
                      <div>
                        <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                          Add Questions
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                          Expand question bank vault
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
                  </Link>

                  <Link
                    href="/teacher/exams"
                    className="group flex items-center justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:border-primary/50 hover:bg-muted/30 hover:shadow-lg active:scale-[0.99] sm:p-7"
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-2xs transition-transform duration-300 group-hover:scale-110 sm:size-16 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <Users className="size-7 sm:size-8" />
                      </span>
                      <div>
                        <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                          Cohorts &amp; Results
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                          Review student submissions
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-foreground sm:size-6" />
                  </Link>
                </div>

                {/* Academic Specialization Subjects (Clean Tags matching Teacher Directory) */}
                {profile.teacherSubjects.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm">
                      Authored Academic Subjects
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                      {profile.teacherSubjects.map((subject) => (
                        <span
                          key={subject}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-muted/60 px-3.5 py-1.5 text-xs font-semibold text-foreground/90 transition-colors hover:bg-muted/90 sm:px-4 sm:py-2 sm:text-sm"
                        >
                          <BookOpen className="size-3.5 text-primary" />
                          <span>{subject}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sculpted 3-Tile KPI Metrics System */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                  {/* Tile 1: Created Exams */}
                  <div className="group flex flex-col justify-between rounded-2xl bg-card p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                        Created Exams
                      </span>
                      <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                        <FileSpreadsheet className="size-4.5" />
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                        {profile._count.exams}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
                        Total authored exams
                      </p>
                    </div>
                  </div>

                  {/* Tile 2: Question Vault */}
                  <div className="group flex flex-col justify-between rounded-2xl bg-card p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                        Question Bank
                      </span>
                      <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 transition-transform group-hover:scale-110 dark:bg-indigo-500/15 dark:text-indigo-400">
                        <HelpCircle className="size-4.5" />
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                        {profile._count.questions}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
                        Items in question vault
                      </p>
                    </div>
                  </div>

                  {/* Tile 3: Student Submissions */}
                  <div className="group flex flex-col justify-between rounded-2xl bg-card p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs">
                        Student Takers
                      </span>
                      <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <Users className="size-4.5" />
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="font-heading text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                        {profile.teacherTotalAttempts}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
                        Submissions recorded
                      </p>
                    </div>
                  </div>
                </div>

                {/* Published & Draft Assessment Tracks Showcase */}
                <Card className="rounded-[28px] border border-border/80 shadow-xs">
                  <CardHeader className="border-b border-border/60 p-6 sm:p-8">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <CardTitle className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                          Recent Authored Exams
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm text-muted-foreground sm:text-base">
                          Your examination tracks, scheduled durations, question
                          counts, and student cohort participation.
                        </CardDescription>
                      </div>
                      <Button
                        asChild
                        variant="secondary"
                        className="self-start rounded-xl text-xs font-semibold sm:self-auto sm:text-sm"
                      >
                        <Link href="/teacher/exams">
                          <span>Manage all exams</span>
                          <ChevronRight className="ml-1 size-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 sm:p-8">
                    {profile.teacherExams.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                          <BookOpenCheck className="size-7" />
                        </div>
                        <p className="text-lg font-bold text-foreground">
                          No exams created yet
                        </p>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                          Start authoring assessments to publish tests to
                          students and review their performance here.
                        </p>
                        <Button
                          asChild
                          className="mt-6 rounded-xl px-6 text-sm font-semibold shadow-xs"
                        >
                          <Link href="/teacher/exams/new">
                            Create First Exam
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {profile.teacherExams.map((exam) => (
                          <div
                            key={exam.id}
                            className="group flex flex-col justify-between gap-3.5 rounded-2xl border border-border/70 bg-card p-4 transition-all duration-200 hover:border-border hover:bg-muted/30 hover:shadow-xs min-[540px]:flex-row min-[540px]:items-center sm:p-5"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <h4 className="font-heading text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                                  {exam.title}
                                </h4>
                                <Badge
                                  variant={
                                    exam.status === "PUBLISHED"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="rounded-lg text-[11px] font-semibold"
                                >
                                  {exam.status === "PUBLISHED"
                                    ? "Published"
                                    : "Draft"}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground sm:text-sm">
                                <span className="inline-flex items-center gap-1.5 font-medium">
                                  <Clock className="size-3.5 text-muted-foreground" />
                                  <span>{exam.durationMinutes} min</span>
                                </span>
                                <span>•</span>
                                <span className="font-medium">
                                  {exam.questionsCount} questions
                                </span>
                                <span>•</span>
                                <span className="font-semibold text-foreground">
                                  {exam.attemptsCount} student takers
                                </span>
                              </div>
                            </div>

                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="self-start rounded-xl text-xs font-semibold shadow-2xs hover:border-primary/40 min-[540px]:self-center"
                            >
                              <Link href={`/teacher/exams/${exam.id}`}>
                                <span>Manage Exam</span>
                                <ArrowRight className="ml-1 size-3.5" />
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 3. ADMIN VIEW */}
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
                        User Directory &amp; Roles
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
                        Teacher Verification Queue
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

