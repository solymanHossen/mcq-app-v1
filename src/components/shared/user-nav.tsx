"use client"

import * as React from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  User as UserIcon,
  BookOpen,
  RotateCcw,
  Trophy,
  ClipboardList,
  Users,
  ShieldCheck,
  ShieldAlert,
  Crown,
  LogOut,
  Sun,
  Moon,
  Laptop,
  GraduationCap,
  Settings,
  ScrollText,
  ChevronRight,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { roleHomePath } from "@/lib/auth.config"
import { cn } from "@/lib/utils"
import type { Role } from "@/prisma/generated/prisma/client"

export interface UserNavProps {
  user: {
    id?: string
    name: string
    email: string
    role: Role
    isGuest?: boolean
  }
  showDashboardButton?: boolean
  className?: string
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function formatRole(role: Role) {
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

export function UserNav({
  user,
  showDashboardButton = true,
  className,
}: UserNavProps) {
  const { theme, setTheme } = useTheme()
  const roleInfo = formatRole(user.role)
  const homePath = roleHomePath(user.role)
  const RoleIcon = roleInfo.icon

  // Safe mounted check for theme switch to avoid SSR mismatch
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Quick Dashboard Pill Button */}
      {showDashboardButton && (
        <Link
          href={homePath}
          className="hidden h-10 items-center gap-2 rounded-xl border border-border/80 bg-secondary/50 px-4 text-xs font-semibold text-secondary-foreground shadow-2xs transition-all duration-200 hover:bg-secondary hover:text-foreground active:scale-95 sm:text-sm lg:inline-flex"
        >
          <LayoutDashboard className="size-4 text-primary" />
          <span>Dashboard</span>
        </Link>
      )}

      {/* Main Avatar Trigger Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group relative flex items-center rounded-full p-0.5 outline-hidden transition-all duration-150 hover:ring-2 hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            aria-label="User account menu"
          >
            <Avatar className="size-8.5 sm:size-9 border border-border/70 shadow-2xs transition-transform duration-150 group-hover:scale-105">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        {/* Large, Smooth, Modern, World-Class Dropdown Container */}
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-76 animate-in rounded-2xl sm:rounded-3xl border border-border/70 bg-popover/98 p-2.5 sm:p-3 text-popover-foreground shadow-2xl backdrop-blur-xl duration-200 fade-in-0 zoom-in-95 sm:w-80"
        >
          {/* Enhanced Spacious User Profile Header */}
          <div className="mb-2 flex items-center gap-3 sm:gap-3.5 rounded-2xl border border-border/60 bg-muted/40 p-3 sm:p-3.5 transition-colors">
            <Avatar className="size-11 sm:size-12 shrink-0 border border-primary/25 shadow-2xs">
              <AvatarFallback className="bg-primary/15 text-sm sm:text-base font-extrabold text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-heading truncate text-sm sm:text-[15px] font-bold tracking-tight text-foreground leading-snug">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground font-normal mt-0.5">
                {user.email}
              </span>
              <div className="mt-1.5 flex items-center">
                {user.isGuest ? (
                  <Badge
                    variant="secondary"
                    className="h-5 gap-1 rounded-md px-2 text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-none"
                  >
                    <ShieldAlert className="size-3" />
                    Guest Candidate
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="h-5 gap-1.5 rounded-md px-2 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 shadow-none"
                  >
                    <RoleIcon className="size-3" />
                    {roleInfo.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1 bg-border/60" />

          {/* Primary Navigation — Large, Smooth Items */}
          <DropdownMenuGroup className="space-y-0.5">
            <DropdownMenuItem asChild>
              <Link
                href={homePath}
                className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                  <span className="text-foreground">Dashboard</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                  <span className="text-foreground">Profile & Account</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1 bg-border/60" />

          {/* Role-Specific Quick Links — Large, Smooth Items */}
          <DropdownMenuGroup className="space-y-0.5">
            {user.role === "STUDENT" && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href="/exams"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                      <span>My Exams</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/mistakes"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Mistake Notebook</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/leaderboard"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Leaderboard</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/teachers/apply"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold transition-all duration-150 hover:bg-primary/10 focus:bg-primary/10 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="size-4.5 text-primary transition-all duration-150 group-hover:scale-105" />
                      <span className="font-semibold text-primary">Apply as Faculty</span>
                    </div>
                    <ChevronRight className="size-4 text-primary/60 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            {user.role === "TEACHER" && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href="/teacher/exams"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardList className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Manage Exams</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/teacher/questions"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Question Bank</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/teacher/settings"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Teacher Settings</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/profile?tab=activity"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                      <span>My Learning History</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/users"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                      <span>User Directory</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/teachers"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Teacher Approvals</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/audit-log"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <ScrollText className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Security Audit</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                {user.role === "SUPER_ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/settings"
                      className="group flex cursor-pointer items-center justify-between rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-foreground transition-all duration-150 hover:bg-muted/70 focus:bg-muted/70 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="size-4.5 text-muted-foreground transition-all duration-150 group-hover:scale-105 group-hover:text-foreground" />
                        <span>System Settings</span>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </Link>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1 bg-border/60" />

          {/* Minimal 1-Click Segmented Theme Toggle — Spacious & Smooth */}
          <div className="flex items-center justify-between rounded-xl px-3 sm:px-3.5 py-2 text-sm transition-colors hover:bg-muted/40">
            <span className="flex items-center gap-3 font-semibold text-sm sm:text-[14.5px] text-foreground">
              <Sun className="size-4.5 text-muted-foreground" />
              <span>Theme</span>
            </span>

            {mounted ? (
              <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/60 p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer",
                    theme === "light"
                      ? "scale-105 bg-background font-semibold text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Light mode"
                  aria-label="Switch to light mode"
                >
                  <Sun className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer",
                    theme === "dark"
                      ? "scale-105 bg-background font-semibold text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Dark mode"
                  aria-label="Switch to dark mode"
                >
                  <Moon className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg transition-all duration-150 cursor-pointer",
                    theme === "system"
                      ? "scale-105 bg-background font-semibold text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="System mode"
                  aria-label="Switch to system mode"
                >
                  <Laptop className="size-3.5" />
                </button>
              </div>
            ) : (
              <div className="h-7 w-24 animate-pulse rounded-lg bg-muted/60" />
            )}
          </div>

          <DropdownMenuSeparator className="my-1 bg-border/60" />

          {/* Clean Destructive Log Out — Large, Smooth */}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[14.5px] font-semibold text-destructive transition-all duration-150 focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/10 active:scale-[0.99]"
          >
            <LogOut className="size-4.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
