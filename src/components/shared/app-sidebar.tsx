"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronRight,
  ChevronsUpDown,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import type { SidebarNavItem } from "@/components/shared/sidebar-nav"
import { cn } from "@/lib/utils"

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  brandIcon: React.ReactNode
  brandName: string
  badgeLabel: string
  logoUrl?: string | null
  navItems: readonly SidebarNavItem[]
  user: { name: string; email: string }
}

export function AppSidebar({
  brandIcon,
  brandName,
  badgeLabel,
  logoUrl,
  navItems,
  user,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile

  return (
    <Sidebar
      collapsible="icon"
      className="z-30 border-r border-sidebar-border bg-sidebar"
      {...props}
    >
      {/* Brand Header: Aligned height (h-20) with Dashboard Header */}
      <SidebarHeader className="h-20 border-b border-sidebar-border p-0">
        <div
          className={cn(
            "flex size-full items-center gap-3 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
            isMobile && "pr-14"
          )}
        >
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-xl transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            title={brandName}
          >
            {logoUrl ? (
              <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border/60 bg-sidebar-accent/50 p-1 shadow-2xs">
                <Image
                  src={logoUrl}
                  alt={brandName}
                  width={36}
                  height={36}
                  className="size-full object-contain"
                  unoptimized={
                    logoUrl.startsWith("/uploads/") ||
                    logoUrl.startsWith("http")
                  }
                />
              </div>
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xs">
                {brandIcon}
              </span>
            )}
            <span className="min-w-0 truncate font-heading text-base font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
              {brandName}
            </span>
          </Link>
          <Badge
            variant="secondary"
            className="ml-auto rounded-full border border-sidebar-border/70 px-2.5 py-0.5 text-xs font-semibold shadow-none group-data-[collapsible=icon]:hidden"
          >
            {badgeLabel}
          </Badge>
        </div>
      </SidebarHeader>

      {/* Navigation Links with shadcn semantic sidebar color palette and master control geometry */}
      <SidebarContent className="px-3 py-4 group-data-[collapsible=icon]:px-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => {
                const hasSubItems = Boolean(item.items && item.items.length > 0)
                const isSubActive = Boolean(
                  item.items?.some((sub) =>
                    sub.exact
                      ? pathname === sub.href
                      : pathname === sub.href ||
                        pathname.startsWith(`${sub.href}/`)
                  )
                )
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`) ||
                    isSubActive

                if (hasSubItems) {
                  return (
                    <Collapsible
                      key={item.href}
                      asChild
                      defaultOpen={isSubActive || active}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        {isCollapsed ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuButton
                                size="default"
                                isActive={active}
                                tooltip={isMobile ? undefined : item.label}
                                aria-label={item.label}
                                className={cn(
                                  "h-10 cursor-pointer gap-3 rounded-xl border border-transparent px-3 text-sm font-semibold transition-colors group-data-[collapsible=icon]:border-0",
                                  active
                                    ? "border-sidebar-primary/20 bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-2xs"
                                    : "text-sidebar-foreground/70 hover:border-sidebar-border/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                  "shrink-0"
                                )}
                              >
                                {item.icon}
                              </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side="right"
                              align="start"
                              sideOffset={8}
                              className="w-48 rounded-xl border border-sidebar-border bg-popover p-1.5 text-popover-foreground shadow-md"
                            >
                              <DropdownMenuLabel className="px-2.5 py-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                {item.label}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                {item.items?.map((subItem) => {
                                  const isCurrentSubActive = subItem.exact
                                    ? pathname === subItem.href
                                    : pathname === subItem.href ||
                                      pathname.startsWith(`${subItem.href}/`)
                                  return (
                                    <DropdownMenuItem
                                      key={subItem.href}
                                      asChild
                                    >
                                      <Link
                                        href={subItem.href}
                                        aria-current={
                                          isCurrentSubActive
                                            ? "page"
                                            : undefined
                                        }
                                        className={cn(
                                          "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                                          isCurrentSubActive
                                            ? "border-sidebar-primary/20 bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-2xs"
                                            : "text-foreground hover:bg-muted"
                                        )}
                                      >
                                        {subItem.icon}
                                        <span>{subItem.label}</span>
                                      </Link>
                                    </DropdownMenuItem>
                                  )
                                })}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                size="default"
                                isActive={active}
                                tooltip={isMobile ? undefined : item.label}
                                aria-label={item.label}
                                className={cn(
                                  "h-10 w-full cursor-pointer gap-3 rounded-xl border border-transparent px-3 text-sm font-semibold transition-colors group-data-[collapsible=icon]:border-0",
                                  active
                                    ? "border-sidebar-primary/20 bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-2xs"
                                    : "text-sidebar-foreground/70 hover:border-sidebar-border/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                  "shrink-0"
                                )}
                              >
                                {item.icon}
                                <span className="tracking-tight group-data-[collapsible=icon]:hidden">
                                  {item.label}
                                </span>
                                <ChevronRight className="ml-auto size-4 text-sidebar-foreground/50 transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="animate-in duration-200 fade-in-0 group-data-[collapsible=icon]:hidden">
                              <SidebarMenuSub className="mx-3.5 my-1 gap-1 border-l border-sidebar-border/70 pl-2.5">
                                {item.items?.map((subItem) => {
                                  const isCurrentSubActive = subItem.exact
                                    ? pathname === subItem.href
                                    : pathname === subItem.href ||
                                      pathname.startsWith(`${subItem.href}/`)

                                  return (
                                    <SidebarMenuSubItem key={subItem.href}>
                                      <SidebarMenuSubButton
                                        asChild
                                        size="sm"
                                        isActive={isCurrentSubActive}
                                        className={cn(
                                          "h-9 rounded-lg border border-transparent px-2.5 text-xs font-medium transition-colors",
                                          isCurrentSubActive
                                            ? "border-sidebar-primary/20 bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-2xs"
                                            : "text-sidebar-foreground/70 hover:border-sidebar-border/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                        )}
                                      >
                                        <Link
                                          href={subItem.href}
                                          aria-current={
                                            isCurrentSubActive
                                              ? "page"
                                              : undefined
                                          }
                                          className="flex items-center gap-2"
                                        >
                                          {subItem.icon}
                                          <span>{subItem.label}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  )
                                })}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      size="default"
                      isActive={active}
                      tooltip={
                        isMobile
                          ? undefined
                          : item.badge !== undefined && item.badge !== null
                            ? `${item.label} (${item.badge})`
                            : item.label
                      }
                      className={cn(
                        "h-10 gap-3 rounded-xl border border-transparent px-3 text-sm font-semibold transition-colors group-data-[collapsible=icon]:border-0",
                        active
                          ? "border-sidebar-primary/20 bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-2xs"
                          : "text-sidebar-foreground/70 hover:border-sidebar-border/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                        "shrink-0"
                      )}
                    >
                      <Link
                        href={item.href}
                        aria-label={item.label}
                        aria-current={active ? "page" : undefined}
                        className="flex w-full min-w-0 items-center gap-3"
                      >
                        {item.icon}
                        <span className="truncate tracking-tight group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                        {item.badge !== undefined && item.badge !== null && (
                          <span
                            className={cn(
                              "ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10.5px] font-bold tabular-nums transition-colors group-data-[collapsible=icon]:hidden",
                              typeof item.badge === "number" && item.badge > 0
                                ? active
                                  ? "border border-amber-500/30 bg-amber-500/20 text-amber-800 dark:text-amber-300"
                                  : "border border-amber-500/30 bg-amber-500/15 text-amber-600 shadow-2xs dark:text-amber-400"
                                : typeof item.badge === "number" &&
                                    item.badge === 0
                                  ? "border border-border/50 bg-muted/70 text-muted-foreground"
                                  : "bg-sidebar-accent text-sidebar-accent-foreground"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer User Profile with Modern Smooth Popover Menu */}
      <SidebarFooter className="border-t border-sidebar-border p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-12 w-full cursor-pointer gap-3 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/20 px-2.5 py-1 shadow-2xs transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 hover:bg-sidebar-accent/60 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  aria-label={`${user.name} account menu`}
                  tooltip={
                    isMobile ? undefined : `${user.name} (${user.email})`
                  }
                >
                  <Avatar className="size-9 shrink-0 rounded-xl group-data-[collapsible=icon]:size-7">
                    <AvatarFallback className="rounded-xl bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold text-sidebar-foreground">
                      {user.name}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/60">
                      {user.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/50 transition-transform group-hover:text-sidebar-foreground group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-xl border border-sidebar-border bg-popover p-1.5 text-popover-foreground shadow-md"
                side={isMobile ? "bottom" : isCollapsed ? "right" : "top"}
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-2 text-left text-sm">
                    <Avatar className="size-9 shrink-0 rounded-lg">
                      <AvatarFallback className="rounded-xl bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-foreground">
                        {user.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuGroup className="flex flex-col gap-1">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <UserIcon className="size-4 text-muted-foreground" />
                      <span>Profile & Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    >
                      <Settings className="size-4 text-muted-foreground" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-destructive transition-colors focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
