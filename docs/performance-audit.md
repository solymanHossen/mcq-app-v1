# Concurrent-traffic performance audit

Phase 8 of this project. Scope: profile the exam-taking platform under
concurrent load, fix what's demonstrably broken, and document what's still a
capacity limit rather than papering over it.

**Read this before citing any number below.** Every measurement here was
taken on one shared development machine (8 CPU cores, 18GB RAM with ~11GB
already in use by other processes at test time). Sections 1-8 were measured
against a single `postgres:17-alpine` container on its *default,
unconfigured* settings (`max_connections=100`, `shared_buffers=128MB`);
section 9 then tunes that configuration for a specific small-host deployment
target and re-measures against it — read each section's numbers against the
configuration that section itself describes, not an assumed constant one.
Nothing here is a production capacity guarantee. The numbers are useful for
three things: finding real bottlenecks, verifying a fix actually moved the
needle, and giving an honest order-of-magnitude sense of where a given
configuration starts to strain — not for predicting how many concurrent
students a real deployment can serve. Run-to-run variance
on this shared machine was itself measurable (±20-30% on some figures); read
every number as "this order of magnitude," not a precise constant.

## How to reproduce

```bash
# 1. Seed a realistic-scale dataset (creates ~5k students, 3 exams, ~9k
#    attempts, ~360k answers; takes ~90s).
npx tsx lib/perf/seed-scale.ts

# 2. Run the concurrency/load harness (NOT part of `npm test` — separate
#    config so slow, DB-hammering perf runs never block or slow down CI):
npx vitest run --config vitest.perf.config.ts --reporter=verbose

# 3. Tune and re-run to compare, e.g.:
DB_POOL_MAX=50 npx vitest run --config vitest.perf.config.ts --reporter=verbose -t "many students answering"

# 4. Clean up the seeded dataset when done (leaving it in the dev database
#    will skew the global leaderboard's ranking in the regular test suite):
npx tsx lib/perf/seed-scale.ts --cleanup
```

`lib/perf/exam-concurrency.loadtest.ts` calls the real server actions
(`startAttemptAction`, `saveAnswerAction`, `submitAttemptAction`,
`getExamLeaderboard`) directly in-process — every real Prisma query,
transaction, and the real shared connection pool are exercised, but HTTP,
Next.js routing/rendering, and network latency to a browser are not. Treat
these as server-action-and-database-layer numbers, not full end-to-end
numbers.

---

## 1. Query profiling and index review (EXPLAIN ANALYZE)

Run against the ~5k-student / ~9k-attempt / ~360k-answer dataset described
above, after `ANALYZE;`.

### Grading-time answer read (hot path, runs on every submission)

```sql
SELECT aa.*, eq.marks, eq."negativeMarks", eq."correctOptionSnapshot", eq."isCancelled"
FROM "AttemptAnswer" aa JOIN "ExamQuestion" eq ON eq.id = aa."examQuestionId"
WHERE aa."attemptId" = '...'
```
**0.27ms.** Uses the existing `AttemptAnswer_attemptId_examQuestionId_key`
index via a bitmap scan. Not a bottleneck — no change needed.

### Exam-specific leaderboard (one exam, 3,081 attempts)

Full query in `lib/leaderboard/engine.ts`'s `getExamLeaderboard`. **~20ms**,
reading from a mix of shared-buffer hits and a handful of disk pages
(`Buffers: shared hit=297 read=152`). Correctly uses
`ExamAttempt_examId_status_idx` as a bitmap index scan for the per-exam
filter; the `ExamResult`/`User` table scans are full-table but both tables
are small relative to the whole platform and Postgres's cost estimate
correctly judged a seq scan cheaper than an index scan at this selectivity.
**No missing index found here.**

### Global leaderboard (9,042 attempts, 5,000 users, 3 exams — no per-exam filter)

**~38ms**, entirely from buffer cache (`Buffers: shared hit=591`, zero disk
reads). Full `Seq Scan` on `ExamAttempt`, `ExamResult`, and `User` — and this
is the *correct* plan, not a missing-index problem: a global, all-students,
all-exams leaderboard inherently has no narrowing predicate to index around
(most rows legitimately qualify). This query's cost scales with the total
number of completed+published attempts on the whole platform, not with any
one exam's size. **This is exactly the shape of query the existing Redis
cache (built in Phase 5, 30s TTL + explicit invalidation on
grade/regrade/publish/disqualify) was the right tool for** — caching, not
indexing, is the correct mitigation for an aggregate that must touch most of
the table. Scaling: if this 38ms is linear in row count (plausible given the
plan, not independently verified at a second scale point in this pass),
roughly 100k platform-wide completed attempts would cost on the order of
400ms per cache-miss computation — still acceptable for a 30s-TTL cache.

**Conclusion:** indexes already match the query patterns the app actually
issues. No index was added or removed in this phase.

---

## 2. Connection-pool exhaustion — demonstrated, then fixed

`lib/db.ts` wraps `@prisma/adapter-pg`'s `PrismaPg`, which wraps a plain
`pg.Pool`. Before this phase, the pool was constructed from a bare connection
string, which means node-postgres's own defaults applied silently:
**`max: 10`, `connectionTimeoutMillis: undefined`** (undefined means *wait
forever* for a free connection — there is no timeout).

### Demonstration 1 — a saturated pool hangs forever, silently

A standalone probe: 3 pooled connections held busy for 8s each, then a 4th
request made against the same pool.

| Config | Result |
|---|---|
| `connectionTimeoutMillis` unset (the old default) | Acquired a connection after **7,825ms** — no error, no signal anything was wrong, just a long wait |
| `connectionTimeoutMillis: 2000` | **Failed in 2,002ms** with a clear, catchable "timeout exceeded" error |

This is the core finding: under genuine overload, the old configuration
turns "the system is busy" into an indefinitely hanging request — the worst
possible failure mode for both UX (a spinner with no end) and upstream
infrastructure (a reverse proxy may kill the request after its own timeout
while Postgres is still queuing it).

### Demonstration 2 — a realistic-shaped burst stays fast; a pathological one doesn't

`lib/perf/exam-concurrency.loadtest.ts`, against the ~9k-attempt seeded
dataset, **with the fix applied** (`DB_POOL_MAX=20`,
`DB_POOL_CONNECTION_TIMEOUT_MS=5000`, both now the defaults in `lib/db.ts`):

| Scenario | n | p50 | p95 | p99 | errors |
|---|---|---|---|---|---|
| 60 students starting the same exam at once | 60 | 758ms | 959ms | 965ms | 0 |
| 50 simultaneous final submissions ("deadline storm") | 50 | 586ms | 611ms | 611ms | 0, exactly 1 result per attempt |
| 40 concurrent leaderboard page reads (cold cache) | 40 | 300ms | 390ms | 393ms | 0 |
| 1,500 autosaves **at the exact same instant** (50 students × 30 questions, all in one `Promise.all`) | 1,500 | successes: 6.0s / shed: 5.6s | — | — | 37-60% shed by the pool timeout (varies run to run) |

The first three rows are realistic-shaped concurrency (a cohort starting
together, a deadline submission rush, a popular leaderboard page) and all
stay comfortably sub-second with zero errors. The fourth row is a
**deliberately pathological synthetic stress test** — not how autosave
actually behaves (a student answers one question at a time, naturally spread
over the exam's duration) — constructed specifically to find the pool's
breaking point. At that breaking point, the pool now does the right thing:
it sheds load fast (failures land within ~5.4-5.8s, close to the configured
5s timeout, not open-ended) instead of hanging everyone for 10+ seconds. **No
answer was lost**: the existing client-side autosave hook
(`lib/attempts/use-attempt-sync.ts`, built in Phase 3) already catches any
thrown error from `saveAnswerAction` and retries after 4s, with the answer
durably queued in IndexedDB the entire time. The fail-fast pool timeout and
the pre-existing retry logic compose correctly — confirmed by inspection and
by the load test tolerating the shed failures without data loss.

### The fix

`lib/db.ts`:
```ts
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX ?? 20),
  connectionTimeoutMillis: Number(process.env.DB_POOL_CONNECTION_TIMEOUT_MS ?? 5000),
})
```

**Why 20, not the faster 50 or 95 also measured:** Postgres's own
`max_connections` (100, unconfigured default) is shared across *every*
process that connects — not just this one. A production deployment running
multiple Next.js instances behind a load balancer must keep
`instances × DB_POOL_MAX` comfortably under that ceiling, with headroom for
migrations, admin tools, and Postgres's own reserved superuser connections.
20 is a deliberately moderate default that leaves room for ~4-5 instances
before approaching the ceiling; it is tunable per-deployment via
`DB_POOL_MAX`, and the actual right value depends on how many instances a
real deployment runs and how big `max_connections`/the host's RAM is
configured to be — information this audit doesn't have for an undetermined
production target.

**Why 5000ms, not longer:** long enough that every *realistic* burst
measured above (rows 1-3 in the table) never comes close to it; short enough
that a genuinely overloaded system fails in single-digit seconds instead of
indefinitely.

---

## 3. Grading-transaction profiling — the real "N+1," found and fixed

Profiled `finalizeAndGradeAttempt`'s transaction step-by-step, single
uncontended call, 30-question exam:

| Step | Before | After |
|---|---|---|
| status transition | 23ms | 24ms |
| `computeGrade` | 36ms | 40ms |
| `examResult.create` | 6ms | 10ms |
| `gradingAuditLog.create` | 7ms | 7ms |
| `recordAttemptProgress` (30 questions) | **93ms** | **26ms** |
| `awardXP` | 5ms | 3ms |
| `priorResultCount` | 20ms | 7ms |
| `evaluateBadgesAfterExamCompletion` | 20ms | 10ms |
| **Total** | **~210ms** | **~128ms (-39%)** |

`recordAttemptProgress` was issuing one `upsert()` *per answered question* —
30 sequential round-trips for a 30-question exam, by far the single largest
contributor to how long the grading transaction holds a pooled connection.
Rewritten (`lib/learning/progress.ts`) as one batched
`INSERT ... ON CONFLICT DO UPDATE` built from a multi-row `VALUES` list via
`Prisma.sql`/`Prisma.join`, with explicit type casts on every value (Postgres
can't infer column types for bind parameters inside a bare `VALUES` list,
which surfaced as a `42804` type-mismatch error during verification and was
fixed by adding `::text`/`::int`/`::boolean`/`::timestamp` casts per value).
Confirmed behaviorally identical via the full existing grading/progress test
suite (17 tests, all passing) before and after.

**This directly answers the "move non-critical work to background jobs"
task.** The evidence pointed somewhere more useful than a job queue: the
apparent cost wasn't "this work doesn't belong on the critical path," it was
a plain N+1 query inefficiency. Fixing the query shape got 3.5x the
improvement a deferral would have, with **no new infrastructure, no new
failure mode, and no loss of atomicity** (today, a result/progress/XP/badge
update for one attempt either all commit together or none do). What remains
synchronous in the transaction (XP award, badge evaluation, a count query —
~20ms combined, after the fix) is small enough that extracting it to a
background job was evaluated and rejected: the latency win would be minor,
and deferring it introduces a real correctness risk (a process killed
between "response sent" and "deferred job ran" would silently lose a
student's XP/badge/mistake-notebook update — acceptable for cosmetic
gamification, but not clearly worth it given how little time is actually at
stake post-fix). **No queue or additional Redis usage was added here,
consistent with the instruction not to add one without a demonstrated need.**

---

## 4. Autosave write-volume reduction

Two independent findings on the same hot path (`saveAnswerAction`, called on
every answer selection/change):

**4a. Unconditional session-token write.** Every autosave call wrote
`ExamAttempt.activeSessionToken`/`activeSessionTokenAt` unconditionally, even
when the token hadn't changed since the previous call — the overwhelmingly
common case. Fixed in `lib/anti-cheat/engine.ts` with
`shouldWriteSessionToken()`: skips the write when the token is unchanged
*and* the stored timestamp is already fresher than
`SESSION_TOKEN_REFRESH_INTERVAL_MS` (5s — kept safely under the 30s
`SESSION_CONFLICT_WINDOW_MS` so session-conflict detection accuracy is
unaffected; verified with dedicated unit tests). **Measured honestly:** this
helps the realistic case (sequential, spread-out autosaves from one tab) but
does *not* meaningfully reduce the pathological 1,500-at-once burst in
section 2's table, because every one of those calls reads the pre-burst
state before any of them has written anything — there's no prior write for
any of them to observe yet. Said plainly in code comments so a future reader
doesn't assume more from this fix than it delivers.

**4b. No client-side debounce.** `lib/attempts/use-attempt-sync.ts` fired an
immediate network save on every single answer-selection change — a student
clicking through options while deciding generated one DB write per click,
not one for the answer they settled on. Fixed with a 600ms debounce
(`AUTOSAVE_DEBOUNCE_MS`) applied **only to the network call** — the IndexedDB
write and the local UI state update are still immediate, so the "never lose
an answer on reload" guarantee is untouched.

**Correctness fix required alongside 4b:** debouncing the network save
creates a real race with Submit — a student could change an answer and click
Submit within the 600ms window, and grading reads whatever is currently
stored server-side. Added `flushPending()` to the hook, which cancels any
pending debounce timers and awaits their saves immediately; wired into
`ExamAttemptClient`'s submit handler *before* `submitAttemptAction` is
called. Without this, the debounce would have been a silent, hard-to-notice
scoring bug under exactly the condition exams create the most (answering
right up to the deadline).

---

## 5. Database outage recovery

Tested by actually stopping and restarting the Postgres container under
live traffic (`docker stop`/`docker start` on `mcq-platform-postgres-1`),
not simulated.

**First measurement attempt was wrong, and the correction matters.** An
initial fixed-interval probe (checking every 2s, inferring elapsed time from
loop position) suggested a ~16-18s recovery window after Postgres came back
— which would have been a real problem. Re-measured with actual wall-clock
timestamps on every check and found the true number: **the app's global
Prisma client successfully serves a request again within ~1-2 seconds of
Postgres becoming reachable**, no process restart needed. The first
measurement's error was in the test's own timing assumptions, not a real
behavior — worth stating plainly rather than quietly using the wrong number,
given this document's whole premise is not overclaiming.

Also verified, separately: raw TCP reachability on port 5432 returns in
under 10ms after `docker start` (ruling out Docker networking as a source of
delay), and Postgres's own log shows it accepting connections essentially
immediately on a clean restart.

**A related finding, more important than the recovery-time number:** a bare,
unguarded `pg.Pool` (no `.on('error', ...)` handler attached) **crashes the
entire Node process** when Postgres terminates an idle connection — a
well-documented node-postgres pitfall, reproduced directly in this audit.
Checked whether the app's actual production path is vulnerable:
`@prisma/adapter-pg`'s source (`node_modules/@prisma/adapter-pg/dist/index.js`)
registers exactly this handler (`client.on("error", onIdleClientError)`), so
`lib/db.ts`'s real `prisma` singleton is **not** vulnerable to this crash —
confirmed by the fact that the real recovery test above never required
restarting the Node process at all. No code change was needed here; this is
a verification, not a fix, and is recorded because "is the app's actual
client library safe from this" is exactly the kind of thing that's easy to
assume rather than check.

**Added:** `GET /api/health` (`app/api/health/route.ts`) — an unauthenticated
liveness/readiness check (one `SELECT 1`, plus a Redis ping if Redis is
configured) returning 200/`ok` or 503/`degraded`. Directly motivated by this
investigation: the failure mode measured here (brief, self-healing outage)
is invisible from outside the app without something to poll. A deployment's
load balancer, orchestrator, or uptime monitor can use this to route around
or alert on exactly the condition demonstrated above.

---

## 6. Caching and invalidation — evaluated, stampede fixed

The existing Redis leaderboard cache (Phase 5: 30s TTL, explicit
invalidation on grade/regrade/publish/disqualify, a per-scope key-index set
for targeted invalidation) was reviewed against the query-cost findings in
section 1 and judged structurally correct: it's the right mitigation
specifically for the global leaderboard's unavoidable full-aggregation
shape.

**Found and fixed: a cache-stampede pattern.** The original 40-way
concurrent leaderboard-read measurement (p50≈270-420ms across runs) was
roughly 10x the ~20-40ms a single uncontended query costs per section 1 —
because on a cold cache (right after invalidation, or simply the first
read), every concurrent request independently recomputed and re-cached the
same page instead of the first one computing it and the rest waiting for
that result.

**Fix:** `lib/leaderboard/cache.ts` gained a short-lived, advisory
compute lock (`acquireComputeLock`/`releaseComputeLock`, a `SET key val NX
PX 3000` with a compare-and-delete Lua script for release — never a blind
delete, so releasing late can't clobber a different request's legitimately
re-acquired lock) and a bounded wait (`waitForCachedPage`, 2s timeout,
50ms poll). `getOrComputeCachedPage` composes all of this into the one
read-through pattern both `getExamLeaderboard` and `getGlobalLeaderboard`
now use: cache hit → return; cache miss → try to acquire the lock; winner
computes and caches; everyone else polls briefly for the winner's result,
falling back to computing it themselves only if that wait times out — so a
slow or crashed computer can never make anyone hang indefinitely. The whole
mechanism no-ops identically to before when `REDIS_URL` isn't set.

**Measured improvement**, same 40-way concurrent-read scenario, re-seeded
dataset, cold cache (verified via a fresh exam the first run, and via an
explicit `FLUSHALL` the second, to rule out a fluke):

| | Before | After (2 runs) |
|---|---|---|
| p50 | ~270-420ms | **118ms / 117ms** |
| p95 | ~390-510ms | **119ms / 117ms** |
| p99 | ~393-518ms | **119ms / 119ms** |

The tight, consistent p50-p99 spread after the fix (as opposed to the wider
range measured before) is itself evidence the stampede is gone: before, some
requests "won" the race to compute while others redundantly recomputed,
producing more variance; now nearly all of them wait for one winner.
Verified correct (not just fast) with 9 new tests in
`lib/leaderboard/cache.integration.test.ts` covering lock acquisition,
release, the wrong-token-can't-steal-the-lock case, the wait-and-fall-back
behavior, and that `getOrComputeCachedPage` computes far fewer than N times
under N-way concurrent contention while every caller still gets the correct
result — plus the existing 19 leaderboard-engine/cache tests continue to
pass unchanged, confirming the ranking logic itself wasn't touched.

**No new caching layer was added, and Redis was not newly introduced** — it
was already in the stack for this exact purpose; this phase used it more
effectively, consistent with not adding infrastructure beyond a demonstrated
need.

---

## 7. Rate limits and backpressure — what exists now

1. **Connection-pool timeout (new, section 2)** — the primary backpressure
   mechanism: an overloaded system now fails fast and visibly instead of
   hanging silently.
2. **Autosave debounce (new, section 4b)** — reduces request volume at the
   source for the single highest-frequency action in the app.
3. **Client-side retry + IndexedDB durability (pre-existing, Phase 3)** —
   verified (not built in this phase) to compose correctly with the new
   fail-fast pool behavior: a shed/failed autosave is retried after 4s with
   no data loss.
4. **Anti-cheat rate counter on save/report actions (pre-existing, Phase 6,
   Redis-backed)** — this is a *detection* mechanism (flags a
   `SUSPICIOUS_REQUEST_PATTERN` violation event for review), not
   backpressure — it never rejects or throttles the request itself. Noted
   here for completeness, not changed: that was a deliberate Phase 6 design
   choice (anti-cheat signal, not a capacity control) and conflating the two
   purposes wasn't in scope for this audit.

---

## 8. Capacity limits and scaling bottlenecks

Stated plainly, per the instruction not to claim a specific concurrent-user
number without reproducible evidence at the scale being claimed:

**What this audit reproducibly showed, on one shared dev machine with a
default-configured Postgres:** realistic-shaped concurrent traffic —
students starting an exam together, a wave of final submissions at a
deadline, concurrent leaderboard reads — completes at the server-action +
database layer in well under one second (p99 under ~1s in every realistic
scenario measured). The system's actual breaking point, on this machine, is
a deliberately pathological pattern (hundreds to low thousands of writes
landing in the same literal instant), not realistic sustained load.

**What this audit did not establish:** a maximum concurrent-user count, full
end-to-end HTTP/browser latency, behavior under sustained (not single-burst)
load over minutes or hours, behavior on production-grade hardware, or
behavior with multiple app instances behind a real load balancer. Any of
these would need their own reproducible test before being claimed.

**Structural bottlenecks identified (portable beyond this one machine):**

1. **The connection pool is a single, finite, shared resource per app
   instance.** Its size must be chosen relative to Postgres's
   `max_connections` and the number of app instances that will run — this is
   now a documented, tunable arithmetic (`lib/db.ts`), not an unconsidered
   default.
2. **The global leaderboard query is inherently O(total completed attempts)
   platform-wide**, not per-exam — no index changes that, only caching
   (already in place) or, if the platform's history grows far beyond what
   this audit tested, a periodically-refreshed materialized summary.
3. **Postgres itself is running unconfigured** (`shared_buffers=128MB` is the
   image's bare default, sized for nothing in particular). A real deployment
   should size `shared_buffers`/`work_mem`/`max_connections` against its
   actual host's RAM and expected concurrency — not attempted in this pass,
   since the production host's specs aren't yet known for this project.
4. **A perfectly-synchronized mass-write burst** (the one pattern that did
   exceed this configuration's 5-second budget) is the one scenario where,
   if it ever becomes a real operational concern (e.g., an extremely large
   simultaneous cohort all hitting "save" because of some external, synced
   signal), the appropriate next step is client-side jitter on autosave
   timing — not more server-side infrastructure.

None of the above required, or now uses, a queue. Redis usage was not
expanded beyond its existing, already-justified role (leaderboard caching).

---

## 9. Postgres configuration for a small (1-2GB RAM) deployment target

Section 8 flagged that Postgres was running on the `postgres:17-alpine`
image's bare, unconfigured defaults — sized for nothing in particular. Once
the actual target was specified (a small host, 1-2GB RAM, running Postgres,
Redis, and the Next.js app together), `docker-compose.yml` was given an
explicit, reasoned configuration instead of relying on defaults that happen
to coincidentally fit or not.

**Method, and its honest limit:** the sizing below follows standard,
well-established Postgres tuning heuristics for an OLTP "web application"
workload under a memory budget (the same reasoning tools like PGTune encode)
— it is derived, not measured, for the memory-sizing choices, because this
sandboxed dev environment has 18GB of host RAM and there is no way to
honestly simulate "the whole host only has 1-2GB" here. What *was* measured
directly, and is reported as such below: that Postgres actually starts and
runs correctly under a hard, Docker-enforced cgroup memory cap matching the
target (not just configured to a value and hoped), that the full regular
test suite (225 tests) passes unchanged against it, that specific planner
settings produce the expected, observable change in query plans, and —
importantly — a configuration choice that looked reasonable on paper but
measurably hurt a real workload, caught before being left in place.

### What changed, and why

`mem_limit: 512m` on the Postgres container and `128m` on Redis are the
actual safety net: a hard cap Docker enforces via cgroups regardless of how
much RAM other processes on the host consume. Verified by recreating both
containers with `docker compose up -d` and confirming `docker inspect`
reports the limits applied (536870912 / 134217728 bytes) and both report
`healthy`.

Inside that 512MB budget, sized for "web application" OLTP (many small, fast
transactions — this app's actual shape) at `max_connections=40`:

| Setting | Value | Reasoning |
|---|---|---|
| `shared_buffers` | 128MB | ~25% of the 512MB cap — standard OLTP guidance; this happens to match the image's own default value, so no change in behavior here, just made deliberate instead of incidental |
| `effective_cache_size` | 384MB | ~75% of the cap; a planner-only hint about total available cache (not actually allocated) — was previously Postgres's default of 4GB, wildly oversized for a 512MB container and liable to mislead the planner into assuming cache hits that can't happen |
| `work_mem` | 4MB | Conservative per-sort/hash allocation; with up to `max_connections` operations potentially running concurrent sorts, this needs to stay small on a memory-constrained host — matches Postgres's own default, made explicit |
| `maintenance_work_mem` | 32MB | Used by VACUUM/index builds, infrequent and not concurrent across many connections, so a larger allowance than `work_mem` is safe |
| `max_connections` | 40 | The app's own pool (`DB_POOL_MAX`, default 20 — section 2) needs roughly half of this for one instance, leaving 2x headroom for migrations/admin tools/future scaling, while reserving less per-possible-connection memory overhead than Postgres's own default of 100 |
| `random_page_cost` | 1.1 | Assumes SSD storage (true of virtually every modern small VPS) instead of the spinning-disk-era default of 4 — **directly verified** below to change a real query plan |
| `effective_io_concurrency` | 200 | Same SSD assumption, lets the planner issue more concurrent prefetch reads |
| `wal_buffers` | 16MB | Small, standard value; not memory-constrained at this scale |
| `min_wal_size` / `max_wal_size` | 80MB / 1GB | See the correction below — this is the *final*, corrected value |
| `checkpoint_completion_target` | 0.9 | Standard: spreads checkpoint I/O over most of the checkpoint interval instead of bursting it |

Redis: `maxmemory 96mb` with `maxmemory-policy allkeys-lru`. Every value Redis
holds here is a disposable, safely-recomputable cached leaderboard page (see
section 6) — capping memory and evicting the least-recently-used key under
pressure is strictly safe, never a correctness risk, and protects a small
host from an OOM over cache data that was never required to persist.

### Verified: the SSD planner hint actually changes a query plan

Re-ran the exam-leaderboard EXPLAIN ANALYZE from section 1 (same query
shape, a freshly reseeded ~9k-attempt dataset) against the tuned
configuration. The per-exam attempt filter now uses a plain **Index Scan**
on `ExamAttempt_examId_status_idx`, where the untuned configuration (section
1, `random_page_cost` at its default of 4) used a **Bitmap Heap Scan +
Bitmap Index Scan** for the identical filter. This is the expected,
textbook effect of lowering `random_page_cost` for SSD storage — the planner
now correctly judges a direct index scan cheaper than a bitmap scan for this
selectivity. Total execution time was unchanged within this machine's normal
run-to-run noise (29.8ms vs. ~20ms), as expected — the plan shape changed,
not the underlying data volume.

### Found and corrected: `max_wal_size` was the wrong place to save disk space

An initial pass set `max_wal_size=256MB` (down from Postgres's default 1GB)
specifically to reduce disk footprint on a small host. Re-running the 50-way
concurrent-submission-storm load test (section 2) against it found p50
submission latency had **more than doubled: 552.7ms → 1,034.5ms** (p99
573.0ms → 1,067.7ms), consistently across repeated runs — smaller
`max_wal_size` forces Postgres to checkpoint far more often, and more
frequent checkpoints mean more periodic write-amplification exactly when a
burst of grading transactions is trying to commit.

**Isolated, not assumed:** reverted only `max_wal_size` to 1GB (keeping the
512MB memory cap and every other setting unchanged) and re-ran the identical
test — p50 returned to 552.7ms, matching the pre-tuning baseline exactly.
This conclusively identifies `max_wal_size`, not the memory cap itself, as
the cause. **Corrected to 1GB in the shipped configuration.** The lesson
generalizes: disk space is cheap on virtually every small host; trading
submission latency during an exam deadline rush — one of the most
user-visible moments this whole audit exists to protect — for a few hundred
MB of disk was the wrong tradeoff, and it would have been easy to ship
without ever measuring it.

### What this does, and doesn't, establish

Demonstrated: Postgres functions correctly, passes the full test suite, and
exhibits the expected planner behavior under a real, enforced 512MB memory
cap. Not demonstrated: full end-to-end behavior with the Next.js app and
Redis *also* genuinely confined to a shared 1-2GB host total (this sandbox's
Node/tsx/Vitest tooling itself runs on the host's full 18GB throughout this
investigation) — that would need testing on the actual target host before
going live, the same caveat as every other number in this document.
