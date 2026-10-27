import Link from "next/link"
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
  highlight = false,
}: DashboardKpiCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  const cardElement = (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 sm:p-6",
        href && "hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40",
        highlight && "ring-1 ring-destructive/40 border-destructive/30",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-0">
        <CardDescription className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:text-sm sm:normal-case">
          {title}
        </CardDescription>

        {badgeText && (
          <Badge
            variant={
              highlight
                ? "destructive"
                : trend === "down"
                  ? "secondary"
                  : "outline"
            }
            className={cn(
              "flex items-center gap-1 font-mono text-[11px] font-medium tracking-tight rounded-full px-2 py-0.5",
              trend === "up" && "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
              trend === "down" && "border-destructive/30 text-destructive bg-destructive/5"
            )}
          >
            <TrendIcon className="size-3" />
            <span>{badgeText}</span>
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-0 pt-3">
        <CardTitle className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {value}
        </CardTitle>

        {(trendLabel || subtext) && (
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {trendLabel && (
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <TrendIcon
                  className={cn(
                    "size-3.5",
                    trend === "up" && "text-emerald-600 dark:text-emerald-400",
                    trend === "down" && "text-destructive",
                    trend === "neutral" && "text-muted-foreground"
                  )}
                />
                <span>{trendLabel}</span>
              </span>
            )}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {cardElement}
      </Link>
    )
  }

  return cardElement
}
