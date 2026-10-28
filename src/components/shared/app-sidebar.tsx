"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, ChevronsUpDown, LogOut, Settings, User as UserIcon } from "lucide-react"
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
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar z-30"
      {...props}
    >
      {/* Brand Header: Aligned height (h-20) with Dashboard Header */}
      <SidebarHeader className="h-20 border-b border-sidebar-border p-0">
        <div className="flex size-full items-center gap-3 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            title={brandName}
          >
            {logoUrl ? (
              <div className="relative size-9 shrink-0 overflow-hidden rounded-lg border border-sidebar-border/60 bg-sidebar-accent/50 p-1 shadow-2xs flex items-center justify-center">
                <Image
                  src={logoUrl}
                  alt={brandName}
                  width={36}
                  height={36}
                  className="size-full object-contain"
                  unoptimized={logoUrl.startsWith("/uploads/") || logoUrl.startsWith("http")}
                />
              </div>
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
                {brandIcon}
              </span>
            )}
            <span className="font-heading text-base font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
              {brandName}
            </span>
          </Link>
          <Badge
            variant="secondary"
            className="ml-auto rounded-md px-2 py-0.5 text-xs font-semibold shadow-none group-data-[collapsible=icon]:hidden"
          >
            {badgeLabel}
          </Badge>
        </div>
      </SidebarHeader>

      {/* Navigation Links with shadcn semantic sidebar color palette and clean rounded-lg geometry */}
      <SidebarContent className="p-3">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const hasSubItems = Boolean(item.items && item.items.length > 0)
                const isSubActive = Boolean(
                  item.items?.some((sub) =>
                    sub.exact
                      ? pathname === sub.href
                      : pathname === sub.href || pathname.startsWith(`${sub.href}/`)
                  )
                )
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`) || isSubActive

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
                                tooltip={item.label}
                                className={cn(
                                  "relative h-10 rounded-lg pl-3.5 pr-3 text-sm font-medium gap-3 transition-all duration-200 cursor-pointer",
                                  active
                                    ? "bg-sidebar-accent text-primary font-semibold"
                                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                  "[&_svg]:size-4.5 shrink-0"
                                )}
                              >
                                {active && (
                                  <span
                                    aria-hidden="true"
                                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary shadow-xs shadow-primary/40 transition-all duration-200"
                                  />
                                )}
                                {item.icon}
                              </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              side="right"
                              align="start"
                              sideOffset={8}
                              className="w-48 rounded-xl border border-sidebar-border bg-popover p-1.5 text-popover-foreground shadow-xl backdrop-blur-xl"
                            >
                              <DropdownMenuLabel className="px-2.5 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {item.label}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {item.items?.map((subItem) => {
                                const isCurrentSubActive = subItem.exact
                                  ? pathname === subItem.href
                                  : pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)
                                return (
                                  <DropdownMenuItem key={subItem.href} asChild>
                                    <Link
                                      href={subItem.href}
                                      className={cn(
                                        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer transition-colors",
                                        isCurrentSubActive
                                          ? "bg-sidebar-accent text-primary font-semibold"
                                          : "text-foreground hover:bg-muted"
                                      )}
                                    >
                                      {subItem.icon}
                                      <span>{subItem.label}</span>
                                    </Link>
                                  </DropdownMenuItem>
                                )
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                size="default"
                                isActive={active}
                                tooltip={item.label}
                                className={cn(
                                  "relative h-10 w-full rounded-lg pl-3.5 pr-3 text-sm font-medium gap-3 transition-all duration-200 cursor-pointer overflow-hidden",
                                  active
                                    ? "bg-sidebar-accent text-primary font-semibold data-[active=true]:bg-sidebar-accent data-[active=true]:text-primary"
                                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                  "[&_svg]:size-4.5 shrink-0"
                                )}
                              >
                                {active && (
                                  <span
                                    aria-hidden="true"
                                    className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary shadow-xs shadow-primary/40 transition-all duration-200"
                                  />
                                )}
                                {item.icon}
                                <span className="tracking-tight group-data-[collapsible=icon]:hidden">
                                  {item.label}
                                </span>
                                <ChevronRight className="ml-auto size-4 text-sidebar-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="animate-in fade-in-0 duration-200 group-data-[collapsible=icon]:hidden">
                              <SidebarMenuSub className="mx-3.5 my-1 border-l border-sidebar-border/70 pl-2.5 space-y-0.5">
                                {item.items?.map((subItem) => {
                                  const isCurrentSubActive = subItem.exact
                                    ? pathname === subItem.href
                                    : pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)

                                  return (
                                    <SidebarMenuSubItem key={subItem.href}>
                                      <SidebarMenuSubButton
                                        asChild
                                        size="sm"
                                        isActive={isCurrentSubActive}
                                        className={cn(
                                          "h-8 rounded-md px-2.5 text-xs font-medium transition-colors",
                                          isCurrentSubActive
                                            ? "bg-sidebar-accent text-primary font-semibold"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                        )}
                                      >
                                        <Link href={subItem.href} className="flex items-center gap-2">
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
                      tooltip={item.label}
                      className={cn(
                        "relative h-10 rounded-lg pl-3.5 pr-3 text-sm font-medium gap-3 transition-all duration-200 overflow-hidden",
                        active
                          ? "bg-sidebar-accent text-primary font-semibold data-[active=true]:bg-sidebar-accent data-[active=true]:text-primary hover:bg-sidebar-accent hover:text-primary [&_svg]:text-primary data-[active=true]:[&_svg]:text-primary"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground [&_svg]:text-sidebar-foreground/60 hover:[&_svg]:text-sidebar-foreground",
                        "[&_svg]:size-4.5 shrink-0"
                      )}
                    >
                      <Link href={item.href}>
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary shadow-xs shadow-primary/40 transition-all duration-200"
                          />
                        )}
                        {item.icon}
                        <span className="tracking-tight group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
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
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-12 w-full rounded-lg px-2.5 transition-all duration-200 hover:bg-sidebar-accent/60 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center cursor-pointer"
                  tooltip={`${user.name} (${user.email})`}
                >
                  <Avatar className="size-8.5 rounded-lg shrink-0">
                    <AvatarFallback className="rounded-lg bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
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
                className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-xl border border-sidebar-border bg-popover/98 p-1.5 text-popover-foreground shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
                side={isMobile ? "bottom" : isCollapsed ? "right" : "top"}
                align={isCollapsed ? "end" : "end"}
                sideOffset={8}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-2 text-left text-sm">
                    <Avatar className="size-9 rounded-lg shrink-0">
                      <AvatarFallback className="rounded-lg bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
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
                <DropdownMenuGroup className="space-y-0.5">
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
