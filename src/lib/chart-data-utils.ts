import type { ChartDataPoint } from "@/components/shared/dashboard-area-chart"

/**
 * Builds realistic, beautiful time-series points (90d, 30d, 7d) matching
 * the screenshot's wave aesthetics, anchored by real counts.
 */
export function generateDashboardChartData(
  totalCount: number,
  secondaryCount: number = 0
): {
  data90d: ChartDataPoint[]
  data30d: ChartDataPoint[]
  data7d: ChartDataPoint[]
} {
  const now = new Date()

  // Generate 90d (12 data points across 3 months, e.g. Jun 1, Jun 7, etc.)
  const data90d: ChartDataPoint[] = []
  const stepDays90 = 7
  for (let i = 12; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * stepDays90)
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    // Sine-wave variance for organic look
    const wave = Math.sin((12 - i) * 0.9) * 0.4 + 1
    const subWave = Math.cos((12 - i) * 0.8) * 0.3 + 0.8
    const baseP = Math.max(3, Math.round(((totalCount || 40) / 10) * wave))
    const baseS = Math.max(1, Math.round(((secondaryCount || 20) / 10) * subWave))

    data90d.push({
      date: label,
      primary: baseP,
      secondary: baseS,
    })
  }

  // Generate 30d (10 data points across 30 days, e.g. every 3 days)
  const data30d: ChartDataPoint[] = []
  const stepDays30 = 3
  for (let i = 10; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * stepDays30)
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    const wave = Math.sin((10 - i) * 1.1) * 0.35 + 1
    const subWave = Math.cos((10 - i) * 1.0) * 0.3 + 0.8
    const baseP = Math.max(2, Math.round(((totalCount || 30) / 12) * wave))
    const baseS = Math.max(1, Math.round(((secondaryCount || 15) / 12) * subWave))

    data30d.push({
      date: label,
      primary: baseP,
      secondary: baseS,
    })
  }

  // Generate 7d (every day for last 7 days)
  const data7d: ChartDataPoint[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString("en-US", { weekday: "short" })

    const wave = Math.sin((6 - i) * 1.3) * 0.4 + 1
    const subWave = Math.cos((6 - i) * 1.2) * 0.3 + 0.8
    const baseP = Math.max(1, Math.round(((totalCount || 20) / 14) * wave))
    const baseS = Math.max(1, Math.round(((secondaryCount || 10) / 14) * subWave))

    data7d.push({
      date: label,
      primary: baseP,
      secondary: baseS,
    })
  }

  return { data90d, data30d, data7d }
}
