import { fileURLToPath } from "node:url"
import "dotenv/config"
import { defineConfig } from "vitest/config"

/**
 * Separate config for the Phase 8 performance/concurrency harnesses in
 * scripts/perf/*.loadtest.ts. These are deliberately excluded from the
 * default `npm test` run (they're slow, hit the real database hard, and
 * print latency stats rather than asserting business correctness) — run
 * them explicitly:
 *
 *   npx vitest run --config vitest.perf.config.ts
 */
export default defineConfig({
  resolve: {
    // See vitest.config.ts for why this is an ordered array, not an object.
    alias: [
      { find: "@/prisma", replacement: fileURLToPath(new URL("./prisma", import.meta.url)) },
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ],
  },
  test: {
    include: ["scripts/perf/**/*.loadtest.ts"],
    testTimeout: 120_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
})
