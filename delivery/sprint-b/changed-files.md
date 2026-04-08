# Changed Files — Sprint B

Two commit waves:

1. **Wave 1 (committed as `0be9b8e`)** — P1–P5 code + local verification
2. **Wave 2 (uncommitted at delivery time)** — P6–P13 runtime verification
   artifacts, docs, delivery package

Run `git log --oneline` to see the commit graph:

```
0be9b8e feat(sprint-b): health endpoints + feature flags + payment state machine
dd408ef docs: Sprint A delivery package — claim audit, build log, screenshots
3c4d723 fix: Production Truth Alignment — gerçek 2026 değerleri + dürüst confidence
...
```

---

## Wave 1 — Committed at `0be9b8e`

### New files

- `src/lib/flags.ts` — centralized feature flags (P1)
- `src/lib/payment/state-machine.ts` — payment state derivation (P3)
- `src/app/api/health/route.ts` — `/api/health` endpoint (P2)
- `src/app/api/build-info/route.ts` — `/api/build-info` endpoint (P2)
- `src/app/api/data-status/route.ts` — `/api/data-status` misalignment-surfacing endpoint (P2)
- `docs/sprint-b-baseline.md` — P0 baseline capture
- `docs/feature-flags.md` — feature-flag architecture (P1/P5)
- `delivery/sprint-b/build-log.txt` — local tsc + lint + build + test suite output (P4)
- `delivery/sprint-b/api-responses/local-health.json` (P4)
- `delivery/sprint-b/api-responses/local-build-info.json` (P4)
- `delivery/sprint-b/api-responses/local-data-status.json` (P4)
- `delivery/sprint-b/api-responses/prod-health-pre-env.json` (P5)
- `delivery/sprint-b/api-responses/prod-build-info-pre-env.json` (P5)
- `delivery/sprint-b/api-responses/prod-data-status-pre-env.json` (P5)
- `delivery/sprint-b/api-responses/secret-leak-check.txt` (P5)

### Modified files

- `src/lib/analytics/tracker.ts` — `isEnabled()` now delegates to `getClientFlags()` (public API unchanged)
- `src/app/odeme/page.tsx` — probe replaced with `/api/health` fetch, state-machine driven
- `.gitignore` — added `dev.sh`, `delivery/**/admin-credentials.md`

---

## Wave 2 — Uncommitted at delivery time (P6–P13)

### New files

#### Docs
- `docs/runtime-status.md` — **rewrite** from Sprint A version (P10). Old version archived.
- `docs/data-source-truth.md` — the critical misalignment deliverable (P9)
- `docs/archive/runtime-status-sprint-a.md` — Sprint A version preserved
- `docs/archive/status-phase-{1,2,3,4}.md` — stale Sprint A phase status docs archived

#### Scripts
- `scripts/sprint-b-admin-seed.mjs` — admin user + CRUD seed script (P6 + P8 Test 3)
- `scripts/sprint-b-crud-prod-sync.mjs` — production sync timeline proof (P8 Test 3)

#### Delivery package
- `delivery/sprint-b/README.md` (P12)
- `delivery/sprint-b/status.md` (P12)
- `delivery/sprint-b/baseline.md` (copy of docs/sprint-b-baseline.md)
- `delivery/sprint-b/build-parity.md` (P8 Test 1)
- `delivery/sprint-b/deploy-parity.md` (P12)
- `delivery/sprint-b/feature-flags.md` (copy of docs/feature-flags.md)
- `delivery/sprint-b/payment-runtime-check.md` (P8 Test 5/6/7)
- `delivery/sprint-b/analytics-runtime-check.md` (P8 Test 8)
- `delivery/sprint-b/data-source-truth.md` (copy of docs/data-source-truth.md)
- `delivery/sprint-b/admin-crud-verification.md` (P8 Test 3)
- `delivery/sprint-b/supabase-runtime-check.md` (P12)
- `delivery/sprint-b/health-checks.md` (P12)
- `delivery/sprint-b/env-audit.md` (P12)
- `delivery/sprint-b/changed-files.md` (this file, P12)
- `delivery/sprint-b/runtime-status.md` (copy of docs/runtime-status.md)
- `delivery/sprint-b/manual-qa.md` (P11)
- `delivery/sprint-b/sprint-end-questions.md` (P13)
- `delivery/sprint-b/admin-credentials.md` (P6, **gitignored**)

#### API responses
- `delivery/sprint-b/api-responses/prod-health-post-env.json` (P8 Test 2)
- `delivery/sprint-b/api-responses/prod-build-info-post-env.json` (P8 Test 1)
- `delivery/sprint-b/api-responses/prod-data-status-post-env.json` (P8 Test 9)
- `delivery/sprint-b/api-responses/secret-leak-check-post-env.txt` (P8 Test 10)
- `delivery/sprint-b/api-responses/admin-crud-run.json` (P8 Test 3)
- `delivery/sprint-b/api-responses/admin-crud-prod-sync.json` (P8 Test 3 timeline)
- `delivery/sprint-b/api-responses/iyzico-create-local.json` (P8 Test 5 local)
- `delivery/sprint-b/api-responses/iyzico-local-vs-prod.txt` (P8 Test 5 comparison)
- `delivery/sprint-b/api-responses/odemeler-after-iyzico-local-test.json`
- `delivery/sprint-b/api-responses/data-status-misalignment-proof.json` (P8 Test 9)
- `delivery/sprint-b/api-responses/analytics-html-scan.txt` (P8 Test 8)

### Modified files

- `docs/runtime-status.md` — full rewrite, 279 insertions vs 143 deletions (diff stat)
- `docs/status-phase-{1,2,3,4}.md` — removed from `docs/` (moved to `docs/archive/`)

---

## Raw `git status --short` at delivery

```
 M docs/runtime-status.md
 D docs/status-phase-1.md
 D docs/status-phase-2.md
 D docs/status-phase-3.md
 D docs/status-phase-4.md
?? delivery/sprint-b/README.md
?? delivery/sprint-b/admin-crud-verification.md
?? delivery/sprint-b/analytics-runtime-check.md
?? delivery/sprint-b/api-responses/admin-crud-prod-sync.json
?? delivery/sprint-b/api-responses/admin-crud-run.json
?? delivery/sprint-b/api-responses/analytics-html-scan.txt
?? delivery/sprint-b/api-responses/data-status-misalignment-proof.json
?? delivery/sprint-b/api-responses/iyzico-create-local.json
?? delivery/sprint-b/api-responses/iyzico-local-vs-prod.txt
?? delivery/sprint-b/api-responses/odemeler-after-iyzico-local-test.json
?? delivery/sprint-b/api-responses/prod-build-info-post-env.json
?? delivery/sprint-b/api-responses/prod-build-info-pre-env.json
?? delivery/sprint-b/api-responses/prod-data-status-post-env.json
?? delivery/sprint-b/api-responses/prod-data-status-pre-env.json
?? delivery/sprint-b/api-responses/prod-health-post-env.json
?? delivery/sprint-b/api-responses/prod-health-pre-env.json
?? delivery/sprint-b/api-responses/secret-leak-check-post-env.txt
?? delivery/sprint-b/baseline.md
?? delivery/sprint-b/build-parity.md
?? delivery/sprint-b/data-source-truth.md
?? delivery/sprint-b/deploy-parity.md
?? delivery/sprint-b/env-audit.md
?? delivery/sprint-b/feature-flags.md
?? delivery/sprint-b/health-checks.md
?? delivery/sprint-b/manual-qa.md
?? delivery/sprint-b/payment-runtime-check.md
?? delivery/sprint-b/runtime-status.md
?? delivery/sprint-b/sprint-end-questions.md
?? delivery/sprint-b/status.md
?? delivery/sprint-b/supabase-runtime-check.md
?? docs/archive/
?? docs/data-source-truth.md
?? scripts/
```

Notes:
- `delivery/sprint-b/admin-credentials.md` is **intentionally missing**
  from this list because it's `.gitignore`d (contains admin email +
  password reference).
- The `docs/status-phase-{1..4}.md` rows appear as **D** (deleted) in
  git status because they were moved to `docs/archive/`. The archived
  copies appear under `?? docs/archive/`.

---

## What does **not** change in Sprint B

- `src/lib/payment/processor.ts`
- `src/lib/payment/config.ts`
- `src/app/api/payment/create/route.ts`
- `src/app/api/payment/callback/route.ts`
- `src/app/api/admin/dashboard/route.ts`
- `src/app/api/admin/tarifeleri/route.ts`
- `src/lib/auth.ts`
- `src/lib/supabase.ts`
- `src/middleware.ts`
- `src/data/**`
- `src/lib/mtv/**`, `src/lib/muayene/**`, `src/lib/route/**`, `src/lib/report/**`
- `next.config.ts`
- `package.json`, `package-lock.json`
- `supabase/migrations/**`

By design. Sprint B was verification-only.
