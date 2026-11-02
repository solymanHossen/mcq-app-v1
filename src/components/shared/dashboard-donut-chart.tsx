"use client"

import * as React from "react"
import { PieChart, Pie, Cell } from "recharts"
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
import { Users, BookOpen, PieChartIcon } from "lucide-react"
import { cn } from "@/lib/utils"


interface UserDistributionData {
  role: string
  label: string
  count: number
  color: string
}

interface DashboardDonutChartProps {
  className?: string
  title?: string
  description?: string
  data: UserDistributionData[]
  totalUsers: number
  centerLabel?: string
  iconName?: "users" | "exams" | "book"
}

const chartConfig = {
  students: {
    label: "Students",
    color: "var(--chart-1)",
  },
  teachers: {
    label: "Teachers",
    color: "var(--chart-2)",
  },
  admins: {
    label: "Administrators",
    color: "var(--chart-3)",
  },
  pending: {
    label: "Pending Verification",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function DashboardDonutChart({
  title = "User Demographics",
  description = "Role distribution across verified accounts",
  data,
  totalUsers,
  centerLabel = "Total Users",
  iconName = "users",
  className,
}: DashboardDonutChartProps) {
  const HeaderIcon = iconName === "book" || iconName === "exams" ? BookOpen : Users
  const chartData = React.useMemo(() => {
    return data.map((d) => ({
      name: d.label,
      value: d.count,
      fill: d.color,
    }))
  }, [data])

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
            <PieChartIcon className="size-4.5 text-primary" />
            <CardTitle className="font-heading text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {title}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        </div>
        <span className="flex size-8.5 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-2xs">
          <HeaderIcon className="size-4" />
        </span>
      </CardHeader>


      <CardContent className="flex-1 p-5 pt-0 sm:p-6 sm:pt-0">
        <div className="relative mx-auto aspect-square max-h-[240px] w-full">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[240px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={68}
                outerRadius={98}
                paddingAngle={4}
                cornerRadius={6}
                strokeWidth={2}
                stroke="var(--card)"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Center Statistic Overlay */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums leading-none">
              {totalUsers}
            </span>
            <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {centerLabel}
            </span>
          </div>
        </div>


        {/* Legend Pills with count & percentage */}
        <div className="mt-4 grid grid-cols-2 gap-2 pt-2.5 border-t border-border/60">
          {data.map((item) => {
            const pct = totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0
            return (
              <div
                key={item.role}
                className="flex items-center justify-between rounded-xl bg-muted/30 p-2 sm:p-2.5 text-xs border border-border/70"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-foreground truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  <span className="font-bold text-foreground tabular-nums text-xs sm:text-sm">
                    {item.count}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    ({pct}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
