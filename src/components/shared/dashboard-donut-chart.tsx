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
import { Users, PieChartIcon } from "lucide-react"

interface UserDistributionData {
  role: string
  label: string
  count: number
  color: string
}

interface DashboardDonutChartProps {
  title?: string
  description?: string
  data: UserDistributionData[]
  totalUsers: number
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
}: DashboardDonutChartProps) {
  const chartData = React.useMemo(() => {
    return data.map((d) => ({
      name: d.label,
      value: d.count,
      fill: d.color,
    }))
  }, [data])

  return (
    <Card className="flex flex-col rounded-3xl border border-border/70 bg-card p-2 sm:p-3 shadow-xs transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5 pb-2 sm:pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PieChartIcon className="size-5 text-primary" />
            <CardTitle className="font-heading text-xl sm:text-2xl font-black tracking-tight text-foreground">
              {title}
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground font-medium">
            {description}
          </CardDescription>
        </div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-2xs">
          <Users className="size-5" />
        </span>
      </CardHeader>

      <CardContent className="flex-1 p-4 sm:p-5 pt-0">
        <div className="relative mx-auto aspect-square max-h-[260px] w-full">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[260px]"
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
                innerRadius={72}
                outerRadius={105}
                paddingAngle={4}
                cornerRadius={7}
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
            <span className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-foreground tabular-nums leading-none">
              {totalUsers}
            </span>
            <span className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Users
            </span>
          </div>
        </div>

        {/* Legend Pills with count & percentage */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 pt-3 border-t border-border/60">
          {data.map((item) => {
            const pct = totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0
            return (
              <div
                key={item.role}
                className="flex items-center justify-between rounded-2xl bg-muted/30 p-2.5 sm:p-3 text-xs sm:text-sm border border-border/70"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-foreground truncate">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  <span className="font-black text-foreground tabular-nums text-sm sm:text-base">
                    {item.count}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
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
