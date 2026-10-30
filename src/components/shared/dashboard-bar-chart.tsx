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
import { cn } from "@/lib/utils"

interface BarDataPoint {
  category: string
  count: number
  fill?: string
}

interface DashboardBarChartProps {
  className?: string
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
  className,
}: DashboardBarChartProps) {
  return (
    <Card
      className={cn(
        "flex flex-col rounded-2xl border border-border/70 bg-card shadow-xs transition-all hover:shadow-md",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-5 pb-2 sm:p-6 sm:pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4.5 text-primary" />
            <CardTitle className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {title}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        </div>
        <span className="flex size-8.5 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
          <BookOpen className="size-4" />
        </span>
      </CardHeader>

      <CardContent className="flex-1 p-5 pt-0 sm:p-6 sm:pt-0">
        <div className="h-[220px] w-full pt-2">
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
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
                className="text-xs font-semibold text-muted-foreground"
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
                radius={[6, 6, 0, 0]}
                fill="var(--chart-1)"
                className="transition-all hover:opacity-85"
              />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Breakdown Summary Tiles */}
        <div className="mt-4 grid grid-cols-3 gap-2 pt-2.5 border-t border-border/60">
          {data.map((item) => {
            const pct = totalItems > 0 ? Math.round((item.count / totalItems) * 100) : 0
            return (
              <div
                key={item.category}
                className="flex flex-col items-center justify-center rounded-xl bg-muted/30 p-2 text-center border border-border/70"
              >
                <span className="text-[11px] font-medium text-muted-foreground truncate w-full">
                  {item.category}
                </span>
                <span className="font-heading text-base font-bold text-foreground tabular-nums">
                  {item.count}
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
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
