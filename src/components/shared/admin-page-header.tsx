import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function AdminPageHeader({
  title,
  badge,
  description,
  actions,
  className,
}: {
  title: string
  badge?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/60",
        className
      )}
    >
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <div className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {actions}
        </div>
      )}
    </header>
  )
}

