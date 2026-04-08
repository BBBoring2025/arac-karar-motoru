# Runtime Status — Sprint C Snapshot

**Single source of truth for what's running after Sprint C.**

Last verified: 2026-04-08 (Sprint C closure)
Local commit: `ba97d3eaa904b481aaae49911da80ef8f6b89a19`
Production commit: `0be9b8e7612bd2b365a5418922d22981981c7f37` (Sprint B; Sprint C deploy pending)
Live URL: https://arac-karar-motoru.vercel.app

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

## 4-Proof Table (Sprint C state, expected post-deploy)

| Service | Code | Runtime | Deploy | Env | Status |
|---|---|---|---|---|---|
| MTV calculator             | `src/lib/mtv/calculator.ts`              | `/araclar/mtv-hesaplama` returns 200 | (Sprint C deploy pending) | N/A | ✅ LIVE (footer added) |
| Muayene calculator         | `src/lib/muayene/calculator.ts`          | `/araclar/muayene-ucreti` returns 200 | (pending) | N/A | ✅ LIVE (footer added) |
| Yakit calculator + override | `src/app/araclar/yakit-hesaplama/page.tsx` | `/araclar/yakit-hesaplama` 200 with override badge | (pending) | N/A | ✅ LIVE NEW |
| Route engine               | `src/lib/route/route-engine.ts`          | 3240 + 34 + 16 tests pass | (pending) | N/A | ✅ LIVE NEW (source tracking) |
| Report PDF                 | `src/lib/report/*`                       | `/api/rapor/pdf` (not Sprint C tested) | (pending) | N/A | ✅ code ready |
| `/api/health`              | `src/app/api/health/route.ts`            | local: returns paymentMode field | (pending) | Sprint B env set | ✅ NEW FIELD (paymentMode) |
| `/api/build-info`          | `src/app/api/build-info/route.ts`        | unchanged from Sprint B | (pending) | Vercel auto | ✅ LIVE |
| `/api/data-status`         | `src/app/api/data-status/route.ts`       | local: activeSource + manifest[] | (pending) | Sprint B env set | ✅ NEW FIELDS |
| Feature flags              | `src/lib/flags.ts`                       | unchanged from Sprint B | (pending) | All read | ✅ LIVE |
| Payment 6-state machine    | `src/lib/payment/state-machine.ts::derivePaymentState` | unchanged from Sprint B | (pending) | Sprint B env set | ✅ LIVE |
| Payment 3-mode helper      | `src/lib/payment/state-machine.ts::getPaymentMode` | local: returns paymentSandbox | (pending) | derives from flags | ✅ LIVE NEW |
| Callback URL helper        | `src/lib/payment/callback-url.ts`        | local: 8 fixtures pass | (pending) | uses `NEXT_PUBLIC_SITE_URL` / `VERCEL_URL` | ✅ LIVE NEW |
| Supabase admin write       | `createAdminClient()`                    | Sprint B regression script still passes | (pending) | Sprint B P7 env set | ⚠️ DEPRECATED PATH (ADR-001) |
| Admin user `senalpserkan@gmail.com` | seeded in Sprint B P6           | kullanicilar row exists, rol=admin | (state) | Sprint B Auth | ✅ LIVE |
| Admin dashboard `/admin/*` | `src/app/admin/page.tsx` (Sprint C P6 rewrite) | 3 tabs (dashboard / data-manifest / araclar) | (pending) | Sprint B auth | ✅ LIVE NEW (UI hardening) |
| iyzico initialize (`/api/payment/create`) | `src/app/api/payment/create/route.ts` (Sprint C P3 fix) | **local PASS** (HTTP 200 + sandbox token) | **pending Vercel deploy** | Sprint B IYZICO_* set | ⚠️ Code FIXED, prod verification PENDING |
| iyzico callback retrieve   | `src/app/api/payment/callback/route.ts`  | unchanged from Sprint B (works) | (pending) | Sprint B env set | ✅ LIVE |
| Analytics                  | `src/lib/analytics/tracker.ts`           | `/api/health.flags.analyticsEnabled.enabled=false`, 0 provider scripts | (pending) | No provider | ⚠️ HONEST INACTIVE |

---

## 8 Sprint C-end questions (cited)

See `delivery/sprint-c/sprint-end-questions.md` for full answers with citations.

1. Production commit: `0be9b8e` (Sprint C deploy pending → expected `ba97d3e`)
2. Payment mode: `paymentSandbox` (local) → same in prod after deploy
3. Sandbox prod: code fixed, deploy pending; local PASS proven
4. Live payments missing: merchant agreement + KVKK + live env vars (none in Sprint C)
5. Source-of-truth: **`src_data_static_files`** (ADR-001 binding)
6. Approximate areas: district offset multiplier, highway segment tolls, fuel reference
7. Shown but not active: sandbox payment mode (intentional), analytics layer, MTV snapshot accuracy
8. Steps to live: Sprint D scope (merchant + legal + env swap + smoke test)

---

## Caveats

### Caveat 1 — Vercel deploy of Sprint C is pending

Sprint C's commits `baf4c5c` (P0–P3) and `ba97d3e` (P5–P12) are pushed to
`origin/main` but production is still on `0be9b8e` as of the verification
window. The Vercel build pipeline did not pick them up and Vercel MCP was
offline so we could not trigger the deploy programmatically.

**Action required**: User opens Vercel Dashboard → Project → Deployments
→ click Redeploy on the latest commit. After READY:

```bash
curl -s https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit
# Should return: ba97d3eaa904b481aaae49911da80ef8f6b89a19
```

After this, all Sprint C changes are live in production and Sprint B's
iyzico /api/payment/create 500 caveat is closed.

### Caveat 2 — Browser sandbox card E2E deferred

Per Sprint C user decision, the browser-based sandbox card E2E
(5528790000000008 success + 4111111111111129 fail) was deferred. Chrome
MCP was confirmed offline. The full create flow is API-level proven
locally. Manual browser test instructions in `manual-qa.md` Test 8.

### Caveat 3 — Analytics still inactive (intentional)

Sprint C did not change the analytics state. `src/lib/analytics/tracker.ts`
exists but no provider script is loaded. `/api/health.flags.analyticsEnabled.enabled=false`,
0 provider scripts in production HTML. This is honest, not a regression.

### Caveat 4 — Next.js 16 `middleware → proxy` deprecation warning

Build warning persists. Sprint C did not address it (intentionally out of
scope, defer to dedicated Next.js 16 sprint).

### Caveat 5 — Tarife snapshot accuracy

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
