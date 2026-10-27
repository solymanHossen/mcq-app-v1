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
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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

export function ProfileHero({ user }: ProfileHeroProps) {
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
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-5 shadow-xs backdrop-blur-xl transition-all sm:p-7">
      {/* Subtle Radiant Top Accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
      />

      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        {/* ================= LEFT: CRISP IDENTITY ================= */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar with Online Beacon */}
          <div className="relative shrink-0">
            <Avatar className="size-16 border border-border/80 shadow-xs ring-2 ring-primary/15 sm:size-18">
              <AvatarFallback className="bg-primary/10 font-heading text-xl font-extrabold tracking-tight text-primary sm:text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span
              className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-card bg-emerald-500 shadow-xs"
              title="Active session"
            />
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
                className="group inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1 font-medium transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground"
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

              <span className="hidden text-muted-foreground/30 sm:inline">•</span>

              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                <Calendar className="size-3 text-muted-foreground" />
                <span>Joined {joinedFormatted}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: UNIFIED MINIMAL STATS STRIP ================= */}
        <div className="shrink-0 self-stretch sm:self-auto">
          {/* STUDENT STATS STRIP */}
          {user.role === "STUDENT" && (
            <div className="grid grid-cols-4 divide-x divide-border/60 rounded-2xl border border-border/70 bg-muted/25 p-2 backdrop-blur-md">
              <div className="flex flex-col items-center px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 sm:text-xs dark:text-amber-400">
                  <Flame className="size-3.5" />
                  Streak
                </span>
                <span className="font-heading text-lg font-black tracking-tight text-foreground sm:text-2xl">
                  {user.streak?.currentStreak ?? 0}
                </span>
              </div>

              <div className="flex flex-col items-center px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-primary sm:text-xs">
                  <Zap className="size-3.5" />
                  XP
                </span>
                <span className="font-heading text-lg font-black tracking-tight text-foreground sm:text-2xl">
                  {user.xpTotal ?? 0}
                </span>
              </div>

              <div className="flex flex-col items-center px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground sm:text-xs">
                  <Sparkles className="size-3.5" />
                  Exams
                </span>
                <span className="font-heading text-lg font-black tracking-tight text-foreground sm:text-2xl">
                  {user._count?.examAttempts ?? 0}
                </span>
              </div>

              <div className="flex flex-col items-center px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground sm:text-xs">
                  <Trophy className="size-3.5" />
                  Badges
                </span>
                <span className="font-heading text-lg font-black tracking-tight text-foreground sm:text-2xl">
                  {user._count?.badges ?? 0}
                </span>
              </div>
            </div>
          )}

          {/* TEACHER STATS STRIP */}
          {user.role === "TEACHER" && (
            <div className="grid grid-cols-4 divide-x divide-border/60 rounded-2xl border border-border/70 bg-muted/25 p-2 backdrop-blur-md">
              <div className="flex flex-col items-center px-3 py-1.5 sm:px-4 sm:py-2">
                <span
                  className={cn(
                    "flex items-center gap-1 text-[11px] font-bold sm:text-xs",
                    user.teacherVerificationStatus === "VERIFIED"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  )}
                >
                  <ShieldCheck className="size-3.5" />
                  Status
                </span>
                <span className="font-heading text-sm font-black capitalize sm:text-base">
                  {user.teacherVerificationStatus?.toLowerCase() ?? "Pending"}
                </span>
              </div>

              <div className="flex flex-col items-center px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-primary sm:text-xs">
                  <ClipboardList className="size-3.5" />
                  Exams
                </span>
                <span className="font-heading text-lg font-black tracking-tight text-foreground sm:text-2xl">
                  {user._count?.exams ?? 0}
                </span>
              </div>

              <div className="flex flex-col items-center px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground sm:text-xs">
                  <BookOpen className="size-3.5" />
                  Questions
                </span>
                <span className="font-heading text-lg font-black tracking-tight text-foreground sm:text-2xl">
                  {user._count?.questions ?? 0}
                </span>
              </div>

              <div className="flex flex-col items-center px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground sm:text-xs">
                  <Users className="size-3.5" />
                  Takers
                </span>
                <span className="font-heading text-lg font-black tracking-tight text-foreground sm:text-2xl">
                  {user.teacherTotalAttempts ?? 0}
                </span>
              </div>
            </div>
          )}

          {/* ADMIN STATS STRIP */}
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <div className="grid grid-cols-3 divide-x divide-border/60 rounded-2xl border border-border/70 bg-muted/25 p-2 backdrop-blur-md">
              <div className="flex flex-col items-center px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-primary sm:text-xs">
                  <Users className="size-3.5" />
                  Users
                </span>
                <span className="font-heading text-lg font-black tracking-tight text-foreground sm:text-2xl">
                  {user.adminStats?.totalUsers ?? "—"}
                </span>
              </div>

              <div className="flex flex-col items-center px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground sm:text-xs">
                  <Sparkles className="size-3.5" />
                  Live Exams
                </span>
                <span className="font-heading text-lg font-black tracking-tight text-foreground sm:text-2xl">
                  {user.adminStats?.totalPlatformExams ?? "—"}
                </span>
              </div>

              <div className="flex flex-col items-center px-3 py-1.5 sm:px-4 sm:py-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 sm:text-xs dark:text-amber-400">
                  <Clock className="size-3.5" />
                  Queue
                </span>
                <span className="font-heading text-lg font-black tracking-tight text-foreground sm:text-2xl">
                  {user.adminStats?.pendingVerifications ?? 0}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


