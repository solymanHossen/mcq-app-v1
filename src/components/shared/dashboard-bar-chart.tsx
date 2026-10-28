"use client"

import * as React from "react"
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts"
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
import { BookOpen, BarChart3 } from "lucide-react"

interface BarDataPoint {
  category: string
  count: number
  fill?: string
}

interface DashboardBarChartProps {
  title?: string
  description?: string
  data: BarDataPoint[]
  totalItems: number
  itemLabel?: string
}

const chartConfig = {
  count: {
    label: "Items",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function DashboardBarChart({
  title = "Assessment Content Distribution",
  description = "Question difficulty & bank breakdown",
  data,
  totalItems,
  itemLabel = "Questions",
}: DashboardBarChartProps) {
  return (
    <Card className="flex flex-col rounded-3xl border border-border/70 bg-card p-2 sm:p-3 shadow-xs transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5 pb-2 sm:pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            <CardTitle className="font-heading text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {title}
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground font-medium">
            {description}
          </CardDescription>
        </div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs">
          <BookOpen className="size-5" />
        </span>
      </CardHeader>

      <CardContent className="flex-1 p-4 sm:p-5 pt-0">
        <div className="h-[240px] w-full pt-2">
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-border/40"
              />
              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs sm:text-sm font-bold text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                className="text-xs text-muted-foreground"
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                fill="var(--chart-1)"
                className="transition-all hover:opacity-85"
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Breakdown Summary Tiles */}
        <div className="mt-4 grid grid-cols-3 gap-2.5 pt-3 border-t border-border/60">
          {data.map((item) => {
            const pct = totalItems > 0 ? Math.round((item.count / totalItems) * 100) : 0
            return (
              <div
                key={item.category}
                className="flex flex-col items-center justify-center rounded-2xl bg-muted/30 p-2.5 sm:p-3 text-center border border-border/70"
              >
                <span className="text-xs font-bold text-muted-foreground truncate w-full">
                  {item.category}
                </span>
                <span className="font-heading text-lg sm:text-xl font-black text-foreground tabular-nums">
                  {item.count}
                </span>
                <span className="text-[11px] text-muted-foreground font-semibold">
                  {pct}% of {itemLabel}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
