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
          "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        icon: Crown,
      }
    case "ADMIN":
      return {
        label: "Admin",
        badgeClass:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        icon: ShieldCheck,
      }
    case "TEACHER":
      return {
        label: "Teacher",
        badgeClass:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        icon: GraduationCap,
      }
    case "STUDENT":
    default:
      return {
        label: "Student",
        badgeClass: "bg-primary/10 text-primary border-primary/20",
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
    <div className={cn("flex items-center gap-2.5 sm:gap-3", className)}>
      {/* Quick Dashboard Pill (Desktop) */}
      {showDashboardButton && (
        <Link
          href={homePath}
          className="hidden h-9 items-center gap-1.5 rounded-xl border border-border/70 bg-secondary/50 px-3.5 text-xs font-semibold text-secondary-foreground shadow-2xs transition-all hover:bg-secondary hover:text-foreground active:scale-95 lg:inline-flex"
        >
          <LayoutDashboard className="size-3.5 text-primary" />
          <span>Dashboard</span>
        </Link>
      )}

      {/* Main Avatar Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group relative flex items-center gap-2 rounded-full p-0.5 ring-offset-background outline-hidden transition-all hover:ring-2 hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="User account menu"
          >
            <div className="relative">
              <Avatar className="size-9 border-2 border-background shadow-xs transition-transform duration-200 group-hover:scale-105 sm:size-10">
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary sm:text-sm">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              {/* Online pulse badge */}
              <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
            </div>

            <ChevronDown className="hidden size-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 sm:block" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-64 rounded-2xl border border-border/80 bg-popover/98 p-1.5 text-popover-foreground shadow-xl backdrop-blur-xl"
        >
          {/* User Profile Header */}
          <div className="flex items-center gap-3 p-2.5">
            <Avatar className="size-11 border border-border/70 shadow-xs">
              <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-foreground">
                  {user.name}
                </span>
              </div>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
              <div className="mt-1 flex items-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "h-5 gap-1 px-1.5 text-[10px] font-medium",
                    roleMeta.badgeClass
                  )}
                >
                  <RoleIcon className="size-2.5" />
                  {roleMeta.label}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Primary Navigation */}
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                href={homePath}
                className="flex cursor-pointer items-center gap-2.5 py-2"
              >
                <LayoutDashboard className="size-4 text-primary" />
                <span className="font-medium">Dashboard</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex cursor-pointer items-center gap-2.5 py-2"
              >
                <UserIcon className="size-4 text-emerald-500" />
                <span className="font-medium">Profile & Account</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Role-Specific Quick Links */}
          <DropdownMenuGroup>
            {user.role === "STUDENT" && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href="/exams"
                    className="flex cursor-pointer items-center gap-2.5 py-1.5"
                  >
                    <BookOpen className="size-4 text-muted-foreground" />
                    <span>My Exams</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/mistakes"
                    className="flex cursor-pointer items-center gap-2.5 py-1.5"
                  >
                    <RotateCcw className="size-4 text-muted-foreground" />
                    <span>Mistake Notebook</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/leaderboard"
                    className="flex cursor-pointer items-center gap-2.5 py-1.5"
                  >
                    <Trophy className="size-4 text-muted-foreground" />
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
                    className="flex cursor-pointer items-center gap-2.5 py-1.5"
                  >
                    <ClipboardList className="size-4 text-muted-foreground" />
                    <span>Manage Exams</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/teacher/questions"
                    className="flex cursor-pointer items-center gap-2.5 py-1.5"
                  >
                    <BookOpen className="size-4 text-muted-foreground" />
                    <span>Question Bank</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/teacher/settings"
                    className="flex cursor-pointer items-center gap-2.5 py-1.5"
                  >
                    <Settings className="size-4 text-muted-foreground" />
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
                    className="flex cursor-pointer items-center gap-2.5 py-1.5"
                  >
                    <Users className="size-4 text-muted-foreground" />
                    <span>User Management</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/teachers"
                    className="flex cursor-pointer items-center gap-2.5 py-1.5"
                  >
                    <GraduationCap className="size-4 text-muted-foreground" />
                    <span>Teacher Verification</span>
                  </Link>
                </DropdownMenuItem>
                {user.role === "SUPER_ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin/settings"
                      className="flex cursor-pointer items-center gap-2.5 py-1.5"
                    >
                      <Settings className="size-4 text-muted-foreground" />
                      <span>System Settings</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Theme Selector Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex cursor-pointer items-center gap-2.5 py-1.5">
              <Sun className="size-4 scale-100 rotate-0 text-amber-500 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute size-4 scale-0 rotate-90 text-sky-400 transition-all dark:scale-100 dark:rotate-0" />
              <span>Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="rounded-xl border border-border/80 bg-popover/95 p-1 backdrop-blur-xl">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="flex cursor-pointer items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sun className="size-4 text-amber-500" />
                  Light
                </span>
                {theme === "light" && <Check className="size-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex cursor-pointer items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Moon className="size-4 text-sky-400" />
                  Dark
                </span>
                {theme === "dark" && <Check className="size-4 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="flex cursor-pointer items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Laptop className="size-4 text-muted-foreground" />
                  System
                </span>
                {theme === "system" && (
                  <Check className="size-4 text-primary" />
                )}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Sign Out Action */}
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex cursor-pointer items-center gap-2.5 py-2 text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20"
          >
            <LogOut className="size-4" />
            <span className="font-medium">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
