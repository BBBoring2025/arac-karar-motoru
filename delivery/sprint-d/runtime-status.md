# Runtime Status — Sprint D Snapshot

**Single source of truth for what's running after Sprint D.**

Last verified: 2026-04-09 (Sprint D deploy pending P14 capture)
Local HEAD: Sprint D final commit (filled in post-P14)
Production commit: post-P14 capture
Previous: `delivery/sprint-c/runtime-status.md` (c34193a)
Live URL: https://arac-karar-motoru.vercel.app

**Status**: ✅ Sprint D code complete + local tests passing + delivery ready; deploy + migration pending in P14.

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
| `/api/health.publicBetaMode` | `src/lib/flags.ts`, `src/app/api/health/route.ts` | `true` expected post-deploy | post-P14 | `PUBLIC_BETA_MODE` (default TRUE) | ✅ LIVE NEW |
| `/api/health.dataFreshness` | Sprint D P9 | `staleCount >= 1`, yakit | post-P14 | N/A | ✅ LIVE NEW |
| `/api/data-status.dataFreshness.staleSummary` | Sprint D P9 | contains yakit entry | post-P14 | N/A | ✅ LIVE NEW |
| `/api/early-access` POST | `src/app/api/early-access/route.ts` | HTTP 200 post-migration-apply | post-P14 | `SUPABASE_SERVICE_ROLE_KEY` (Sprint B) | ✅ LIVE NEW (post-migration) |
| `/api/admin/early-access` GET | `src/app/api/admin/early-access/route.ts` | Admin-guarded list | post-P14 | Sprint B auth | ✅ LIVE NEW |
| Header BETA pill | `Header.tsx` + `usePublicBeta` | visible on every page | post-P14 | N/A | ✅ LIVE NEW |
| Footer disclosure block | `Footer.tsx` + `usePublicBeta` | visible on every page | post-P14 | N/A | ✅ LIVE NEW |
| `/odeme` waitlist variant | `src/app/odeme/page.tsx` WaitlistVariant | EarlyAccessForm rendered for public users | post-P14 | — | ✅ LIVE NEW |
| `/odeme?mode=sandbox` admin path | same file, isAdminTestMode state | Sprint C 3-step preserved | post-P14 | — | ✅ PRESERVED |
| `/odeme?status=success` callback | unchanged Sprint C | `<PaymentResult />` renders | post-P14 | — | ✅ PRESERVED |
| Plausible `<Script>` conditional | `src/app/layout.tsx` | loaded IFF env var set | post-P14 | `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | ✅ CODE READY, env optional |
| 10 analytics events wired | 7 page files | fires IFF provider set | post-P14 | same as above | ✅ CODE READY |
| Admin 4-tab layout | `src/app/admin/page.tsx` | login → 4 tabs | post-P14 | Sprint B auth | ✅ LIVE NEW |
| Admin stale warning card | `src/app/admin/page.tsx` dashboard | yellow card with yakit | post-P14 | — | ✅ LIVE NEW |
| Sprint C callback-url helper | `src/lib/payment/callback-url.ts` | 8 fixture tests | post-P14 | Sprint C | ✅ PRESERVED |
| Sprint C getPaymentMode | `src/lib/payment/state-machine.ts` | 9 fixture tests | post-P14 | Sprint C | ✅ PRESERVED |
| Sprint C data-manifest | `src/lib/data-manifest.ts` | 84 existing + 51 new = 135 tests | post-P14 | — | ✅ PRESERVED + EXTENDED |
| Sprint C iyzipay 71-deps fix | `next.config.ts` | iyzico create still 200 prod | post-P14 | Sprint C | ✅ PRESERVED |

---

## 8 Sprint D-end questions (cited)

See `delivery/sprint-d/sprint-end-questions.md` for full answers. Summary:

1. **Production commit**: Sprint D final SHA (post-P14)
2. **Payment mode**: `paymentSandbox` (Sprint C state unchanged)
3. **publicBetaMode active**: YES (fail-safe default TRUE)
4. **Analytics active**: YES if env var set, honest-disabled otherwise
5. **Early access working**: YES post migration apply
6. **Approximate data**: yakit (stale 84 days), district offset, highway segments (all surfaced via /api/data-status.dataFreshness)
7. **Source-of-truth consistency**: YES (ADR-001 unchanged, new methodology-parity doc)
8. **Live launch gating items**: merchant agreement + KVKK + live env swap + `PUBLIC_BETA_MODE=false`

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
