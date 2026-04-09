# Sprint D — Phase Status Table

| Phase | Name | Status | Evidence |
|---|---|---|---|
| P0 | Baseline Capture | ✅ DONE | `baseline/*.{json,txt}`, `sprint-d-baseline.md`, 3391 assertion pre-sprint baseline captured |
| P1 | publicBetaMode flag + public-beta-policy.md | ✅ DONE | `src/lib/flags.ts` (publicBetaMode added), `docs/public-beta-policy.md`, `src/lib/__tests__/flags.test.ts` (19 assertions pass), `/api/health.publicBetaMode` top-level field |
| P2 | Supabase migration 003_early_access | ✅ APPLIED | `supabase/migrations/003_early_access.sql` written + applied 2026-04-08 via Supabase Dashboard SQL Editor (user manual action, confirmed by screenshot and 2 successful POST insertions post-P15) |
| P3 | /api/early-access route + validation | ✅ DONE | `src/app/api/early-access/route.ts`, `validation.ts` pure function, `validation.test.ts` 32 assertions pass |
| P4 | EarlyAccessForm component | ✅ DONE | `src/components/payment/EarlyAccessForm.tsx` (~220 lines), reuses Input/Button/Select/Card, analytics waitlist_signup event |
| P5 | /odeme waitlist default + ?mode=sandbox | ✅ DONE | `src/app/odeme/page.tsx` WaitlistVariant added, isAdminTestMode state + sessionStorage, Sprint C 3-step preserved in admin path |
| P6 | Header BETA pill + Footer disclosure + usePublicBeta hook | ✅ DONE | `src/lib/hooks/usePublicBeta.ts` (session-cached fetch), Header pill conditional, Footer orange disclosure block |
| P7 | Plausible install + 10-event call-site backfill | ✅ DONE (env var pending user) | `src/app/layout.tsx` next/script conditional, `flags.ts::analyticsEnabled` env detection, 10 events wired across 7 pages (mtv/yakit/otoyol/muayene/rota/home/odeme) |
| P8 | data-manifest refreshCadence + stale + tests | ✅ DONE | `src/lib/data-manifest.ts` (RefreshCadence type, computeStaleness helper, getStaleEntries, 8 entries wrapped with buildEntry). 135 assertions pass (84 Sprint C + 51 Sprint D new). Yakit detected stale (84 days, monthly cadence) |
| P9 | /api/health + /api/data-status dataFreshness | ✅ DONE | Health has top-level dataFreshness summary. data-status has full dataFreshness.staleSummary block |
| P10 | Admin stale card + erken-erisim tab + /api/admin/early-access | ✅ DONE | `src/app/admin/page.tsx` 4 tabs (dashboard/data-manifest/araclar/erken-erisim), yellow stale warning card on dashboard, read-only waitlist table. `src/app/api/admin/early-access/route.ts` with requireAdmin guard |
| P11 | 4 calc page hardcoded Bilgilendirme Card cleanup | ✅ DONE | mtv/muayene/otoyol/yakit all have their hardcoded "Bilgilendirme" Card removed. `<DataSourceFooter>` is single source. Sprint C P11 "Sizin fiyatınız" fuel override UX preserved |
| P12 | Methodology parity doc | ✅ DONE | `docs/methodology-parity.md` (audit: 7/10 direct match, 2/10 intentional formulas, 1/10 content drift, 1 gap — Sprint E candidates) |
| P13 | Manual QA + delivery package | ✅ DONE | This file + sibling delivery docs, ~21 files total |
| P14 | Vercel CLI deploy + 4-proof + ZIPs | ✅ DONE | Commit `9371f75` pushed; `npx vercel deploy --prod --yes` → `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` READY; prod parity MATCH; /api/health + /api/data-status + /api/build-info all verified; /odeme + calc chunks contain Sprint D markers; Desktop ZIPs created + secret leak clean; Plausible env var intentionally deferred (honest-disabled per user decision) |
| P15 | Post-migration verification | ✅ DONE | User applied migration 003 via Supabase Dashboard SQL Editor (screenshot confirmed "Success. No rows returned"). Verification: 2 valid POSTs → `{"ok":true,"id":1}` + `{"ok":true,"id":2}` (genel + karsilastirma enum values); 1 invalid POST → `{"ok":false,"error":"missing_ad"}` 400. `/api/early-access` + `/api/admin/early-access` + `erken_erisim` table all FULLY LIVE. 2 test rows remain (cleanup optional). |

---

## Sprint C → Sprint D delta summary

| Metric | Sprint C final | Sprint D final |
|---|---|---|
| Test assertions | 3391 | 3493 (+102) |
| Flags | 5 | 6 (+publicBetaMode) |
| Admin tabs | 3 | 4 (+erken-erisim) |
| API routes | existing | +/api/early-access POST, +/api/admin/early-access GET |
| Supabase tables | 14 | 15 (+erken_erisim) |
| Manifest entry fields | 10 | 14 (+refreshCadence, stale, daysSinceUpdate, maxDaysForCadence) |
| Layout scripts | 1 (JSON-LD) | 2 or 3 (+ conditional Plausible) |
| Hardcoded "Bilgilendirme" Cards on calc pages | 4 | 0 |
| /api/health fields | paymentMode, flags, services | +publicBetaMode, +dataFreshness |
| /api/data-status fields | + Sprint C P12 | +dataFreshness (staleSummary) |
| Methodology-parity doc | none | yes |
| Public beta policy doc | none | yes |
| /odeme public UX | sandbox checkout | waitlist (admin sandbox via ?mode=sandbox) |

---

## External Dependencies Observed in Sprint D

| Tool | State | Sprint D Impact |
|---|---|---|
| Supabase MCP | ❌ Offline | Migration apply deferred to Dashboard manual (scripts/sprint-d-apply-migration*.mjs prepared as fallback) |
| Vercel MCP | ❌ Offline | Same Sprint C workaround: `npx vercel deploy --prod` via CLI |
| Vercel webhook auto-deploy | ⚠️ Not firing | Manual CLI deploy required (Sprint C precedent) |
| Vercel CLI | ✅ `senalpserkan-4123` logged in | Sprint C verified, used again in P14 |
| Chrome MCP | ❌ Offline | Browser QA deferred; API-level proof primary |
| Claude Preview MCP | ✅ Used for local dev | Not required in Sprint D |

---

## Pending after Sprint D (Sprint E candidates)

- **Content drift**: Resolve `araclar.confidence` disagreement (manifest `yüksek` vs metodoloji narrative `Tahmini`)
- **Bakım benchmark gap**: Either add `src/data/bakim.ts` with OYDER data OR remove the bakım row from metodoloji
- **Yakıt data refresh**: Update `src/data/yakit.ts::fuelData.lastUpdated` with fresh PETDER prices (currently 84 days stale)
- **Metodoloji page refactor**: Read from `dataManifest` instead of hardcoded array so drift detection is structural
- **6 Supabase RLS gaps** from Sprint B baseline (`hesaplama_loglari`, `bakim_benchmark`, etc.)
- **Next.js 16 middleware → proxy deprecation**: Dedicated compatibility sprint
- **Live iyzico merchant agreement**: The gating item before `PUBLIC_BETA_MODE=false` can ship
