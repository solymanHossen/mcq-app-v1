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
  ChevronDown,
  Sparkles,
  GraduationCap,
  Settings,
  CreditCard,
  Check,
  ScrollText,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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

export function UserNav({
  user,
  showDashboardButton = true,
  className,
}: UserNavProps) {
  const { theme, setTheme } = useTheme()
  const roleMeta = getRoleMeta(user.role)
  const homePath = roleHomePath(user.role)
  const RoleIcon = roleMeta.icon

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Quick Dashboard Pill Button */}
      {showDashboardButton && (
        <Link
          href={homePath}
          className="hidden h-10 items-center gap-2 rounded-xl border border-border/80 bg-secondary/60 px-4 text-sm font-semibold text-secondary-foreground shadow-xs transition-all duration-200 hover:bg-secondary hover:text-foreground hover:shadow active:scale-95 lg:inline-flex"
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
            <div className="relative">
              <Avatar className="size-10 border-2 border-background shadow-md transition-transform duration-200 group-hover:scale-105 sm:size-11">
                <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              {/* Online Pulse Indicator */}
              <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-emerald-500 shadow-xs" />
            </div>

            <ChevronDown className="hidden size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 sm:block" />
          </button>
        </DropdownMenuTrigger>

        {/* Large, Spacious, Luxurious Dropdown Content */}
        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-76 animate-in rounded-3xl border border-border/80 bg-popover/98 p-2.5 text-popover-foreground shadow-2xl backdrop-blur-2xl duration-200 fade-in-0 zoom-in-95 sm:w-84"
        >
          {/* Enhanced User Profile Header */}
          <div className="mb-1.5 flex items-center gap-3.5 rounded-2xl border border-border/40 bg-muted/40 p-3.5 transition-colors">
            <Avatar className="size-13 shrink-0 border-2 border-primary/20 shadow-sm">
              <AvatarFallback className="bg-primary/15 text-base font-extrabold text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-base font-bold tracking-tight text-foreground">
                {user.name}
              </span>
              <span className="mt-0.5 truncate text-xs text-muted-foreground sm:text-[13px]">
                {user.email}
              </span>
              <div className="mt-1.5 flex items-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-5.5 gap-1 rounded-md px-2 text-[11px] font-semibold",
                    roleMeta.badgeClass
                  )}
                >
                  <RoleIcon className="size-3" />
                  {roleMeta.label}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Primary Navigation Items */}
          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem asChild>
              <Link
                href={homePath}
                className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <LayoutDashboard className="size-4.5" />
                </span>
                <span className="font-semibold text-foreground">Dashboard</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:text-emerald-400">
                  <UserIcon className="size-4.5" />
                </span>
                <span className="font-semibold text-foreground">
                  Profile & Account
                </span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Dynamic Role-Specific Navigation Items */}
          <DropdownMenuGroup className="space-y-1">
            {user.role === "STUDENT" && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href="/exams"
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:text-blue-400">
                      <BookOpen className="size-4.5" />
                    </span>
                    <span>My Exams</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/mistakes"
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white dark:text-amber-400">
                      <RotateCcw className="size-4.5" />
                    </span>
                    <span>Mistake Notebook</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/leaderboard"
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600 transition-colors group-hover:bg-yellow-600 group-hover:text-white dark:text-yellow-400">
                      <Trophy className="size-4.5" />
                    </span>
                    <span>Leaderboard</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            {user.role === "TEACHER" && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href="/teacher/exams"
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:text-blue-400">
                      <ClipboardList className="size-4.5" />
                    </span>
                    <span>Manage Exams</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/teacher/questions"
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white dark:text-amber-400">
                      <BookOpen className="size-4.5" />
                    </span>
                    <span>Question Bank</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/teacher/settings"
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white dark:text-purple-400">
                      <Settings className="size-4.5" />
                    </span>
                    <span>Teacher Settings</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}

            {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/users"
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:text-blue-400">
                      <Users className="size-4.5" />
                    </span>
                    <span>User Management</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/teachers"
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:text-emerald-400">
                      <GraduationCap className="size-4.5" />
                    </span>
                    <span>Teacher Verification</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/audit-log"
                    className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white dark:text-purple-400">
                      <ScrollText className="size-4.5" />
                    </span>
                    <span>System Audit Log</span>
                  </Link>
                </DropdownMenuItem>

                {user.role === "SUPER_ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/settings"
                      className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white dark:text-amber-400">
                        <Settings className="size-4.5" />
                      </span>
                      <span>System Settings</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Theme Selector Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-muted/80 sm:text-[15px]">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                <Sun className="size-4.5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute size-4.5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              </span>
              <span>Theme Appearance</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48 rounded-2xl border border-border/80 bg-popover/98 p-1.5 shadow-xl backdrop-blur-xl">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-medium"
              >
                <span className="flex items-center gap-2.5">
                  <Sun className="size-4 text-amber-500" />
                  Light
                </span>
                {theme === "light" && <Check className="size-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-medium"
              >
                <span className="flex items-center gap-2.5">
                  <Moon className="size-4 text-sky-400" />
                  Dark
                </span>
                {theme === "dark" && <Check className="size-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-medium"
              >
                <span className="flex items-center gap-2.5">
                  <Laptop className="size-4 text-muted-foreground" />
                  System
                </span>
                {theme === "system" && (
                  <Check className="size-4 text-primary" />
                )}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Log Out Action Button */}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-destructive transition-all duration-150 focus:bg-destructive/15 sm:text-[15px]"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors group-hover:bg-destructive group-hover:text-white">
              <LogOut className="size-4.5" />
            </span>
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
