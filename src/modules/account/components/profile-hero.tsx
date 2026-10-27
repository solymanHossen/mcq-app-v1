"use client"

import * as React from "react"
import Link from "next/link"
import {
  Calendar,
  CheckCircle2,
  Clock,
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

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs transition-all duration-300">
      {/* Decorative clean banner adhering strictly to system theme tokens */}
      <div className="relative h-28 w-full border-b border-border/60 bg-muted/40 sm:h-36">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Link
            href={homePath}
            className="inline-flex h-8.5 items-center gap-2 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold text-foreground shadow-2xs transition-all hover:bg-muted active:scale-95"
          >
            <LayoutDashboard className="size-3.5 text-muted-foreground" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Main Profile Info Section */}
      <div className="relative px-5 pt-0 pb-6 sm:px-8">
        <div className="-mt-12 flex flex-col justify-between gap-4 sm:-mt-14 sm:flex-row sm:items-end">
          {/* Avatar & Identifiers */}
          <div className="flex items-end gap-4">
            <Avatar className="size-22 border-4 border-card shadow-md ring-1 ring-border/60 sm:size-24">
              <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary sm:text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="mb-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {user.name}
                </h1>
                <Badge
                  variant="secondary"
                  className="h-5.5 gap-1 px-2 text-xs font-medium text-muted-foreground"
                >
                  <RoleIcon className="size-3" />
                  {roleInfo.label}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="size-3" />
                  {user.email}
                </span>

                {user.isEmailVerified ? (
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <CheckCircle2 className="size-3 text-primary" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-medium text-muted-foreground">
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Timestamp metadata */}
          <div className="mt-1 flex flex-wrap items-center gap-3 self-start text-xs text-muted-foreground sm:mt-0 sm:self-end">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Joined {joinedFormatted}
            </span>
            {lastLoginFormatted && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                Active {lastLoginFormatted}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Metric Badges Ribbon using strictly theme palette */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/60 pt-5 sm:grid-cols-4">
          {user.role === "STUDENT" && (
            <>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Flame className="size-3.5 text-primary" />
                  <span className="font-medium">Streak</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {user.streak?.currentStreak ?? 0}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    days
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="size-3.5 text-primary" />
                  <span className="font-medium">XP Points</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {user.xpTotal ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  <span className="font-medium">Exams Taken</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {user._count?.examAttempts ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Trophy className="size-3.5 text-primary" />
                  <span className="font-medium">Badges</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {user._count?.badges ?? 0}
                </p>
              </div>
            </>
          )}

          {user.role === "TEACHER" && (
            <>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GraduationCap className="size-3.5 text-primary" />
                  <span className="font-medium">Status</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground capitalize">
                  {user.teacherVerificationStatus?.toLowerCase() ?? "Pending"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  <span className="font-medium">Exams Created</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {user._count?.exams ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="size-3.5 text-primary" />
                  <span className="font-medium">Questions</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {user._count?.questions ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span className="font-medium">Account</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground">
                  Active
                </p>
              </div>
            </>
          )}

          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-primary" />
                  <span className="font-medium">Role</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground">
                  {user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span className="font-medium">Clearance</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground">
                  Full Access
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="size-3.5 text-primary" />
                  <span className="font-medium">Security</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground">
                  Audited
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Crown className="size-3.5 text-primary" />
                  <span className="font-medium">Permissions</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground">
                  Active
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
