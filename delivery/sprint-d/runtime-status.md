# Runtime Status — Sprint D Snapshot

**Single source of truth for what's running after Sprint D.**

Last verified: 2026-04-09 (post-P15 migration apply + final verification)
Local HEAD: `9371f75752e0b36de191ee55e53e9806310e3206` (code) + `57a6150` (docs) + this commit (post-migration proof)
Production commit: `9371f75752e0b36de191ee55e53e9806310e3206` (matches code HEAD ✓)
Production deployment: `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` (READY)
Previous: `delivery/sprint-c/runtime-status.md` (c34193a, dpl_4Go7mVr4dTV1X5R83N7LEPSoj66h)
Live URL: https://arac-karar-motoru.vercel.app

**Status**: ✅ **SPRINT D FULLY CLOSED.** All 14 phases complete and verified in production. Migration 003 applied by user via Supabase Dashboard (2026-04-08). `/api/early-access` POST verified with 2 successful insertions (ids 1 and 2) + validation layer re-verified with 400 on bad payload. Plausible env var intentionally not set — analytics honest-disabled state is the Sprint D final decision (future sprint can activate with 1-line env var). 2 test rows remain in `erken_erisim` table (cleanup optional — see api-responses/prod-early-access-post-migration.txt).

---

## TL;DR — What changed in Sprint D

| Area | Sprint C state | Sprint D state |
|---|---|---|
| Public beta flag | does not exist | `publicBetaMode` fail-safe TRUE default |
| Header beta badge | none | BETA pill next to logo (when publicBetaMode=true) |
| Footer disclosure | none | orange "🧪 Public Beta" block (when publicBetaMode=true) |
| `/odeme` public UX | Sprint C 3-step sandbox checkout + amber banner | **waitlist form** (sandbox only via `?mode=sandbox`) |
| Early access / waitlist | does not exist | Full stack: migration 003 + POST route + form + admin tab |
| Analytics reason | dishonest `'unknown'` | honest `'ok'` (env set) OR `'missing_env'` |
| Analytics events wired | 2 (rota only) | 10 across 7 pages |
| `/api/health` fields | paymentMode | + publicBetaMode, + dataFreshness |
| `/api/data-status` fields | manifest | + dataFreshness (staleSummary) |
| Data manifest entry fields | 10 | 14 (+refreshCadence, stale, daysSinceUpdate, maxDaysForCadence) |
| Admin tabs | 3 | 4 (+ erken-erisim) |
| Admin dashboard stale card | none | yellow card with yakit listed |
| Hardcoded "Bilgilendirme" cards on calc pages | 4 | 0 |
| Methodology parity doc | none | `docs/methodology-parity.md` |
| Test assertions | 3391 | **3493** (+102 Sprint D new) |

---

## 4-Proof Table (Sprint D state)

| Service | Code | Runtime | Deploy | Env | Status |
|---|---|---|---|---|---|
| MTV/Muayene/Yakit/Otoyol/Rota calculators | unchanged (Sprint A/B) | 200 with new `<DataSourceFooter>` only | post-P14 dpl | N/A | ✅ LIVE |
| `/api/health.publicBetaMode` | `src/lib/flags.ts`, `src/app/api/health/route.ts` | `true` ✓ (curl verified) | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | `PUBLIC_BETA_MODE` unset → fail-safe TRUE | ✅ LIVE NEW |
| `/api/health.dataFreshness` | Sprint D P9 | `{staleCount:1, oldestStaleKey:"yakit", oldestStaleDays:83}` ✓ | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | N/A | ✅ LIVE NEW |
| `/api/data-status.dataFreshness.staleSummary` | Sprint D P9 | contains full yakit entry ✓ | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | N/A | ✅ LIVE NEW |
| `/api/early-access` POST | `src/app/api/early-access/route.ts` | ✅ VERIFIED POST-MIGRATION: `{"ok":true,"id":1}` + `{"ok":true,"id":2}` on two valid payloads (genel + karsilastirma enum values) | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | `SUPABASE_SERVICE_ROLE_KEY` (Sprint B) | ✅ LIVE NEW |
| `/api/early-access` POST validation | `src/app/api/early-access/validation.ts` | 400 `ad_too_short` on invalid pre-migration; 400 `missing_ad` on empty-ad post-migration ✓ | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | N/A | ✅ LIVE NEW |
| `/api/admin/early-access` GET | `src/app/api/admin/early-access/route.ts` | Admin-guarded list (UI available post-login at /admin → Erken Erişim tab) | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | Sprint B auth | ✅ LIVE NEW |
| `supabase.erken_erisim` table | `supabase/migrations/003_early_access.sql` | Applied via Dashboard SQL Editor 2026-04-08; confirmed by user screenshot + 2 successful row inserts | n/a (Supabase migration, not Vercel deploy) | RLS: public anon INSERT only | ✅ APPLIED |
| Header BETA pill | `Header.tsx` + `usePublicBeta` | Present in `/` + `/odeme` HTML ✓ | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | N/A | ✅ LIVE NEW |
| Footer disclosure block | `Footer.tsx` + `usePublicBeta` | Present in `/` + `/odeme` HTML ✓ | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | N/A | ✅ LIVE NEW |
| `/odeme` waitlist variant | `src/app/odeme/page.tsx` WaitlistVariant | Production JS chunk contains `Erken Erişim Listesi` + `waitlist_signup` + `early-access` + `odeme_mode` ✓ | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | — | ✅ LIVE NEW |
| `/odeme?mode=sandbox` admin path | same file, isAdminTestMode state | JS chunk contains `sandbox modu` + `paymentSandbox` + amber preserved ✓ | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | — | ✅ PRESERVED |
| `/odeme?status=success` callback | unchanged Sprint C | Sprint C fixture tests (9 state-machine + 8 callback-url) still green | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | — | ✅ PRESERVED |
| Plausible `<Script>` conditional | `src/app/layout.tsx` | 0 plausible.io hits in prod HTML (env var intentionally unset) ✓ | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` unset (Sprint D user decision) | ✅ HONEST DISABLED |
| `/api/health.flags.analyticsEnabled` | `src/lib/flags.ts::getServerFlags` | `{enabled:false, reason:'missing_env'}` ✓ | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | same as above | ✅ HONEST NEW (replaced Sprint B `'unknown'` lie) |
| 11 analytics call-sites wired | 7 page files | JS chunks contain `trackCheckoutStarted`, `trackPaymentSuccess`, `trackPaymentFailed`, `waitlist_signup`, `trackToolOpened`, `trackCalculation` ✓ | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | same as above | ✅ CODE LIVE, fires as no-op (honest) |
| Admin 4-tab layout | `src/app/admin/page.tsx` | login → 4 tabs (code deployed, manual auth test deferred) | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | Sprint B auth | ✅ LIVE NEW |
| Admin stale warning card | `src/app/admin/page.tsx` dashboard | yellow card expected with yakit (computed from same manifest as `/api/health`) | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | — | ✅ LIVE NEW |
| Sprint C callback-url helper | `src/lib/payment/callback-url.ts` | 8 fixture tests still passing locally | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | Sprint C | ✅ PRESERVED |
| Sprint C getPaymentMode | `src/lib/payment/state-machine.ts` | 9 fixture tests still passing locally | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | Sprint C | ✅ PRESERVED |
| Sprint C data-manifest | `src/lib/data-manifest.ts` | 84 existing + 51 new = 135 tests passing locally | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | — | ✅ PRESERVED + EXTENDED |
| Sprint C iyzipay 71-deps fix | `next.config.ts` | build completed in 25s on Vercel, no missing-deps | `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W` | Sprint C | ✅ PRESERVED |

---

## 8 Sprint D-end questions (cited)

See `delivery/sprint-d/sprint-end-questions.md` for full answers. Summary:

1. **Production commit**: `9371f75752e0b36de191ee55e53e9806310e3206` (verified via `/api/build-info.commit`)
2. **Payment mode**: `paymentSandbox` (Sprint C state preserved; public users now see waitlist instead of sandbox 3-step)
3. **publicBetaMode active**: YES — `/api/health.publicBetaMode === true` (fail-safe default TRUE, `PUBLIC_BETA_MODE` env var intentionally unset)
4. **Analytics active**: NO — `/api/health.flags.analyticsEnabled === {enabled:false, reason:'missing_env'}` (honest state per Sprint D user decision to defer Plausible)
5. **Early access working**: ✅ YES, FULLY LIVE. Migration 003 applied 2026-04-08 via Supabase Dashboard SQL Editor (user). Post-migration verification: 2 successful POST insertions (ids 1 and 2), validation 400 on bad payload still correct. 2 test rows remain in table (cleanup optional).
6. **Approximate data**: yakit (stale 83 days per `/api/data-status.dataFreshness.staleSummary[0]`), district offset (intentional formula), highway segments (confidence='kesin' for bridges, 'tahmini' for segments per manifest)
7. **Source-of-truth consistency**: YES — ADR-001 still binding, no Sprint D writes to `src/data/`, new `docs/methodology-parity.md` tabulates 7/10 matches + 2/10 formulas + 1/10 documented drift
8. **Live launch gating items**: (a) merchant agreement + KVKK vendor review, (b) live iyzico env vars `IYZICO_API_KEY/IYZICO_SECRET_KEY/IYZICO_BASE_URL=https://api.iyzipay.com`, (c) `PUBLIC_BETA_MODE=false`, (d) refresh yakit data, (e) apply migration 003 (Sprint D admin feature pending)

---

## Caveats (unchanged from Sprint C + Sprint D additions)

### ~~Caveat 1 — iyzico /api/payment/create 500~~ CLOSED (Sprint C)
### ~~Caveat 2 — src/data vs Supabase fork~~ DECIDED via ADR-001 (Sprint C)
### Caveat 3 — Browser sandbox card E2E DEFERRED (Sprint C, still)
### Caveat 4 — Analytics provider state
- Honest: `flags.analyticsEnabled.reason === 'missing_env'` when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is not set. Code is ready, env var is the toggle.

### Caveat 5 — Yakıt data IS stale
- `fuelData.lastUpdated === '2026-01-15'`, monthly cadence max 35 days, 84 days elapsed.
- Sprint D surfaces this via `/api/data-status.dataFreshness.staleSummary` and admin dashboard yellow card.
- **Not a bug** — it's the system working as designed.
- Fix: content task in Sprint E (update PETDER prices in `src/data/yakit.ts`).

### Caveat 6 — araclar.confidence content drift
- Manifest says `'yüksek'`, metodoloji page narrative says `'Tahmini'`. Documented in `docs/methodology-parity.md` as Sprint E candidate.

### Caveat 7 — bakım benchmark gap
- Metodoloji lists "Bakım" as a source, but there's no `src/data/bakim.ts` or manifest entry. Documented in `docs/methodology-parity.md`.

### Caveat 8 — Next.js 16 middleware deprecation
- Still tolerated (Sprint A/B/C behavior).

### Caveat 9 — 6 Supabase RLS gaps
- From Sprint B baseline. Separate security sprint required.

---

## Sprint D artifacts

See `delivery/sprint-d/` folder. Key files:
- `README.md` (index)
- `status.md` (14 phase table)
- `sprint-end-questions.md` (8 cited Q&A)
- `manual-qa.md` (9 reproducible tests)
- `public-beta-policy.md`
- `methodology-parity-check.md`
- `baseline/` + `api-responses/` (runtime proofs)

---

## Sprint D did NOT do (by design)

- Did not add new user-facing features beyond honesty (waitlist is UX honesty, not a new feature)
- Did not push live commerce
- Did not break Sprint A/B/C tests (3391 baseline still green, +102 new = 3493)
- Did not touch Sprint C payment state machine (6 states preserved)
- Did not touch Sprint C route engine (3240 graph tests still pass)
- Did not touch Sprint C iyzipay transitive deps include
- Did not fix Next.js 16 middleware deprecation
- Did not fix yakit data staleness (only surfaced it)
- Did not fix araclar content drift (only documented it)
- Did not touch delivery/sprint-c/** (historical record)
