"use client"

import * as React from "react"
import Link from "next/link"
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Flame,
  GraduationCap,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
  User as UserIcon,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { roleHomePath } from "@/lib/auth.config"
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
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
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
  const homePath = roleHomePath(user.role)

  const joinedFormatted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(user.createdAt))

  const lastLoginFormatted = user.lastLoginAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(user.lastLoginAt))
    : null

  function handleCopyEmail() {
    navigator.clipboard.writeText(user.email)
    setCopiedEmail(true)
    toast.success("Email copied to clipboard")
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-border/80 bg-card/85 p-6 shadow-xs backdrop-blur-xl transition-all duration-300 sm:p-8 lg:p-10">
      {/* Subtle Radiant Top Edge Accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      {/* ================= TOP ROW: USER IDENTITY & ACTIONS ================= */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        {/* Left: Avatar & Identity Details */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Large Avatar with Online Indicator */}
          <div className="relative w-fit shrink-0">
            <Avatar className="size-20 border-2 border-border/80 shadow-md ring-4 ring-primary/10 sm:size-24">
              <AvatarFallback className="bg-primary/10 font-heading text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span
              className="absolute right-0.5 bottom-0.5 size-3.5 rounded-full border-2 border-card bg-primary shadow-xs"
              title="Online & Authenticated"
            />
          </div>

          {/* User Name, Role, Email, and Timestamps */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {user.name}
              </h1>
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide"
              >
                <RoleIcon className="size-3.5 text-primary" />
                <span>{roleInfo.label}</span>
              </Badge>
            </div>

            {/* Email & Verification status */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1 font-medium transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground"
                title="Click to copy email"
              >
                <Mail className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                <span>{user.email}</span>
                {copiedEmail ? (
                  <Check className="size-3 text-primary" />
                ) : (
                  <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-70" />
                )}
              </button>

              <span className="hidden text-muted-foreground/30 sm:inline">
                •
              </span>

              {user.isEmailVerified ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span>Verified Account</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                  Unverified
                </span>
              )}
            </div>

            {/* Account Longevity Timestamps */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span>Joined {joinedFormatted}</span>
              </span>

              {lastLoginFormatted && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>Last active {lastLoginFormatted}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Role Dashboard Action */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <Link
            href={homePath}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border/80 bg-card px-5 text-sm font-semibold text-foreground shadow-2xs transition-all hover:border-primary/40 hover:bg-muted active:scale-95"
          >
            <LayoutDashboard className="size-4 text-primary" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* ================= BOTTOM ROW: BIG SIZE MINIMAL KPI CARDS ================= */}
      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/60 pt-7 sm:grid-cols-4 sm:gap-5">
        {/* STUDENT METRICS */}
        {user.role === "STUDENT" && (
          <>
            <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Streak
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-transform group-hover:scale-105">
                  <Flame className="size-4.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {user.streak?.currentStreak ?? 0}{" "}
                  <span className="text-sm font-semibold text-muted-foreground">
                    days
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Continuous study rhythm
                </p>
              </div>
            </div>

            <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  XP Points
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-transform group-hover:scale-105">
                  <Zap className="size-4.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {user.xpTotal ?? 0}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Total accumulated score
                </p>
              </div>
            </div>

            <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Exams Taken
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-transform group-hover:scale-105">
                  <Sparkles className="size-4.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {user._count?.examAttempts ?? 0}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Completed assessments
                </p>
              </div>
            </div>

            <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Badges
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-transform group-hover:scale-105">
                  <Trophy className="size-4.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {user._count?.badges ?? 0}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Achievements unlocked
                </p>
              </div>
            </div>
          </>
        )}

        {/* TEACHER METRICS */}
        {user.role === "TEACHER" && (
          <>
            <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Verification
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-transform group-hover:scale-105">
                  <GraduationCap className="size-4.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-heading text-2xl font-black tracking-tight text-foreground capitalize sm:text-3xl">
                  {user.teacherVerificationStatus?.toLowerCase() ?? "Pending"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Faculty status credential
                </p>
              </div>
            </div>

            <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Exams Created
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-transform group-hover:scale-105">
                  <Sparkles className="size-4.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {user._count?.exams ?? 0}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Active & scheduled tests
                </p>
              </div>
            </div>

            <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Question Bank
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-transform group-hover:scale-105">
                  <Zap className="size-4.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {user._count?.questions ?? 0}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Authored question pool
                </p>
              </div>
            </div>

            <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Permissions
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-transform group-hover:scale-105">
                  <CheckCircle2 className="size-4.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  Active
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Educator authoring unlocked
                </p>
              </div>
            </div>
          </>
        )}

        {/* ADMIN & SUPER ADMIN METRICS */}
        {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
          <>
            <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Role Authority
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-transform group-hover:scale-105">
                  <ShieldCheck className="size-4.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Master platform governance
                </p>
              </div>
            </div>

            <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Clearance Tier
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-transform group-hover:scale-105">
                  <CheckCircle2 className="size-4.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  Full Access
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Unrestricted root scopes
                </p>
              </div>
            </div>

            <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Security Level
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-transform group-hover:scale-105">
                  <Zap className="size-4.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  Audited
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Multi-factor & session verified
                </p>
              </div>
            </div>

            <div className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-muted/20 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-muted/40 hover:shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Permissions
                </span>
                <span className="flex size-9 items-center justify-center rounded-xl border border-border/60 bg-card text-primary transition-transform group-hover:scale-105">
                  <Crown className="size-4.5" />
                </span>
              </div>
              <div className="mt-3">
                <p className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  Active
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Platform services accessible
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
