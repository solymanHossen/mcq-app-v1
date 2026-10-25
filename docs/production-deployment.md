# Deployment, migration, backup, restore & rollback

Companion to [docs/production-readiness-report.md](production-readiness-report.md),
which has the full audit findings this procedure reflects. Every command
below was actually run against this project during that audit — see the
report for exact output.

## 1. Required environment variables

See `.env.example` for the full, current list with inline explanations.
At minimum, production needs:

- `DATABASE_URL`, `NEXTAUTH_SECRET`, `AUTH_SECRET`, `NEXTAUTH_URL` (must be
  the real `https://` production URL — NextAuth only marks the session
  cookie `Secure` once this is set to an https origin)
- `CRON_SECRET` (protects both scheduled job endpoints)
- `DB_POOL_MAX` / `DB_POOL_CONNECTION_TIMEOUT_MS` if the default pool sizing
  (see `lib/db.ts`) doesn't match the target host — see
  `docs/performance-audit.md` §9 for how to size these
- `REDIS_URL`, `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY` /
  `STRIPE_WEBHOOK_SECRET` are all genuinely optional — each feature they gate
  degrades to "unavailable," never to broken or insecure, when unset (see
  each module's own comments: `lib/redis.ts`, `lib/ai/explain.ts`,
  `lib/payments/provider.ts`)

**Known gap** (see the report, Finding 1): `lib/auth/mail.ts` is still a
Phase 1 stub that logs OTP/reset codes to the console instead of emailing
them. There is no environment variable for this yet because no real
provider is wired up — this must be resolved before relying on
registration or password reset in production.

## 2. Building and running the container

```bash
docker build -t mcq-platform .
docker run -d --name mcq-platform \
  -p 3000:3000 \
  --env-file .env.production \
  mcq-platform
```

The `Dockerfile` is a multi-stage build on `output: 'standalone'`
(`next.config.mjs`) — verified in this audit: built successfully, started
against the real Postgres/Redis, served `/api/health` and `/login`
correctly (headers included), and shut down in under 0.4s on `docker stop`
(see report, Findings 6 and 8). Final image: 247MB.

The container does **not** run migrations on startup, by design (see §3) —
nothing about `docker run`-ing this image touches the schema.

## 3. Database migrations — production workflow

**Always `prisma migrate deploy`. Never `prisma migrate dev` against a
production database.**

`migrate dev` is an interactive, development-only command: it can prompt,
it can generate a *new* migration by diffing the schema against the
database, and critically, if it detects drift it can offer to **reset the
database** — acceptable on a disposable local database, never acceptable
against production data.

`migrate deploy` only ever applies migrations that already exist as files
in `prisma/migrations/`, in order, and does nothing if there's nothing
pending. It never generates a migration, never prompts, and never resets
anything.

```bash
# Run once, before starting new application instances, as part of the
# release process — not from inside the running container, and not
# automatically on every boot.
DATABASE_URL="<production-url>" npx prisma migrate deploy
```

Verified in this audit: run against the current database, correctly
reported `No pending migrations to apply` (idempotent — safe to run on
every release even when there's nothing new).

**Reviewed the full migration history** (10 migrations, `prisma/migrations/`):
no `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, destructive `ALTER COLUMN TYPE`,
or `RENAME`, and no `NOT NULL` column added without a default that would
fail against existing rows. One migration
(`20261025105418_admin_subscriptions_payments`) includes a deliberate
backfill `UPDATE` (grandfathers existing teacher accounts to `VERIFIED`
status) — reviewed and confirmed it only ever sets values, never removes
data.

## 4. Backup

Verified end-to-end in this audit (full dump → fresh database → restore →
row-count and content comparison — see the report for the exact output).

```bash
# Custom format: compressed, supports pg_restore's parallel/selective
# restore — the recommended format for anything beyond a quick manual check.
pg_dump -U <user> -d <database> -Fc -f backup-$(date +%Y%m%d-%H%M%S).dump
```

Run this on a schedule (e.g. a daily cron job, or your managed Postgres
provider's own automated backups if using one) and store the output
somewhere other than the database host itself. This repository does not yet
include a scheduled backup job — see the report's outstanding risks.

## 5. Restore

```bash
# Into a NEW, empty database — never directly over a live one, so a bad
# restore is cheap to discard and a good one can be verified before cutover.
createdb -U <user> <restored-db-name>
pg_restore -U <user> -d <restored-db-name> --no-owner --no-privileges backup-<timestamp>.dump

# Verify before pointing the app at it:
psql -U <user> -d <restored-db-name> -c "SELECT count(*) FROM \"User\";"
# ...compare against known-good counts / spot-check specific rows...

# Only then repoint DATABASE_URL at the restored database (rename it into
# place, or update the connection string — whichever your setup uses) and
# restart the application.
```

## 6. Rollback

**Application rollback** (bad release, schema unchanged): redeploy the
previous container image/build. Since migrations are a separate, explicit
step (§3) and the schema didn't change, this is a plain redeploy — no
database action needed.

**Application rollback after a migration ran**: Prisma Migrate has no
built-in automatic "down" migration. Two options, in order of preference:

1. **Forward-fix**: write a new migration that undoes the problematic
   change, and deploy it the normal way (§3). This is almost always safer
   than reversing history, especially once other instances or background
   jobs may already be relying on the new schema.
2. **Restore from backup** (§5) if the migration caused actual data
   corruption, not just an application bug — this is a last resort, and
   loses any writes made after the backup was taken.

Never hand-edit `_prisma_migrations` or delete migration files to "undo"
a deployed migration — this desynchronizes the migration history from what
actually ran against the database and makes every future `migrate deploy`
unreliable.

## 7. Health checks

`GET /api/health` (unauthenticated, checks Postgres with one `SELECT 1` and
Redis with a `PING` if configured) — returns `200 {"status":"ok",...}` or
`503 {"status":"degraded",...}`. Point your load balancer's / orchestrator's
readiness and liveness probes at this. Verified live, including correctly
flipping to `degraded`/503 during an actual Postgres outage and recovering
within ~1-2s of the database coming back (see `docs/performance-audit.md`
§5 for the full investigation).
