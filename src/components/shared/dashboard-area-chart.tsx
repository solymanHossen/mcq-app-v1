"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type TimeRange = "90d" | "30d" | "7d"

export interface ChartDataPoint {
  date: string
  primary: number
  secondary?: number
}

interface DashboardAreaChartProps {
  title: string
  description?: string
  data90d: ChartDataPoint[]
  data30d: ChartDataPoint[]
  data7d: ChartDataPoint[]
  primaryLabel?: string
  secondaryLabel?: string
  className?: string
}

export function DashboardAreaChart({
  title,
  description = "Total volume for the last 3 months",
  data90d,
  data30d,
  data7d,
  primaryLabel = "Activity",
  secondaryLabel = "Participants",
  className,
}: DashboardAreaChartProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>("90d")

  const activeData = React.useMemo(() => {
    switch (timeRange) {
      case "7d":
        return data7d
      case "30d":
        return data30d
      case "90d":
      default:
        return data90d
    }
  }, [timeRange, data7d, data30d, data90d])

  const chartConfig = {
    primary: {
      label: primaryLabel,
      color: "var(--color-chart-1, #2563eb)",
    },
    secondary: {
      label: secondaryLabel,
      color: "var(--color-chart-2, #60a5fa)",
    },
  } satisfies ChartConfig

  return (
    <Card
      className={cn(
        "rounded-2xl border border-border/70 bg-card shadow-xs transition-all hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-col gap-3 p-5 pb-2 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground">
            {timeRange === "90d"
              ? description
              : timeRange === "30d"
                ? "Total recorded volume for the last 30 days"
                : "Real-time daily activity across the last 7 days"}
          </CardDescription>
        </div>

        {/* Time range selector pills */}
        <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1 self-start sm:self-auto border border-border/60 shadow-2xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTimeRange("90d")}
            className={cn(
              "h-7.5 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-all cursor-pointer",
              timeRange === "90d" &&
                "bg-background text-foreground shadow-xs font-semibold border border-border/70"
            )}
          >
            Last 3 months
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTimeRange("30d")}
            className={cn(
              "h-7.5 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-all cursor-pointer",
              timeRange === "30d" &&
                "bg-background text-foreground shadow-xs font-semibold border border-border/70"
            )}
          >
            Last 30 days
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTimeRange("7d")}
            className={cn(
              "h-7.5 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-all cursor-pointer",
              timeRange === "7d" &&
                "bg-background text-foreground shadow-xs font-semibold border border-border/70"
            )}
          >
            Last 7 days
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2 sm:p-7 sm:pt-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full sm:h-[350px]"
        >
          <AreaChart
            data={activeData}
            margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-chart-1, #2563eb)"
                  stopOpacity={0.45}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-chart-1, #2563eb)"
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id="fillSecondary" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-chart-2, #60a5fa)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-chart-2, #60a5fa)"
                  stopOpacity={0.01}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              tickFormatter={(value) => value}
              className="text-xs font-mono text-muted-foreground"
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1.5 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Timeline: ${value}`}
                  indicator="dot"
                />
              }
            />
            {activeData[0]?.secondary !== undefined && (
              <Area
                type="natural"
                dataKey="secondary"
                stroke="var(--color-chart-2, #60a5fa)"
                strokeWidth={2}
                fill="url(#fillSecondary)"
                stackId="1"
              />
            )}
            <Area
              type="natural"
              dataKey="primary"
              stroke="var(--color-chart-1, #2563eb)"
              strokeWidth={2.5}
              fill="url(#fillPrimary)"
              stackId="2"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
