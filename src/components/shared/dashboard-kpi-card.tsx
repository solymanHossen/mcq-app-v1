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
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border-none bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7 dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]",
        highlight && "ring-2 ring-destructive/30 shadow-destructive/10",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-0">
        <CardDescription className="text-xs font-bold tracking-wider text-muted-foreground uppercase sm:text-sm">
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
              "flex items-center gap-1 font-mono text-xs font-semibold tracking-tight rounded-full px-2.5 py-0.5 shadow-2xs border-none",
              trend === "up" && "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
              trend === "down" && "text-destructive bg-destructive/10"
            )}
          >
            <TrendIcon className="size-3" />
            <span>{badgeText}</span>
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-0 pt-4">
        <CardTitle className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {value}
        </CardTitle>

        {(trendLabel || subtext) && (
          <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:text-sm">
            {trendLabel && (
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
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
            {subtext && <span className="text-muted-foreground">{subtext}</span>}
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
