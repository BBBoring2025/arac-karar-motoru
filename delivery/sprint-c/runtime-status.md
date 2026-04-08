# Runtime Status — Sprint C Snapshot (FINAL)

**Single source of truth for what's running after Sprint C.**

Last verified: 2026-04-08T18:10Z (Sprint C FINAL, caveat closed)
Local commit: `95bcadc8e6770372e483948b74e5446d3aac56c6`
Production commit: **`95bcadc8e6770372e483948b74e5446d3aac56c6`** ✅ PARITY MATCH
Production deployment: `dpl_E9YTfCv4X18i7UsWZb79CpBoBkaR`
Live URL: https://arac-karar-motoru.vercel.app

**Status**: ✅ **Sprint B caveat CLOSED in production.**

**Previous versions**:
- `docs/archive/runtime-status-sprint-a.md` (Sprint A)
- `delivery/sprint-b/runtime-status.md` (Sprint B closure state)

---

## TL;DR — What changed in Sprint C

| Area | Sprint B state | Sprint C state |
|---|---|---|
| iyzico /api/payment/create | 500 in production (caveat) | **Code fix in place** (helper); production verification pending Vercel deploy |
| Payment mode field | implicit (`flags.paymentEnabled` + `services.iyzico.mode`) | **Top-level `paymentMode`** (paymentDisabled/paymentSandbox/paymentLive) |
| Sandbox disclosure UI | nothing | **Amber banner** when `paymentMode === paymentSandbox` |
| Admin tarife edit tabs | visible but had zero user effect | **HIDDEN** (ADR-001) |
| Source-of-truth decision | documented but unbound | **ADR-001 accepted** — `src/data` binding |
| Data update workflow | undocumented | **`docs/data-update-runbook.md`** with 8 sections |
| Public source label on calculator pages | inconsistent (some manual, some missing) | **`<DataSourceFooter>` component** on 5 pages, backed by `src/lib/data-manifest.ts` |
| Route source tracking | not exposed | **4 source dimensions** on `RouteResult` (path/toll/offset/fuel) |
| Per-segment confidence in toll breakdown | not exposed | **per-line badge + sourceUrl link** |
| Fuel reference vs override | unclear UX | **"Sizin fiyatınız" / "Referans (PETDER)"** badges |
| /api/data-status fields | calculationSource + adminCrudTarget + alignmentWarning | **+ activeSource + adrReference + precedence + manifest[]** |

---

## 4-Proof Table (Sprint C state, FINAL post-deploy)

Production deployment: `dpl_E9YTfCv4X18i7UsWZb79CpBoBkaR`
Production commit: `95bcadc`

| Service | Code | Runtime | Deploy | Env | Status |
|---|---|---|---|---|---|
| MTV calculator             | `src/lib/mtv/calculator.ts`              | `/araclar/mtv-hesaplama` returns 200 with DataSourceFooter | `E9YTfCv4` | N/A | ✅ LIVE |
| Muayene calculator         | `src/lib/muayene/calculator.ts`          | `/araclar/muayene-ucreti` returns 200 with footer | `E9YTfCv4` | N/A | ✅ LIVE |
| Yakit calculator + override | `src/app/araclar/yakit-hesaplama/page.tsx` | override badge + reset link live | `E9YTfCv4` | N/A | ✅ LIVE NEW |
| Route engine               | `src/lib/route/route-engine.ts`          | 3240 + 34 + 16 tests pass + source tracking fields populated | `E9YTfCv4` | N/A | ✅ LIVE NEW |
| Report PDF                 | `src/lib/report/*`                       | `/api/rapor/pdf` (not Sprint C tested) | `E9YTfCv4` | N/A | ✅ code ready |
| `/api/health`              | `src/app/api/health/route.ts`            | returns `paymentMode: "paymentSandbox"` in prod | `E9YTfCv4` | Sprint B env set | ✅ LIVE NEW |
| `/api/build-info`          | `src/app/api/build-info/route.ts`        | prod commit === local HEAD (parity proven) | `E9YTfCv4` | Vercel auto | ✅ LIVE |
| `/api/data-status`         | `src/app/api/data-status/route.ts`       | `activeSource` + `adrReference` + `precedence` + 8-entry `manifest[]` in prod | `E9YTfCv4` | Sprint B env set | ✅ LIVE NEW |
| Feature flags              | `src/lib/flags.ts`                       | unchanged from Sprint B | `E9YTfCv4` | All read | ✅ LIVE |
| Payment 6-state machine    | `src/lib/payment/state-machine.ts::derivePaymentState` | unchanged from Sprint B | `E9YTfCv4` | Sprint B env set | ✅ LIVE |
| Payment 3-mode helper      | `src/lib/payment/state-machine.ts::getPaymentMode` | prod: returns `paymentSandbox` | `E9YTfCv4` | derives from flags | ✅ LIVE NEW |
| Callback URL helper        | `src/lib/payment/callback-url.ts`        | 8 fixtures pass, in use by /api/payment/create | `E9YTfCv4` | uses `NEXT_PUBLIC_SITE_URL` / `VERCEL_URL` | ✅ LIVE NEW |
| Supabase admin write       | `createAdminClient()`                    | Sprint B regression script still passes | `E9YTfCv4` | Sprint B P7 env set | ⚠️ DEPRECATED PATH (ADR-001) |
| Admin user `senalpserkan@gmail.com` | seeded in Sprint B P6           | kullanicilar row exists, rol=admin | (state) | Sprint B Auth | ✅ LIVE |
| Admin dashboard `/admin/*` | `src/app/admin/page.tsx` (Sprint C P6 rewrite) | 3 tabs (dashboard / data-manifest / araclar) live in prod | `E9YTfCv4` | Sprint B auth | ✅ LIVE NEW |
| iyzico initialize (`/api/payment/create`) | `src/app/api/payment/create/route.ts` + `next.config.ts` outputFileTracingIncludes | **PROD HTTP 200** (orderId 16, token d65483a8-…, 2885-char checkoutFormContent, isSandbox=true) | `E9YTfCv4` | Sprint B IYZICO_* set | ✅ **LIVE NEW — Sprint B caveat CLOSED** |
| iyzico callback retrieve   | `src/app/api/payment/callback/route.ts`  | unchanged from Sprint B, also benefits from 71-deps include | `E9YTfCv4` | Sprint B env set | ✅ LIVE |
| Analytics                  | `src/lib/analytics/tracker.ts`           | `/api/health.flags.analyticsEnabled.enabled=false`, 0 provider scripts (unchanged) | `E9YTfCv4` | No provider | ⚠️ HONEST INACTIVE |

---

## 8 Sprint C-end questions (cited)

See `delivery/sprint-c/sprint-end-questions.md` for full answers with citations.

1. **Production commit**: `95bcadc` (parity MATCH with local HEAD)
2. **Payment mode**: `paymentSandbox` (verified in prod via `/api/health.paymentMode`)
3. **Sandbox prod working?** YES — HTTP 200, token, 2885-char checkoutFormContent, orderId persisted. 4 deploys to diagnose + fix.
4. **Live payments missing**: merchant agreement + KVKK + live env vars (none in Sprint C)
5. **Source-of-truth**: **`src_data_static_files`** (ADR-001 binding, verified in prod via `/api/data-status.activeSource`)
6. **Approximate areas**: district offset multiplier, highway segment tolls, fuel reference
7. **Shown but not active**: sandbox payment mode (intentional), analytics layer, MTV snapshot accuracy
8. **Steps to live**: Sprint D scope (merchant + legal + env swap + smoke test)

---

## Caveats

### ~~Caveat 1 — Vercel deploy of Sprint C is pending~~ **CLOSED**

Vercel auto-deploy webhook was not firing on new commits. User authorized
manual deploy via `vercel deploy --prod` using the Vercel CLI. 4 deploys
total in Sprint C:

1. Sprint C full wave deploy `dpl_H9442CBxnfjTMHA8msVUExzVBMDU` (`595d7b8`) — exposed actual root cause via vercel logs
2. 1st fix `dpl_AjkQDRxg9En54Q2NYMDBiUTQcuqW` (`b683a2d`) — iyzipay/lib include, exposed deeper error
3. 2nd fix `dpl_E9YTfCv4X18i7UsWZb79CpBoBkaR` (`95bcadc`) — 71 transitive deps include ✅ **FINAL**

### ~~Caveat 2 — iyzico /api/payment/create 500 in production~~ **CLOSED**

**Sprint B's suspicion**: `NEXT_PUBLIC_SITE_URL` missing.
**Actual root cause** (via Vercel runtime logs): iyzipay's
`lib/resources/*.js` + 71 transitive dependencies were missing from the
Vercel lambda bundle because Turbopack's nft (node-file-trace) cannot
follow dynamic `fs.readdirSync` + `require()` chains.

**Fix**: `next.config.ts` → `outputFileTracingIncludes` for
`/api/payment/create` and `/api/payment/callback`, explicitly listing
`iyzipay/**` + `postman-request/**` + 69 other transitive deps.

**Verification** (2026-04-08T18:10Z):
```
POST https://arac-karar-motoru.vercel.app/api/payment/create
→ HTTP 200
→ token: d65483a8-8d70-44dc-8701-21281232e564
→ checkoutFormContent: 2885 chars, isSandbox=true
→ orderId: 16 (persisted to odemeler, cleaned up post-test)
```

Artifact: `delivery/sprint-c/api-responses/payment-create-prod.json`

### Caveat 3 — Browser sandbox card E2E deferred

Per Sprint C user decision, the browser-based sandbox card E2E
(5528790000000008 success + 4111111111111129 fail) was deferred. Chrome
MCP was confirmed offline. The full create flow is API-level proven
locally. Manual browser test instructions in `manual-qa.md` Test 8.

### Caveat 4 — Analytics still inactive (intentional)

Sprint C did not change the analytics state. `src/lib/analytics/tracker.ts`
exists but no provider script is loaded. `/api/health.flags.analyticsEnabled.enabled=false`,
0 provider scripts in production HTML. This is honest, not a regression.

### Caveat 5 — Next.js 16 `middleware → proxy` deprecation warning

Build warning persists. Sprint C did not address it (intentionally out of
scope, defer to dedicated Next.js 16 sprint).

### Caveat 6 — Tarife snapshot accuracy

The runbook (`docs/data-update-runbook.md`) makes updates atomic and
verifiable, but it doesn't audit the snapshot itself against the official
GİB / TÜVTÜRK / KGM PDFs. That's a content-side responsibility tracked
for a separate sprint.

---

## How to flip analytics on (still documented, still not done)

From `docs/feature-flags.md` (Sprint B):

1. Add a provider script to `src/app/layout.tsx`:
   ```tsx
   <Script src="https://plausible.io/js/plausible.js" data-domain="arac-karar-motoru.vercel.app" strategy="afterInteractive" />
   ```
2. Provider populates `window.plausible` (Plausible does)
3. Deploy → client tracker auto-flips
4. Verify via DevTools: `window.plausible` defined

---

## Sprint C artifacts

Under `delivery/sprint-c/`:

```
README.md
status.md
baseline.md
baseline/                       (P0 captures)
runtime-status.md               (this file)
adr-0001-src-data.md            (P1 copy)
payment-modes.md                (P13 copy)
data-update-runbook.md          (P13 copy)
payment-runtime-check.md        (P3 + P4 status)
manual-qa.md                    (P14, 8 tests)
sprint-end-questions.md         (P14, 8 cited answers)
env-audit.md                    (P14)
changed-files.md                (P14)
build-log.txt                   (P14)
test-suite-final.txt            (3391 assertions)
api-responses/
  local-{health,build-info,data-status}-post-p12.json
  payment-create-local.json
  payment-mode-decision-trail.txt
  route-source-tracking-sample.json
  data-manifest-export.json
```

---

## Sprint C verification timeline

- **2026-04-08 morning**: Sprint B verification + delivery (commit 81d44cb)
- **2026-04-08 14:00–17:00**: Sprint C P0–P14 implementation
  - P0: baseline captured
  - P1: ADR-001 written
  - P2: callback-url + getPaymentMode + 17 tests
  - P3: payment runtime fix + sandbox banner (commit baf4c5c, push)
  - P5: data manifest + 84 tests
  - P6: admin UI rewrite (3 tabs)
  - P7: DataSourceFooter on 5 pages
  - P8: route types extension (additive)
  - P9: route engine threading (3240 tests preserved)
  - P10: route UI surfaces
  - P11: fuel override UX
  - P12: health/data-status extensions (commit ba97d3e, push)
  - P13: docs/payment-modes.md + docs/data-update-runbook.md
  - P14: delivery package + ZIPs
- **2026-04-08 17:14**: Vercel deploy of Sprint C still pending (caveat 1)

---

## What Sprint C did NOT do (by design)

- Did not pursue live commerce (sandbox closure only)
- Did not seed Supabase tarife tables from `src/data` (Sprint D Path B work)
- Did not refactor calculators to read from Supabase (ADR-001 binds src/data)
- Did not fix the Next.js 16 middleware deprecation
- Did not enable analytics provider
- Did not audit MTV snapshot against GİB Tebliği PDF
- Did not run browser-based sandbox card E2E (Chrome MCP offline)
- Did not delete `/api/admin/tarifeleri` route (kept for Sprint B regression)
- Did not delete or modify `derivePaymentState()` (kept Sprint B 6-state behavior)
- Did not modify any `src/data/*.ts` files (manifest reads, doesn't modify)
- Did not modify `src/lib/route/{graph-search,haversine}.ts` or graph data
- Did not change the test suite assertions; only added new tests

**Each of these is tracked as Sprint D / separate sprints.**
