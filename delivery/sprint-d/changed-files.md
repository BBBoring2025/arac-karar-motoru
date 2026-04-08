# Sprint D — Changed Files

Sprint D commit range: Sprint C final `c34193a` → Sprint D final (post-P14).

## Summary

28 files touched:
- **16 modified** (existing files edited, mostly additive)
- **12 new** (docs, new API routes, new components, new tests, new delivery package)

## Modified files

### Core infrastructure
- `src/lib/flags.ts` — P1 publicBetaMode flag + P7 analytics honest reason
- `src/lib/data-manifest.ts` — P8 refreshCadence + stale + computeStaleness helper

### API endpoints
- `src/app/api/health/route.ts` — P1 publicBetaMode top-level + P9 dataFreshness summary
- `src/app/api/data-status/route.ts` — P9 dataFreshness.staleSummary full block

### /odeme refactor
- `src/app/odeme/page.tsx` — P5 WaitlistVariant + isAdminTestMode routing + P7 analytics events

### Layout
- `src/app/layout.tsx` — P7 Plausible conditional `<Script>`
- `src/components/layout/Header.tsx` — P6 BETA pill
- `src/components/layout/Footer.tsx` — P6 public beta disclosure block

### Admin panel
- `src/app/admin/page.tsx` — P10 4th tab (erken-erisim) + dashboard stale warning card

### Calculator pages
- `src/app/araclar/mtv-hesaplama/page.tsx` — P7 events + P11 "Bilgilendirme" Card removal
- `src/app/araclar/muayene-ucreti/page.tsx` — P7 events + P11 cleanup
- `src/app/araclar/otoyol-hesaplama/page.tsx` — P7 events + P11 cleanup
- `src/app/araclar/yakit-hesaplama/page.tsx` — P7 events + P11 cleanup (Sprint C P11 override UX preserved)
- `src/app/araclar/rota-maliyet/page.tsx` — P7 `trackToolOpened('rota')` added
- `src/app/page.tsx` — P7 `trackPremiumCTA` on homepage hero buttons

### Tests (extended)
- `src/lib/__tests__/data-manifest.test.ts` — P8 51 new assertions (84 existing preserved)

## New files

### Migration
- `supabase/migrations/003_early_access.sql` — P2 erken_erisim table

### API routes
- `src/app/api/early-access/route.ts` — P3 public POST handler
- `src/app/api/early-access/validation.ts` — P3 pure validation helper
- `src/app/api/early-access/__tests__/validation.test.ts` — P3 32 assertion tests
- `src/app/api/admin/early-access/route.ts` — P10 admin GET with requireAdmin guard

### Components
- `src/components/payment/EarlyAccessForm.tsx` — P4 waitlist form (reuses Input/Button/Select/Card)

### Hooks
- `src/lib/hooks/usePublicBeta.ts` — P6 shared hook for Header + Footer

### Tests
- `src/lib/__tests__/flags.test.ts` — P1 19 assertion tests for publicBetaMode + analytics

### Docs
- `docs/public-beta-policy.md` — P1 beta definition + KVKK notes
- `docs/methodology-parity.md` — P12 metodoloji audit
- `docs/sprint-d-baseline.md` — P0 pre-check results

### Scripts (fallbacks)
- `scripts/sprint-d-apply-migration.mjs` — REST-based migration probe (diagnose only)
- `scripts/sprint-d-apply-migration-pg.mjs` — pg-based direct connect fallback (needs SUPABASE_DB_URL)

### Delivery package
- `delivery/sprint-d/` — 22+ files:
  - README.md, status.md, baseline.md, runtime-status.md
  - sprint-end-questions.md, manual-qa.md
  - public-beta-policy.md, methodology-parity-check.md
  - payment-vs-beta-mode.md, cta-mode-mapping.md
  - analytics-proof.md, data-freshness-policy.md
  - fuel-pricing-model.md, route-ux-notes.md
  - admin-update-workflow.md, env-audit.md
  - changed-files.md (this file)
  - build-log.txt, test-suite-final.txt
  - baseline/ (P0 captures)
  - api-responses/ (post-P14)

## Files NOT touched (Sprint A/B/C preserved)

- `src/lib/payment/*` except state-machine.ts reuse (no change to state-machine body)
- `src/lib/route/*` except rota-maliyet page (analytics add only)
- `src/data/*` — all 7 data files preserved (manifest reads, doesn't modify)
- `src/lib/supabase.ts`
- `src/lib/auth.ts`
- `src/middleware.ts` (Next.js 16 deprecation still tolerated)
- `next.config.ts` (Sprint C 71 iyzipay transitive deps fix preserved)
- `src/app/api/payment/{create,callback}/route.ts` (Sprint C unchanged)
- `src/app/api/admin/{dashboard,tarifeleri}/route.ts` (Sprint C unchanged)
- `src/app/metodoloji/page.tsx` (Sprint D P12 only audits, doesn't fix)
- `delivery/sprint-c/**/*` (historical record)
- Sprint B scripts `scripts/sprint-b-*.mjs`
- `docs/adr/0001-src-data-as-source-of-truth.md` (binding)
- Sprint A/B/C tests — all 3391 baseline still green

## Test suite impact

| Suite | Before | After | Delta |
|---|---|---|---|
| `flags.test.ts` | (did not exist) | 19 | +19 NEW |
| `data-manifest.test.ts` | 84 | 135 | +51 |
| `validation.test.ts` | (did not exist) | 32 | +32 NEW |
| `callback-url.test.ts` | 8 | 8 | 0 |
| `state-machine.test.ts` | 9 | 9 | 0 |
| `route-engine.test.ts` | 34 | 34 | 0 |
| `edge-cases.test.ts` | 16 | 16 | 0 |
| `graph-connectivity.test.ts` | 3240 | 3240 | 0 |
| **Total** | **3391** | **3493** | **+102** |
