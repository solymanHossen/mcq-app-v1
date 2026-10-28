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
            className="group relative flex items-center gap-2 rounded-full p-1 ring-offset-background outline-hidden transition-all duration-200 hover:ring-3 hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95"
            aria-label="User account menu"
          >
            <Avatar className="size-10 border-2 border-background shadow-xs transition-transform duration-200 group-hover:scale-105 sm:size-11">
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary sm:text-sm">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        {/* Large, Smooth, Modern, World-Class Dropdown Container */}
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-76 animate-in rounded-3xl border border-border/80 bg-popover/98 p-2.5 text-popover-foreground shadow-2xl backdrop-blur-2xl duration-200 fade-in-0 zoom-in-95 sm:w-82"
        >
          {/* Enhanced Spacious User Profile Header */}
          <div className="mb-2 flex items-center gap-3.5 rounded-2xl border border-border/50 bg-muted/40 p-3.5 transition-colors">
            <Avatar className="size-12 shrink-0 border-2 border-primary/20 shadow-xs">
              <AvatarFallback className="bg-primary/15 text-sm font-extrabold text-primary sm:text-base">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-base leading-snug font-bold tracking-tight text-foreground">
                {user.name}
              </span>
              <span className="mt-0.5 truncate text-xs text-muted-foreground sm:text-[13px]">
                {user.email}
              </span>
              <div className="mt-1.5 flex items-center">
                <Badge
                  variant="secondary"
                  className="h-5 gap-1 rounded-md px-2 text-[11px] font-semibold text-muted-foreground"
                >
                  <RoleIcon className="size-3" />
                  {roleInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Primary Navigation — Large, Smooth Items */}
          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem asChild>
              <Link
                href={homePath}
                className="group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[14.5px] font-semibold transition-all duration-200 hover:bg-muted/80 focus:bg-muted/80 active:scale-[0.99] sm:text-[15px]"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="size-4.5 text-muted-foreground transition-all duration-200 group-hover:scale-105 group-hover:text-foreground" />
                  <span className="text-foreground">Dashboard</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[14.5px] font-semibold transition-all duration-200 hover:bg-muted/80 focus:bg-muted/80 active:scale-[0.99] sm:text-[15px]"
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="size-4.5 text-muted-foreground transition-all duration-200 group-hover:scale-105 group-hover:text-foreground" />
                  <span className="text-foreground">Profile & Account</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Role-Specific Quick Links — Large, Smooth Items */}
          <DropdownMenuGroup className="space-y-1">
            {user.role === "STUDENT" && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href="/exams"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200 hover:bg-muted/80 focus:bg-muted/80 active:scale-[0.99] sm:text-[15px]"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="size-4.5 text-muted-foreground transition-all duration-200 group-hover:scale-105 group-hover:text-foreground" />
                      <span>My Exams</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/mistakes"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200 hover:bg-muted/80 focus:bg-muted/80 active:scale-[0.99] sm:text-[15px]"
                  >
                    <div className="flex items-center gap-3">
                      <RotateCcw className="size-4.5 text-muted-foreground transition-all duration-200 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Mistake Notebook</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/leaderboard"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200 hover:bg-muted/80 focus:bg-muted/80 active:scale-[0.99] sm:text-[15px]"
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="size-4.5 text-muted-foreground transition-all duration-200 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Leaderboard</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            {user.role === "TEACHER" && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href="/teacher/exams"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200 hover:bg-muted/80 focus:bg-muted/80 active:scale-[0.99] sm:text-[15px]"
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardList className="size-4.5 text-muted-foreground transition-all duration-200 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Manage Exams</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/teacher/questions"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200 hover:bg-muted/80 focus:bg-muted/80 active:scale-[0.99] sm:text-[15px]"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="size-4.5 text-muted-foreground transition-all duration-200 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Question Bank</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/teacher/settings"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200 hover:bg-muted/80 focus:bg-muted/80 active:scale-[0.99] sm:text-[15px]"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="size-4.5 text-muted-foreground transition-all duration-200 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Teacher Settings</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/users"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200 hover:bg-muted/80 focus:bg-muted/80 active:scale-[0.99] sm:text-[15px]"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="size-4.5 text-muted-foreground transition-all duration-200 group-hover:scale-105 group-hover:text-foreground" />
                      <span>User Directory</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/teachers"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200 hover:bg-muted/80 focus:bg-muted/80 active:scale-[0.99] sm:text-[15px]"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="size-4.5 text-muted-foreground transition-all duration-200 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Teacher Approvals</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/audit-log"
                    className="group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200 hover:bg-muted/80 focus:bg-muted/80 active:scale-[0.99] sm:text-[15px]"
                  >
                    <div className="flex items-center gap-3">
                      <ScrollText className="size-4.5 text-muted-foreground transition-all duration-200 group-hover:scale-105 group-hover:text-foreground" />
                      <span>Security Audit</span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </DropdownMenuItem>

                {user.role === "SUPER_ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/settings"
                      className="group flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-[14.5px] font-medium transition-all duration-200 hover:bg-muted/80 focus:bg-muted/80 active:scale-[0.99] sm:text-[15px]"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="size-4.5 text-muted-foreground transition-all duration-200 group-hover:scale-105 group-hover:text-foreground" />
                        <span>System Settings</span>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </Link>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Minimal 1-Click Segmented Theme Toggle — Spacious & Smooth */}
          <div className="flex items-center justify-between rounded-xl px-3.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/40 sm:text-sm">
            <span className="flex items-center gap-2.5 font-medium text-foreground">
              <Sun className="size-4 text-muted-foreground" />
              <span>Theme Appearance</span>
            </span>

            {mounted ? (
              <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/70 p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg transition-all duration-200",
                    theme === "light"
                      ? "scale-105 bg-background font-semibold text-foreground shadow-xs"
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
                    "flex size-7 items-center justify-center rounded-lg transition-all duration-200",
                    theme === "dark"
                      ? "scale-105 bg-background font-semibold text-foreground shadow-xs"
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
                    "flex size-7 items-center justify-center rounded-lg transition-all duration-200",
                    theme === "system"
                      ? "scale-105 bg-background font-semibold text-foreground shadow-xs"
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

          <DropdownMenuSeparator className="my-1.5" />

          {/* Clean Destructive Log Out — Large, Smooth */}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14.5px] font-semibold text-destructive transition-all duration-200 focus:bg-destructive/10 focus:text-destructive active:scale-[0.99] sm:text-[15px]"
          >
            <LogOut className="size-4.5 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
