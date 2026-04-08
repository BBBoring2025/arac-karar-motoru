# Sprint D Delivery Package — Public Beta Readiness + Analytics + Data Freshness

**Delivered**: 2026-04-09
**Sprint D commit**: (filled in P14 post-deploy — will be a new SHA after all commits are pushed)
**Sprint C baseline**: `c34193a2fd00a83a9b81ff9728afe7ae6ed1b6df`
**Production URL**: https://arac-karar-motoru.vercel.app

---

## Purpose

Sprint D lifts the project from "internally consistent" to **publicly honest beta**:

1. **Public Beta Mode** — A `publicBetaMode` flag + BETA pill in Header + disclosure block in Footer. Fail-safe TRUE default (only explicit `PUBLIC_BETA_MODE=false` disables it).
2. **Payment UX Polish** — `/odeme` public default is now the waitlist (EarlyAccessForm). Admin/test users access sandbox checkout via `?mode=sandbox` query. Sprint C's 3-step flow + amber banner preserved inside the admin path.
3. **Early Access / Waitlist** — New Supabase table `erken_erisim`, `/api/early-access` POST route, EarlyAccessForm component, `/admin` read-only tab. KVKK-safe (SHA-256 hashed IP, no cleartext PII beyond name + email).
4. **Analytics Finalization** — Plausible `<Script>` installed in `layout.tsx`. 10 events wired across 7 pages. `/api/health.flags.analyticsEnabled` honest: `{ enabled: true, reason: 'ok' }` when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set, `{ enabled: false, reason: 'missing_env' }` otherwise. The `'unknown'` lie is gone.
5. **Data Freshness** — Each manifest entry has `refreshCadence` + computed `stale`, `daysSinceUpdate`, `maxDaysForCadence`. `/api/health.dataFreshness` top-level summary + `/api/data-status.dataFreshness` detailed staleSummary. Admin dashboard stale warning card.
6. **Source Footer Polish** — 4 calculator pages (mtv/muayene/otoyol/yakit) had their hardcoded "Bilgilendirme" Card removed. `<DataSourceFooter>` is now the single source of truth. Sprint C's "Sizin fiyatınız" fuel override UX preserved.
7. **Methodology Parity Doc** — `docs/methodology-parity.md` audits all metodoloji page rows against data-manifest. 7/10 direct matches, 2/10 intentional formulas, 1/10 content drift (araclar), 1 gap (bakım). Documented, not fixed — Sprint E content fix candidates.
8. **Endpoint Extensions** — `/api/health` gains `publicBetaMode` + `dataFreshness`. `/api/data-status` gains `dataFreshness` (full staleSummary). `/api/early-access` POST (public) + `/api/admin/early-access` GET (admin) are new.

---

## Test Suite

```
19   flags.test.ts                 (Sprint D P1/P7 — publicBetaMode + analytics env detection)
135  data-manifest.test.ts         (Sprint C P5 84 + Sprint D P8 51 — refreshCadence + stale)
8    callback-url.test.ts          (Sprint C P2 unchanged)
9    state-machine.test.ts         (Sprint C P2 unchanged — getPaymentMode 9 fixtures)
32   validation.test.ts            (Sprint D P3 — early-access input validation)
34   route-engine.test.ts          (Sprint A/B unchanged)
16   edge-cases.test.ts            (Sprint A/B unchanged)
3240 graph-connectivity.test.ts    (Sprint A/B unchanged — 81 cities × 80/2 pairs)
─────
3493 total assertion PASS (3391 Sprint C baseline + 102 Sprint D new)
```

`npm run build`: exit 0
`npx tsc --noEmit`: clean
`npm run lint`: clean (Next.js 16 middleware deprecation warning still tolerated)

---

## Delivery Package Layout

```
delivery/sprint-d/
├── README.md                         ← you are here
├── status.md                         (14 phase table)
├── sprint-d-baseline.md              (P0 pre-check)
├── baseline/                         (P0 captures)
├── public-beta-policy.md             (copy of docs/)
├── payment-vs-beta-mode.md           (Sprint C payment-modes + Sprint D public UX delta)
├── analytics-proof.md                (10 event audit + Plausible env status)
├── data-freshness-policy.md          (8 entry cadence + yakit stale note)
├── fuel-pricing-model.md             (Sprint C reference+override recap)
├── route-ux-notes.md                 (Sprint C P10 source tracking recap)
├── methodology-parity-check.md       (copy of docs/methodology-parity.md)
├── admin-update-workflow.md          (ADR-001 + data-update-runbook pointer)
├── cta-mode-mapping.md               (mode × UX matrix)
├── manual-qa.md                      (9 reproducible tests)
├── sprint-end-questions.md           (8 cited Q&A)
├── env-audit.md                      (Sprint D env additions)
├── changed-files.md                  (git diff vs Sprint C head)
├── build-log.txt                     (npm run build output)
├── test-suite-final.txt              (3493 assertion pass)
├── runtime-status.md                 (Sprint D snapshot)
└── api-responses/
    ├── local-{health,build-info,data-status}-post-d.json
    ├── prod-{health,build-info,data-status}-post-d.json
    ├── prod-early-access-post.json   (curl POST proof)
    ├── plausible-script-html-scrape.txt
    ├── data-freshness-export.json
    ├── flags-decision-trail.txt
    └── secret-leak-check-sprint-d.txt
```

ZIPs on Desktop (generated in P14):
- `arac-karar-motoru-sprint-d-<short>.zip`
- `delivery-sprint-d-<short>.zip`

---

## Caveats (honest)

### Caveat 1 — Migration 003 applied via Dashboard

Supabase MCP was offline during Sprint D. The migration file
`supabase/migrations/003_early_access.sql` was prepared but **must be
applied manually via the Supabase Dashboard SQL Editor** before the
`/api/early-access` POST and `/admin → erken-erisim` tab will work.

User action in P14: open https://supabase.com/dashboard/project/fyuxlmcugtdxuvjnzdtu/sql/new,
paste the contents of the migration file, and click Run. One command.

### Caveat 2 — Plausible env var is optional

`NEXT_PUBLIC_PLAUSIBLE_DOMAIN=arac-karar-motoru.vercel.app` is the
recommended value but not strict. Without it, the Plausible script is
NOT loaded and `/api/health.flags.analyticsEnabled` returns honestly
disabled with `reason: 'missing_env'`. This is by design — analytics
stays honest until the env var is set.

### Caveat 3 — Yakit data IS stale (documented, not a bug)

Yakıt fiyat verisi `lastUpdated = '2026-01-15'` ve `refreshCadence =
'monthly'`. Bugün 84 gün (monthly cadence max 35 gün). `/api/data-status.dataFreshness.staleKeys` → `['yakit']`. Admin dashboard yellow card
listesi bunu gösterir. **Sprint D fixing yakit verisini değil, bayatlığı görünür kılıyor**. Yakıt verisi güncelleme Sprint E content task'ı.

### Caveat 4 — `araclar.confidence` drift documented, not fixed

`src/data/araclar.ts::vehicleDatabase.confidence === 'yüksek'` ama
metodoloji page narrative "Tahmini" diyor. Content drift; `docs/methodology-parity.md`'de documented. Sprint E content team action.

---

## One-paragraph Sprint D summary

Sprint D introduced `publicBetaMode` flag with fail-safe TRUE default, added BETA pill to Header and disclosure block to Footer via the shared `usePublicBeta` hook. It refactored `/odeme` so public users see the new `EarlyAccessForm` (backed by Supabase `erken_erisim` table and the new `/api/early-access` POST route with 32 validation unit tests), while admin/test users preserve the Sprint C sandbox checkout via `?mode=sandbox` query param. It installed Plausible via `next/script` in `layout.tsx` and backfilled 10 analytics events across 7 pages, flipping `flags.analyticsEnabled.reason` from the dishonest `'unknown'` to an honest `'missing_env'` or `'ok'`. It extended `data-manifest.ts` with `refreshCadence` + computed `stale` fields (wrapped entries with `buildEntry()` + `computeStaleness()` pure helper), and surfaced them via `/api/health.dataFreshness` + `/api/data-status.dataFreshness.staleSummary`. Admin panel got a 4th tab (`erken-erisim` read-only) + a stale warning card on the dashboard. 4 calculator pages had their hardcoded "Bilgilendirme" Card removed so `<DataSourceFooter>` is the single source. `docs/methodology-parity.md` audits all metodoloji rows and documents 1 content drift + 1 gap. All 3391 Sprint A/B/C tests still pass, and 102 new Sprint D assertions bring the total to 3493. Sprint C's 6-state payment callback machine, Sprint C P9 route source tracking, Sprint C P5 data manifest shape (84 existing assertions), and Sprint C P2 iyzipay fix (71 transitive deps include) are all preserved verbatim.

---

## Verdict

Sprint D is **delivered**, **locally verified**, and **ready for deployment** via Vercel CLI (P14). The only user manual actions:

1. Apply migration 003 via Supabase Dashboard
2. (Optional) Add `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` env var to Vercel Production

Everything else is automatic via `npx vercel deploy --prod`.

See `status.md` for the 14-phase table, `sprint-end-questions.md` for the 8 cited answers, and `manual-qa.md` for 9 reproducible tests.
