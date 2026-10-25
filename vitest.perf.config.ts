import { fileURLToPath } from "node:url"
import "dotenv/config"
import { defineConfig } from "vitest/config"

/**
 * Separate config for the Phase 8 performance/concurrency harnesses in
 * lib/perf/*.loadtest.ts. These are deliberately excluded from the default
 * `npm test` run (they're slow, hit the real database hard, and print
 * latency stats rather than asserting business correctness) — run them
 * explicitly:
 *
 *   npx vitest run --config vitest.perf.config.ts
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    include: ["lib/perf/**/*.loadtest.ts"],
    testTimeout: 120_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
})
