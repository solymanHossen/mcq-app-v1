import { fileURLToPath } from "node:url"
import "dotenv/config"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    // Order matters here (hence the array form, not an object): "@/prisma"
    // must be matched before the general "@" alias, since prisma/ stays at
    // the true project root while everything else "@/..." now resolves
    // under src/ (see tsconfig.json's mirrored "paths" entries).
    alias: [
      { find: "@/prisma", replacement: fileURLToPath(new URL("./prisma", import.meta.url)) },
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ],
  },
})
