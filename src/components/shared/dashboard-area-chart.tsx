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
  description = "Total for the last 3 months",
  data90d,
  data30d,
  data7d,
  primaryLabel = "Submissions",
  secondaryLabel = "Unique Takers",
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
        "rounded-2xl border border-border/80 bg-card shadow-xs",
        className
      )}
    >
      <CardHeader className="flex flex-col gap-4 p-5 pb-0 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pb-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground sm:text-sm">
            {timeRange === "90d"
              ? description
              : timeRange === "30d"
                ? "Total for the last 30 days"
                : "Total for the last 7 days"}
          </CardDescription>
        </div>

        {/* Time range selector pills matching reference image */}
        <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1 self-start sm:self-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setTimeRange("90d")}
            className={cn(
              "h-7 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-all",
              timeRange === "90d" &&
                "bg-card text-foreground shadow-2xs font-semibold"
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
              "h-7 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-all",
              timeRange === "30d" &&
                "bg-card text-foreground shadow-2xs font-semibold"
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
              "h-7 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-all",
              timeRange === "7d" &&
                "bg-card text-foreground shadow-2xs font-semibold"
            )}
          >
            Last 7 days
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-4 sm:p-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[240px] w-full sm:h-[280px]"
        >
          <AreaChart
            data={activeData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-chart-1, #2563eb)"
                  stopOpacity={0.4}
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
                  stopOpacity={0.25}
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
              tickMargin={10}
              tickFormatter={(value) => value}
              className="text-[11px] font-mono text-muted-foreground"
            />
            <ChartTooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Date: ${value}`}
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
