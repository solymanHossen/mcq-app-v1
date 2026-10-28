import * as React from "react"
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
  sparklineData?: number[]
  sparklineType?: "area" | "bar" | "line"
  sparklineColor?: string
}

function KpiSparkline({
  data,
  type = "area",
  trend = "neutral",
  color,
}: {
  data: number[]
  type?: "area" | "bar" | "line"
  trend?: "up" | "down" | "neutral"
  color?: string
}) {
  const reactId = React.useId().replace(/:/g, "")
  const gradId = `spark-grad-${reactId}`

  const strokeColor =
    color ||
    (trend === "up"
      ? "#10b981"
      : trend === "down"
      ? "#f43f5e"
      : "#3b82f6")

  if (!data || data.length < 2) return null

  const width = 100
  const height = 36

  if (type === "bar") {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const barWidth = 6
    const totalBars = data.length
    const gap = totalBars > 1 ? (width - totalBars * barWidth) / (totalBars - 1) : 0

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        {data.map((val, idx) => {
          const barHeight = Math.max(5, ((val - min) / range) * (height - 8) + 4)
          const x = idx * (barWidth + gap)
          const y = height - barHeight
          const isLast = idx === data.length - 1
          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={2}
              fill={strokeColor}
              opacity={isLast ? 1 : 0.45 + (idx / totalBars) * 0.45}
            />
          )
        })}
      </svg>
    )
  }

  // Smooth Bezier Curve Calculation for Area / Line
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((val, idx) => ({
    x: (idx / (data.length - 1)) * width,
    y: height - 6 - ((val - min) / range) * (height - 14),
  }))

  let pathD = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    pathD += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {type === "area" && (
        <path d={areaD} fill={`url(#${gradId})`} />
      )}

      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Trailing glow point at the latest value */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="3"
        fill={strokeColor}
        className="animate-pulse"
      />
    </svg>
  )
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
  sparklineData,
  sparklineType = "area",
  sparklineColor,
}: DashboardKpiCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  const cardElement = (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:p-5.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-0 pb-1">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-foreground border border-border/70 shadow-2xs">
              <Icon className="size-4" />
            </span>
          )}
          <CardDescription className="text-xs sm:text-sm font-semibold text-foreground truncate">
            {title}
          </CardDescription>
        </div>

        {badgeText && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 text-[11px] font-medium tracking-tight rounded-full px-2 py-0.5 border border-border/70 bg-muted/40 text-muted-foreground shadow-2xs shrink-0"
          >
            <TrendIcon className="size-3 text-muted-foreground" />
            <span>{badgeText}</span>
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-2 p-0 pt-3">
        <div className="flex items-end justify-between gap-3">
          <CardTitle className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums leading-none">
            {value}
          </CardTitle>

          {sparklineData && sparklineData.length > 1 && (
            <div className="h-8 w-18 sm:w-20 shrink-0 overflow-hidden">
              <KpiSparkline
                data={sparklineData}
                type={sparklineType}
                trend={trend}
                color={sparklineColor}
              />
            </div>
          )}
        </div>

        {(trendLabel || subtext) && (
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground pt-0.5">
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
            {subtext && <span className="text-[11px] sm:text-xs text-muted-foreground font-normal">{subtext}</span>}
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
