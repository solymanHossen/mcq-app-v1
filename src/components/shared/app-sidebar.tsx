"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings, User as UserIcon } from "lucide-react"
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
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/shared/logout-button"
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
  navItems: readonly SidebarNavItem[]
  user: { name: string; email: string }
}

export function AppSidebar({
  brandIcon,
  brandName,
  badgeLabel,
  navItems,
  user,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar z-30"
      {...props}
    >
      {/* Brand Header: Aligned height (h-20) with Dashboard Header */}
      <SidebarHeader className="h-20 border-b-0 p-0">
        <div className="flex size-full items-center gap-3 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            title={brandName}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              {brandIcon}
            </span>
            <span className="font-heading text-base font-bold tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
              {brandName}
            </span>
          </Link>
          <Badge
            variant="secondary"
            className="ml-auto rounded-lg px-2.5 py-0.5 text-xs font-semibold shadow-2xs group-data-[collapsible=icon]:hidden"
          >
            {badgeLabel}
          </Badge>
        </div>
      </SidebarHeader>

      {/* Navigation Links with large items and primary active styling */}
      <SidebarContent className="p-3">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "h-12 rounded-2xl px-4 text-[15px] font-medium gap-3.5 transition-all duration-200 active:scale-[0.98]",
                        active
                          ? "bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/25 data-[active=true]:bg-primary! data-[active=true]:text-primary-foreground! data-[active=true]:shadow-md data-[active=true]:shadow-primary/25 hover:bg-primary/95! hover:text-primary-foreground! [&_svg]:text-primary-foreground! data-[active=true]:[&_svg]:text-primary-foreground!"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground [&_svg]:text-muted-foreground/80 hover:[&_svg]:text-foreground",
                        "[&_svg]:size-5 shrink-0"
                      )}
                    >
                      <Link href={item.href}>
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

      {/* Footer Profile */}
      <SidebarFooter className="border-t-0 p-3 pb-8">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-1.5">
              <Link
                href="/profile"
                className="group flex items-center gap-3 rounded-2xl p-2 transition-all hover:bg-muted/80 shadow-2xs group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                title={`${user.name} (${user.email})`}
              >
                <Avatar className="size-9 shadow-xs ring-0">
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <Settings className="size-4 text-muted-foreground opacity-60 transition-transform group-hover:rotate-45 group-hover:opacity-100 group-data-[collapsible=icon]:hidden" />
              </Link>

              <div className="flex items-center justify-between px-2 pt-0.5 group-data-[collapsible=icon]:hidden">
                <Link
                  href="/profile"
                  className="inline-flex h-6 items-center gap-1.5 rounded-md px-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <UserIcon className="size-3.5" />
                  <span>Profile</span>
                </Link>
                <LogoutButton className="h-6 text-xs text-muted-foreground hover:text-destructive" />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
