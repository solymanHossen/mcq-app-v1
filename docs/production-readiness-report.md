# Production readiness report

Audited as a production-readiness review of the exam platform ahead of a
release. Every result below marked **Verified** was actually executed in
this session, on this repository, against its real (local) Postgres/Redis —
not inferred from reading code. Where something wasn't or couldn't be
executed, it's marked **Not executed** and said so plainly, per this audit's
own ground rule. No deploy, no push, and no destructive operation was run
against any shared or production system — the one destructive-adjacent
action (a restore-from-backup test) was run against a disposable scratch
database created and dropped for that single purpose, never the real one.

## Release recommendation

**Do not release yet.** One release-blocking gap (Finding 1) means
registration and password reset do not work for a real user today. Nothing
else found rises to that severity — the rest of the platform, across
TypeScript/lint/test coverage, authorization, migration safety, backup/
restore, graceful shutdown, and security headers, is in genuinely strong
shape. Once Finding 1 is resolved (and ideally Findings 2-3 alongside it),
this is close to ready.

---

## Findings, ranked by severity

### Finding 1 — BLOCKING: no real email delivery

`lib/auth/mail.ts` is still exactly what its own comment says it is: *"Phase
1 stub: no email provider wired up yet... verification/reset messages are
just logged."* `sendVerificationEmail` and `sendPasswordResetEmail` both
`console.log` the OTP / reset link instead of sending anything.

**Impact:** a real user cannot verify their email or reset a forgotten
password — their code/link only ever reaches a server log they have no
access to. Beyond the functional break, this is also a quiet security
issue: OTPs and single-use reset tokens — both meant to be secret and
short-lived — are written in plaintext to whatever log aggregation the
deployment uses, for anyone with log access to read.

**Recommendation:** wire up a real provider (Resend, SES, Postmark — the
call sites in `lib/auth/mail.ts` don't need to change) before relying on
registration or password reset in production. Not fixed in this audit — no
real provider credentials exist in this environment, and faking a "working"
integration without them would be worse than reporting it plainly.

### Finding 2 — operational: no automated backup schedule

Backup and restore procedures are now verified to work (see Finding 7 /
§4-5 below), but nothing in this repository *runs* a backup on a schedule.
**Recommendation:** either your hosting Postgres's own managed automated
backups (if using one), or a cron job running the `pg_dump` command in
`docs/production-deployment.md` §4. Not built here — the right mechanism
depends on the actual hosting choice, which isn't decided yet.

### Finding 3 — operational: no error monitoring

No Sentry (or equivalent) integration exists. Errors are only visible via
whatever captures the container's stdout/stderr. For a platform handling
graded exams and payments, not knowing about a production error until a
user reports it is a real operational risk. Not fixed here — requires an
account/DSN this environment doesn't have. Recommend adding one before or
immediately after launch.

### Finding 4 — defense-in-depth: no Content-Security-Policy

Fixed in this audit: `X-Frame-Options`, `X-Content-Type-Options`,
`Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` are
now set on every response (`next.config.mjs`), and `X-Powered-By` is
disabled — **Verified** live, both via `next start` and inside the built
Docker image (headers present on `/login` in both).

A CSP was deliberately **not** added in this pass. This app has zero
external script/style dependencies (fonts and KaTeX are both self-hosted/
server-rendered — checked), which makes a strict `default-src 'self'`
policy realistic, but Next.js's own inline hydration and theme-switching
scripts need a **nonce-based** CSP to coexist with `script-src 'self'`
(the alternative, `'unsafe-inline'`, defeats most of the point). That needs
middleware wiring and careful testing across every route shape this app
has (static, dynamic, PPR) that this audit's remaining time didn't allow
doing safely. Recommended as the next hardening step, with Next.js's own
documented nonce pattern.

### Finding 5 — minor: CSV bulk-import size ceiling

`bulkImportQuestionsAction` (question bank CSV import) has no explicit file-
size or row-count cap of its own — it inherits Next.js's default Server
Action body limit (1MB). That's generous for a CSV of questions, but a
teacher with an unusually large bank could hit it. Low severity, not fixed;
`serverActions.bodySizeLimit` in `next.config.mjs` is the documented knob if
this becomes a real complaint.

### Finding 6 — fixed: no graceful shutdown

**Before this audit**, nothing in the codebase handled `SIGTERM`/`SIGINT` —
confirmed by grepping the entire source tree. **Fixed**: `lib/db.ts` now
registers a shutdown handler that disconnects the Prisma pool before
exiting, guarded against Next.js's dev-mode module reloading the same way
the existing Prisma singleton already is.

**Verified, twice, for real:**
- Sent a real `SIGTERM` to a running `next start` process: exited in
  **~110ms**.
- Ran `docker stop` against the built production container: stopped in
  **~0.38s**, well inside Docker's default 10s grace period (no SIGKILL
  needed).

### Finding 7 — verified: backup and restore actually work

Ran, for real, against this project's own (local) database:

```
pg_dump -U mcq -d mcq_platform -Fc -f backup.dump   # 95.3K
createdb mcq_restore_test
pg_restore -U mcq -d mcq_restore_test --no-owner --no-privileges backup.dump
```

**Verified**: 28/28 tables present in both databases, row counts matched
(10 users / 0 exams in both), and a spot-checked user row (email + role)
matched exactly between the original and the restored copy. Scratch
database and dump file deleted immediately after — the real database was
never touched by the restore.

### Finding 8 — verified: migrations and production deploy workflow

Reviewed all 10 migrations in `prisma/migrations/`: no `DROP TABLE`,
`DROP COLUMN`, `TRUNCATE`, destructive `ALTER COLUMN TYPE`, `RENAME`, or a
`NOT NULL` column added without a default. One migration includes a
deliberate backfill `UPDATE` (grandfathers pre-existing teacher accounts to
`VERIFIED` so a later verification-gate migration doesn't retroactively
lock them out) — reviewed, additive-only.

**Verified**: ran `prisma migrate deploy` (the correct production command —
see `docs/production-deployment.md` §3 for exactly why `migrate dev` must
never be run against production) against the real database; it correctly
reported `No pending migrations to apply`, confirming both that the schema
is in sync and that the command is idempotent/safe to run on every release.

### Finding 9 — verified: production build, Docker image, and container runtime

- `npm run build`: succeeds, 41 routes, no errors.
- `npm run start` (production server, not dev): **Verified** live — `/api/
  health` returns 200 with real DB+Redis checks, `/login` renders, response
  headers match the hardened config, session cookie after a real login is
  `HttpOnly; SameSite=Lax` (the `Secure` flag is NextAuth's own documented
  behavior once `NEXTAUTH_URL` is `https://` — not independently
  re-verified over a real TLS endpoint, since none exists in this
  environment; this one line is inspection, not execution, and is reported
  as such).
- **New**: added a multi-stage `Dockerfile` (`output: 'standalone'` in
  `next.config.mjs`) — not present before this audit. **Verified**: built
  successfully (247MB final image), actually run against the real local
  Postgres/Redis, health check and headers both confirmed correct, graceful
  shutdown confirmed via `docker stop` (Finding 6). One real bug was caught
  and fixed during this verification: the first version failed to build
  because `npm ci`'s `postinstall` (`prisma generate`) ran before the
  Prisma schema was copied into that build stage — fixed by copying
  `prisma.config.ts` and `prisma/` earlier. Image and container deleted
  after verification.

### Finding 10 — verified: authentication, authorization, ownership, rate limits

Scanned every server action file (`actions/*.actions.ts`) for any exported
function that never calls an auth guard. The scan flagged 9 candidates;
**manually verified all 9 are false positives**, not real gaps:
- 5 are in `actions/auth.actions.ts` (register, verify-email, resend-OTP,
  forgot-password, reset-password) — intentionally public, pre-session
  endpoints, each protected by either identifier/IP rate limiting
  (confirmed present for the first four) or token entropy instead (reset-
  password's security is the token itself, not a session check — correct
  design, not a gap).
- 4 are in `actions/grading.actions.ts` — each delegates to a shared
  `requireExamOwner()` helper that itself calls `assertRole` +
  `assertOwner`; the scan's per-function text match just didn't see through
  that one level of indirection.

This sits on top of the project's existing 291-test suite (see below),
which specifically exercises cross-user, cross-teacher, and cross-role
authorization in every phase of this platform (anti-cheat, grading,
payments, admin actions, learning features) — not newly built for this
audit, but re-run and confirmed passing as part of it.

### Finding 11 — verified: exam autosave, timeout, submission, recovery

Ran the specific test files covering this workflow and inspected the
result directly: **31/31 passing**
(`actions/attempt.actions.integration.test.ts`,
`lib/attempts/shuffle.test.ts`, `lib/grading/finalize.integration.test.ts`),
covering: attempt resumption vs. duplicate creation, concurrent-start
deduplication, `maxAttempts` enforcement, cross-student rejection,
exam-snapshot scoping, idempotent autosave retry, stale-write conflict
resolution, three distinct expired-attempt scenarios, concurrent-submit
deduplication, the post-submission edit lock, answer-key non-disclosure,
webcam-consent gating, and session-conflict detection (two tabs vs. a
same-tab reload).

**Gap, stated honestly**: this is all *server-side* coverage. The
*client-side* recovery path (the IndexedDB-backed offline queue replaying
a dropped answer after a tab crash/reload — `lib/attempts/offline-queue.ts`,
`lib/attempts/use-attempt-sync.ts`) has no automated test at all — this
project has no React/component-testing infrastructure (no React Testing
Library, no jsdom test environment configured), so that logic has only ever
been manually verified when it was built, not continuously regression-
tested since.

### Finding 12 — verified: secret handling and environment configuration

- `.env` is gitignored and was never committed — confirmed via
  `git ls-files` (only `.env.example`, which holds placeholders, not real
  values).
- No hardcoded secrets found in source.
- `.env.example` was missing documentation for `NEXTAUTH_URL`,
  `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` despite the code reading
  all three — **fixed**, added with explanations.
- Cross-referenced every `process.env.X` read in the codebase against
  `.env.example`: now fully covered.

### Finding 13 — not applicable: CORS

No CORS headers exist anywhere in the app, and that's correct, not a gap —
this platform has no legitimate third-party browser origin that needs to
call its API routes or Server Actions cross-origin. Verified by inspection;
nothing to fix.

### Finding 14 — not run: automated end-to-end tests

No Playwright/Cypress (or any E2E framework) exists in this project —
confirmed by searching the whole repository. There is no automated,
browser-driven E2E suite to run, and none was fabricated for this report.
In its place, this audit performed scripted, curl-based manual verification
of real HTTP behavior against both the dev and production servers (health
endpoint, login/cookie behavior, response headers, webhook signature
rejection) — real requests against a real running server, but not a
substitute for an actual E2E framework exercising the UI through a browser.
Recommend adding Playwright for the critical paths (register → verify →
login, start exam → answer → submit → view result) before scaling the team
working on this codebase, though it is not what's blocking this specific
release.

---

## What was run and what the results actually were

| Check | Result | How verified |
|---|---|---|
| TypeScript | Clean, 0 errors | `npm run typecheck`, output inspected |
| Lint | Clean, 0 errors/warnings | `npm run lint`, output inspected |
| Unit + integration tests | **291/291 passing**, 36 files | `npm run test`, run twice for stability, both runs inspected |
| E2E tests | No framework exists | Searched repo; see Finding 14 |
| Production build | Succeeds, 41 routes | `npm run build`, output inspected |
| Production runtime | Healthy, correct headers/cookies | `npm run start` + live curl requests |
| Docker build & run | Succeeds, 247MB, healthy | Built, ran, curled, stopped, deleted |
| Graceful shutdown | ~110ms (bare process), ~0.38s (`docker stop`) | Real SIGTERM sent, exit timing measured |
| Backup/restore | Schema + data verified identical | Real `pg_dump`/`pg_restore` into a scratch DB |
| Migration safety | 10/10 migrations reviewed, none destructive | Read every `migration.sql`, grepped for destructive DDL |
| `prisma migrate deploy` | Correctly idempotent | Run for real against the current database |
| Security headers | All 5 present, `X-Powered-By` removed | Live curl, both `next start` and Docker |
| Auth/authz/ownership | No real gaps found (9 false positives resolved) | Static scan + manual code read + 291 passing tests |
| Exam workflow tests | 31/31 passing | Ran the specific files, inspected results |
| Secret hygiene | Clean; `.env.example` gaps fixed | `git ls-files`, source grep, manual diff |

## What changed in this audit (all additive, nothing destructive, nothing deployed)

- `lib/db.ts` — graceful shutdown handler
- `next.config.mjs` — security headers, `poweredByHeader: false`, `output: 'standalone'`
- `Dockerfile`, `.dockerignore` — new
- `.env.example` — documented three previously-undocumented variables
- `docs/production-deployment.md`, `docs/production-readiness-report.md` — new

Nothing was pushed, deployed, or run against a shared/production system.
