# Multi-stage build producing a minimal production image from Next.js's
# `output: 'standalone'` build (next.config.mjs) — only the server and the
# dependencies it actually traces as used ship in the final image, not the
# full node_modules tree.
#
# Build:  docker build -t mcq-platform .
# Run:    docker run -p 3000:3000 --env-file .env mcq-platform
#
# Requires DATABASE_URL (and the other vars in .env.example) at runtime.
# Does NOT run migrations itself — see docs/production-deployment.md for why
# that's a deliberate, separate step (`prisma migrate deploy`), never baked
# into container startup.

FROM node:24-alpine AS base

# ---- deps: install once, cached across builds unless package*.json or the
# Prisma schema change. The schema and prisma.config.ts have to be present
# here too: `npm ci` runs the project's own `postinstall` (`prisma
# generate`), which needs both to resolve the schema location. No real
# DATABASE_URL is needed to generate a client — only to connect one at
# runtime — but prisma.config.ts's `env("DATABASE_URL")` throws if the
# variable is entirely unset, so a placeholder satisfies it here.
FROM base AS deps
WORKDIR /app
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
COPY package.json package-lock.json* prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# ---- builder: generate the Prisma client and build the Next.js app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL isn't needed to generate the client or build the app (no
# runtime DB connection happens at build time) — Prisma's generator only
# reads the schema file.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate
RUN npm run build

# ---- runner: the actual production image, no build tooling included
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Belt-and-suspenders: Next's standalone output tracer has a known history
# of missing Prisma's generated query-engine binaries, especially with a
# custom generator output path (this schema uses ./generated/prisma, not
# the default node_modules/.prisma/client) — copied explicitly rather than
# trusted to tracing, and verified by actually running this image (see
# docs/production-deployment.md).
COPY --from=builder --chown=nextjs:nodejs /app/prisma/generated ./prisma/generated

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
