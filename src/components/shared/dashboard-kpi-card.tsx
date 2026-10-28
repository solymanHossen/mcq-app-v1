import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface DashboardKpiCardProps {
  title: string
  value: string | number
  badgeText?: string
  trend?: "up" | "down" | "neutral"
  trendLabel?: string
  subtext?: string
  href?: string
  className?: string
  highlight?: boolean
  icon?: LucideIcon
}

export function DashboardKpiCard({
  title,
  value,
  badgeText,
  trend = "neutral",
  trendLabel,
  subtext,
  href,
  className,
  icon: Icon,
}: DashboardKpiCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  const cardElement = (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-3 p-0 pb-1">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex size-9 sm:size-10 items-center justify-center rounded-2xl bg-muted/60 text-foreground border border-border/70 shadow-2xs">
              <Icon className="size-4.5 sm:size-5" />
            </span>
          )}
          <CardDescription className="text-sm sm:text-base font-bold text-foreground">
            {title}
          </CardDescription>
        </div>

        {badgeText && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-xs font-bold tracking-tight rounded-full px-2.5 py-0.5 border border-border/70 bg-muted/40 text-foreground shadow-2xs"
          >
            <TrendIcon className="size-3 text-muted-foreground" />
            <span>{badgeText}</span>
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5 p-0 pt-4">
        <CardTitle className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-foreground tabular-nums leading-none">
          {value}
        </CardTitle>

        {(trendLabel || subtext) && (
          <div className="flex flex-col gap-1 text-xs sm:text-sm text-muted-foreground pt-1">
            {trendLabel && (
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <TrendIcon
                  className={cn(
                    "size-4",
                    trend === "up" && "text-emerald-600 dark:text-emerald-400",
                    trend === "down" && "text-destructive",
                    trend === "neutral" && "text-muted-foreground"
                  )}
                />
                <span>{trendLabel}</span>
              </span>
            )}
            {subtext && <span className="text-xs sm:text-sm text-muted-foreground font-medium">{subtext}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full cursor-pointer">
        {cardElement}
      </Link>
    )
  }

  return cardElement
}
