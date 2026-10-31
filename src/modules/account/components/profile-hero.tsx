"use client"

import * as React from "react"
import {
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Copy,
  Crown,
  Flame,
  GraduationCap,
  Mail,
  ShieldCheck,
  Trophy,
  User as UserIcon,
  Users,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type {
  Role,
  TeacherVerificationStatus,
} from "@/prisma/generated/prisma/client"

interface ProfileHeroProps {
  className?: string
  user: {
    id: string
    name: string
    email: string
    role: Role
    isEmailVerified: boolean
    createdAt: Date
    lastLoginAt: Date | null
    teacherVerificationStatus?: TeacherVerificationStatus
    teacherTotalAttempts?: number
    adminStats?: {
      totalUsers: number
      totalPlatformExams: number
      pendingVerifications: number
    } | null
    streak?: {
      currentStreak: number
      longestStreak: number
    } | null
    xpTotal?: number
    _count?: {
      examAttempts?: number
      badges?: number
      questions?: number
      exams?: number
    }
  }
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  )
}

function getRoleLabel(role: Role) {
  switch (role) {
    case "SUPER_ADMIN":
      return { label: "Super Admin", icon: Crown }
    case "ADMIN":
      return { label: "Admin", icon: ShieldCheck }
    case "TEACHER":
      return { label: "Teacher", icon: GraduationCap }
    case "STUDENT":
    default:
      return { label: "Student", icon: UserIcon }
  }
}

export function ProfileHero({ user, className }: ProfileHeroProps) {
  const [copiedEmail, setCopiedEmail] = React.useState(false)
  const roleInfo = getRoleLabel(user.role)
  const RoleIcon = roleInfo.icon

  const joinedFormatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(user.createdAt))

  function handleCopyEmail() {
    navigator.clipboard.writeText(user.email)
    setCopiedEmail(true)
    toast.success("Email copied to clipboard")
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border-none bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      {/* Subtle Radiant Top Accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
      />

      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        {/* ================= LEFT: CRISP IDENTITY ================= */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="size-16 ring-2 ring-primary/15 sm:size-18">
              <AvatarFallback className="bg-primary/10 font-heading text-xl font-extrabold tracking-tight text-primary sm:text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 space-y-1.5">
            {/* Name + Single Role Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading text-xl font-extrabold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                {user.name}
              </h1>
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-semibold"
              >
                <RoleIcon className="size-3 text-primary" />
                <span>{roleInfo.label}</span>
              </Badge>
            </div>

            {/* Clean Meta Row (Email, Verification, Joined) */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground sm:text-sm">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="group inline-flex items-center gap-1.5 rounded-lg bg-muted/40 px-2.5 py-1 font-medium transition-colors hover:bg-muted/70 hover:text-foreground"
                title="Click to copy email address"
              >
                <Mail className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                <span>{user.email}</span>
                {copiedEmail ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-70" />
                )}
              </button>

              <span className="text-muted-foreground/30">•</span>

              {user.isEmailVerified ? (
                <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <Clock className="size-3.5" />
                  <span>Unverified</span>
                </span>
              )}

              <span className="hidden text-muted-foreground/30 sm:inline">
                •
              </span>

              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                <Calendar className="size-3 text-muted-foreground" />
                <span>Joined {joinedFormatted}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: EXECUTIVE STATS CHIPS ================= */}
        <div className="shrink-0 self-stretch sm:self-auto">
          {/* STUDENT STATS CHIPS */}
          {user.role === "STUDENT" && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Streak */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Flame className="size-4" />
                </span>
                <div className="leading-tight">
                  <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                    {user.streak?.currentStreak ?? 0}
                  </span>
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Streak
                  </span>
                </div>
              </div>

              {/* XP */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Zap className="size-4" />
                </span>
                <div className="leading-tight">
                  <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                    {user.xpTotal ?? 0}
                  </span>
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    XP
                  </span>
                </div>
              </div>

              {/* Exams */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-primary">
                  <ClipboardList className="size-4" />
                </span>
                <div className="leading-tight">
                  <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                    {user._count?.examAttempts ?? 0}
                  </span>
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Exams
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Trophy className="size-4" />
                </span>
                <div className="leading-tight">
                  <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                    {user._count?.badges ?? 0}
                  </span>
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Badges
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TEACHER STATS CHIPS */}
          {user.role === "TEACHER" && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Status */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-xl",
                    user.teacherVerificationStatus === "VERIFIED"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}
                >
                  <ShieldCheck className="size-4" />
                </span>
                <div className="leading-tight">
                  <span
                    className={cn(
                      "block font-heading text-sm font-black capitalize sm:text-base",
                      user.teacherVerificationStatus === "VERIFIED"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {user.teacherVerificationStatus?.toLowerCase() ?? "Pending"}
                  </span>
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Faculty
                  </span>
                </div>
              </div>

              {/* Exams */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ClipboardList className="size-4" />
                </span>
                <div className="leading-tight">
                  <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                    {user._count?.exams ?? 0}
                  </span>
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Exams
                  </span>
                </div>
              </div>

              {/* Questions */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-primary">
                  <BookOpen className="size-4" />
                </span>
                <div className="leading-tight">
                  <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                    {user._count?.questions ?? 0}
                  </span>
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Bank
                  </span>
                </div>
              </div>

              {/* Takers */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Users className="size-4" />
                </span>
                <div className="leading-tight">
                  <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                    {user.teacherTotalAttempts ?? 0}
                  </span>
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Takers
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN STATS CHIPS */}
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Users */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="size-4" />
                </span>
                <div className="leading-tight">
                  <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                    {user.adminStats?.totalUsers ?? "—"}
                  </span>
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Users
                  </span>
                </div>
              </div>

              {/* Live Exams */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-primary">
                  <ClipboardList className="size-4" />
                </span>
                <div className="leading-tight">
                  <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                    {user.adminStats?.totalPlatformExams ?? "—"}
                  </span>
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Exams
                  </span>
                </div>
              </div>

              {/* Queue */}
              <div className="flex items-center gap-2.5 rounded-2xl bg-muted/40 px-3.5 py-2 transition-all duration-200 hover:bg-muted/60">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Clock className="size-4" />
                </span>
                <div className="leading-tight">
                  <span className="block font-heading text-base font-black text-foreground sm:text-lg">
                    {user.adminStats?.pendingVerifications ?? 0}
                  </span>
                  <span className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Queue
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
