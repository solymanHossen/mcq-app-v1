/** Shared latency-percentile helper for the load-test harnesses in this
 * directory. Not imported by any application code — perf-testing only. */
export function percentiles(samplesMs: number[]) {
  const sorted = [...samplesMs].sort((a, b) => a - b)
  const at = (p: number) => {
    if (sorted.length === 0) return 0
    const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
    return sorted[Math.max(0, idx)]
  }
  return {
    count: sorted.length,
    min: sorted[0] ?? 0,
    p50: at(50),
    p95: at(95),
    p99: at(99),
    max: sorted[sorted.length - 1] ?? 0,
    mean: sorted.reduce((a, b) => a + b, 0) / (sorted.length || 1),
  }
}

export async function timed<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const start = performance.now()
  const result = await fn()
  return { result, ms: performance.now() - start }
}

export function printStats(label: string, samplesMs: number[], errors: number) {
  const s = percentiles(samplesMs)
  console.log(
    `${label}: n=${s.count} errors=${errors} min=${s.min.toFixed(1)}ms p50=${s.p50.toFixed(1)}ms p95=${s.p95.toFixed(1)}ms p99=${s.p99.toFixed(1)}ms max=${s.max.toFixed(1)}ms mean=${s.mean.toFixed(1)}ms`
  )
}
