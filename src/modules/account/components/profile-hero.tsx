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
  Palette,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { roleHomePath } from "@/lib/auth.config"
import { cn } from "@/lib/utils"
import type {
  Role,
  TeacherVerificationStatus,
} from "@/prisma/generated/prisma/client"

export const AVATAR_COLOR_KEY = "examhub_avatar_color"

export const AVATAR_THEMES = [
  {
    id: "indigo",
    label: "Indigo",
    bg: "bg-indigo-600 text-white",
    ring: "ring-indigo-500/30",
  },
  {
    id: "emerald",
    label: "Emerald",
    bg: "bg-emerald-600 text-white",
    ring: "ring-emerald-500/30",
  },
  {
    id: "amber",
    label: "Amber",
    bg: "bg-amber-600 text-white",
    ring: "ring-amber-500/30",
  },
  {
    id: "rose",
    label: "Rose",
    bg: "bg-rose-600 text-white",
    ring: "ring-rose-500/30",
  },
  {
    id: "cyan",
    label: "Cyan",
    bg: "bg-cyan-600 text-white",
    ring: "ring-cyan-500/30",
  },
  {
    id: "purple",
    label: "Purple",
    bg: "bg-purple-600 text-white",
    ring: "ring-purple-500/30",
  },
] as const

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

function getRoleMeta(role: Role) {
  switch (role) {
    case "SUPER_ADMIN":
      return {
        label: "Super Admin",
        badgeClass:
          "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
        icon: Crown,
      }
    case "ADMIN":
      return {
        label: "Admin",
        badgeClass:
          "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        icon: ShieldCheck,
      }
    case "TEACHER":
      return {
        label: "Teacher",
        badgeClass:
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        icon: GraduationCap,
      }
    case "STUDENT":
    default:
      return {
        label: "Student",
        badgeClass: "bg-primary/15 text-primary border-primary/30",
        icon: Sparkles,
      }
  }
}

export function ProfileHero({ user }: ProfileHeroProps) {
  const [selectedTheme, setSelectedTheme] = React.useState<string>("indigo")
  const [showColorPicker, setShowColorPicker] = React.useState(false)

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(AVATAR_COLOR_KEY)
      if (saved && AVATAR_THEMES.some((t) => t.id === saved)) {
        setSelectedTheme(saved)
      }
    } catch {
      // Ignore local storage error
    }
  }, [])

  function handleThemeChange(themeId: string) {
    setSelectedTheme(themeId)
    try {
      localStorage.setItem(AVATAR_COLOR_KEY, themeId)
    } catch {
      // Ignore
    }
    setShowColorPicker(false)
  }

  const roleMeta = getRoleMeta(user.role)
  const RoleIcon = roleMeta.icon
  const activeColor =
    AVATAR_THEMES.find((t) => t.id === selectedTheme) ?? AVATAR_THEMES[0]
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
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Decorative gradient cover banner */}
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-accent/30 sm:h-44">
        {/* Subtle geometric pattern overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_currentColor_1px,_transparent_0)] bg-[length:24px_24px] opacity-20"
        />
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Link
            href={homePath}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/60 bg-background/80 px-3.5 text-xs font-semibold text-foreground backdrop-blur-md transition-all hover:bg-background hover:shadow-sm active:scale-95"
          >
            <LayoutDashboard className="size-3.5 text-primary" />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Main Profile Info Section */}
      <div className="relative px-5 pt-0 pb-6 sm:px-8">
        <div className="-mt-14 flex flex-col justify-between gap-4 sm:-mt-16 sm:flex-row sm:items-end">
          {/* Avatar with status and color badge */}
          <div className="relative flex items-end gap-4">
            <div className="group relative">
              <Avatar
                className={cn(
                  "size-24 border-4 border-card shadow-lg ring-4 ring-background transition-transform duration-300 group-hover:scale-105 sm:size-28",
                  activeColor.ring
                )}
              >
                <AvatarFallback
                  className={cn(
                    "size-full text-2xl font-extrabold tracking-wider transition-colors sm:text-3xl",
                    activeColor.bg
                  )}
                >
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              {/* Color Theme Selector Trigger */}
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full border border-border/80 bg-card text-muted-foreground shadow-sm transition-all hover:scale-110 hover:text-foreground"
                title="Change avatar color preset"
                aria-label="Change avatar color"
              >
                <Palette className="size-3.5" />
              </button>

              {/* Color Preset Popover */}
              {showColorPicker && (
                <div className="absolute bottom-9 left-0 z-30 flex animate-in items-center gap-1.5 rounded-2xl border border-border/80 bg-popover p-2 shadow-xl backdrop-blur-md fade-in-0 zoom-in-95">
                  {AVATAR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleThemeChange(theme.id)}
                      className={cn(
                        "size-6 rounded-full transition-transform hover:scale-125 focus:outline-hidden",
                        theme.bg,
                        selectedTheme === theme.id &&
                          "ring-2 ring-foreground ring-offset-2 ring-offset-popover"
                      )}
                      title={theme.label}
                      aria-label={`Select ${theme.label} avatar color`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Name, Role & Verification */}
            <div className="mb-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {user.name}
                </h1>
                <Badge
                  variant="outline"
                  className={cn(
                    "h-6 gap-1 px-2 text-xs font-semibold",
                    roleMeta.badgeClass
                  )}
                >
                  <RoleIcon className="size-3" />
                  {roleMeta.label}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="size-3 text-muted-foreground/70" />
                  {user.email}
                </span>

                {user.isEmailVerified ? (
                  <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="size-3" />
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Timestamp metadata */}
          <div className="mt-2 flex flex-wrap items-center gap-4 self-start text-xs text-muted-foreground sm:mt-0 sm:self-end">
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" />
              Member since {joinedFormatted}
            </span>
            {lastLoginFormatted && (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                Active {lastLoginFormatted}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Metric Badges / Stats Ribbon */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border/60 pt-5 sm:grid-cols-4">
          {user.role === "STUDENT" && (
            <>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Flame className="size-4 text-orange-500" />
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="size-4 text-amber-500" />
                  <span className="font-medium">XP Points</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {user.xpTotal ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="size-4 text-primary" />
                  <span className="font-medium">Exams Taken</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {user._count?.examAttempts ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Trophy className="size-4 text-yellow-500" />
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <GraduationCap className="size-4 text-emerald-500" />
                  <span className="font-medium">Verification</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground capitalize">
                  {user.teacherVerificationStatus?.toLowerCase() ?? "Pending"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="size-4 text-primary" />
                  <span className="font-medium">Created Exams</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {user._count?.exams ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="size-4 text-amber-500" />
                  <span className="font-medium">Question Bank</span>
                </div>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {user._count?.questions ?? 0}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" />
                  <span className="font-medium">Account Status</span>
                </div>
                <p className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400">
                  Active
                </p>
              </div>
            </>
          )}

          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <>
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-4 text-amber-500" />
                  <span className="font-medium">Role Level</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground">
                  {user.role === "SUPER_ADMIN"
                    ? "Super Admin"
                    : "Platform Admin"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span className="font-medium">Security Clearance</span>
                </div>
                <p className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400">
                  Full Access
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="size-4 text-primary" />
                  <span className="font-medium">Session Status</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground">
                  Secured
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Crown className="size-4 text-purple-500" />
                  <span className="font-medium">Permissions</span>
                </div>
                <p className="mt-1 text-base font-bold text-foreground">
                  Administrative
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
