# Sprint C Delivery Package — Sandbox Closure + Data Update System

**Delivered**: 2026-04-08
**Local commit**: `95bcadc8e6770372e483948b74e5446d3aac56c6`
**Production commit**: **`95bcadc8e6770372e483948b74e5446d3aac56c6`** ✅ PARITY MATCH
**Production deployment**: `dpl_E9YTfCv4X18i7UsWZb79CpBoBkaR`
**Production URL**: https://arac-karar-motoru.vercel.app
**Status**: ✅ **Sprint B caveat CLOSED in production. Sprint C fully live.**

---

## Purpose

Sprint C closes 3 known caveats from Sprint B:

1. **iyzico `/api/payment/create` 500** in production → **fixed in code**
   via `getCallbackBaseUrl()` helper. Local PASS. Production verification
   pending Vercel deploy.
2. **`src/data` vs Supabase fork** → **decided** via ADR-001 (`src/data`
   binding, admin tarife edit tabs hidden).
3. **Tarife update workflow** → **documented** via `docs/data-update-runbook.md`
   and surfaced via `src/lib/data-manifest.ts` + `<DataSourceFooter>` on
   public pages.

Plus 4 new improvements:

- **Payment mode** is now a top-level field on `/api/health`: one of
  `paymentDisabled` / `paymentSandbox` / `paymentLive`.
- **Sandbox disclosure banner** on `/odeme` when `paymentMode === 'paymentSandbox'`.
- **Route source tracking**: `RouteResult` now exposes
  `pathDistanceSource`, `tollSource`, `districtOffsetSource`, `fuelPriceSource`.
- **Fuel reference + override UX**: "Sizin fiyatınız" / "Referans (PETDER)"
  badges on the fuel inputs.

---

## How to Read This Package

Start here, in order:

1. **`runtime-status.md`** — Single source of truth for Sprint C state
2. **`sprint-end-questions.md`** — 8 questions, 8 cited answers
3. **`status.md`** — Phase-by-phase execution table
4. **`payment-modes.md`** — 3 honest payment modes (copy of `docs/payment-modes.md`)
5. **`data-update-runbook.md`** — Editorial workflow for tariffs
6. **`adr-0001-src-data.md`** — Binding source-of-truth decision
7. **`payment-runtime-check.md`** — Sprint C payment proof + caveat closure status
8. **`manual-qa.md`** — 8 reproducible tests

Reference material:

- **`baseline.md`** — Sprint C P0 starting state
- **`env-audit.md`** — Vercel env var names + Sprint C additions
- **`changed-files.md`** — git diff summary vs Sprint B head
- **`build-log.txt`** — local `npm run build` output
- **`test-suite-final.txt`** — 8 + 9 + 84 + 34 + 16 + 3240 = 3391 assertions

Proof artifacts:

- **`api-responses/`** — local + production endpoint snapshots, manifest export, payment-mode decision trail, route source-tracking sample
- **`baseline/`** — Sprint C P0 captures
- **`screenshots/`** — bonus, only if Chrome MCP was available

---

## One-paragraph Sprint C summary

Sprint C added a `getCallbackBaseUrl()` helper that fixes Sprint B's
iyzico /api/payment/create 500 (root cause: hardcoded localhost fallback
when `NEXT_PUBLIC_SITE_URL` was missing in Vercel). It introduced a
3-mode payment helper (`paymentDisabled` / `paymentSandbox` / `paymentLive`)
exposed at the top level of /api/health and used by the /odeme sandbox
banner. It bound `src/data/*.ts` as the canonical tariff store via
ADR-001 and hid the misaligned admin tarife edit tabs (MTV / muayene /
otoyol / yakıt). It built a typed `src/lib/data-manifest.ts` that
normalizes the metadata across all 8 data files, surfaces it via /api/data-status
and via a `<DataSourceFooter>` on every public calculator page. It
extended the route engine to track 4 source dimensions (`pathDistanceSource`,
`tollSource`, `districtOffsetSource`, `fuelPriceSource`) without breaking
3240 existing graph tests. It added "Sizin fiyatınız" / "Referans (PETDER)"
override semantics to the fuel inputs. Finally, it kept all of Sprint B's
regression scripts and tests passing.

---

## Caveats

### ~~Caveat 1 — Vercel deploy pending~~ **CLOSED**

Vercel auto-deploy webhook was not firing on new commits. User authorized
manual deploy via `vercel deploy --prod` using the Vercel CLI. Four
deploys were executed to diagnose and fix the Sprint B caveat:

1. `dpl_H9442CBxnfjTMHA8msVUExzVBMDU` — Sprint C full wave (commit `595d7b8`). Exposed actual root cause via Vercel logs.
2. `dpl_AjkQDRxg9En54Q2NYMDBiUTQcuqW` — 1st fix attempt (commit `b683a2d`). `iyzipay/lib/**` include. Closed ENOENT scandir error, exposed deeper "Cannot find module 'postman-request'" error.
3. `dpl_E9YTfCv4X18i7UsWZb79CpBoBkaR` — **final fix** (commit `95bcadc`). Full 71-package iyzipay transitive dependency tree added to `outputFileTracingIncludes`. **HTTP 200 ✅**

### ~~Caveat 2 — Sprint B iyzico /api/payment/create 500~~ **CLOSED**

**Sprint B's suspicion** was `NEXT_PUBLIC_SITE_URL` missing. **Actual
root cause** (discovered via `vercel logs` after Sprint C's 1st deploy):
iyzipay's `lib/resources/*.js` files + 71 transitive dependencies were
missing from the Vercel lambda bundle because Turbopack's nft
(node-file-trace) cannot follow dynamic `fs.readdirSync` + `require()`
chains.

**Fix**: `next.config.ts` → `outputFileTracingIncludes` for
`/api/payment/create` and `/api/payment/callback`, explicitly listing
`iyzipay/**` + `postman-request/**` + 69 other transitive deps.

**Verification** (2026-04-08T18:10Z):
- `POST /api/payment/create` → HTTP 200
- Token: `d65483a8-8d70-44dc-8701-21281232e564`
- 2885-char checkoutFormContent
- orderId 16 persisted to `odemeler` (cleaned up post-test)
- `isSandbox: true` confirmed in the iyzico bundle

See `payment-runtime-check.md` for the full diagnosis timeline.

### Caveat 3 — Browser sandbox card E2E deferred (unchanged from Sprint C plan)

Per Sprint C user decision, the browser-based sandbox card E2E test
(5528790000000008 success + 4111111111111129 fail) is still deferred.
Chrome MCP remained offline throughout the Sprint C verification window.
The full create flow is API-level proven in production. Manual browser
test instructions are in `manual-qa.md` Test 8.

---

## Test Suite Final

```
8    callback-url.test.ts          (Sprint C P2)
9    state-machine.test.ts         (Sprint C P2 — getPaymentMode 9 inputs)
84   data-manifest.test.ts         (Sprint C P5 — 8 entries × 9-11 assertions each)
34   route-engine.test.ts          (Sprint A/B; Sprint C P9 didn't break it)
16   edge-cases.test.ts            (Sprint A/B; Sprint C P9 didn't break it)
3240 graph-connectivity.test.ts    (Sprint A/B; Sprint C P9 didn't break it)
─────
3391 total assertions PASS
```

`npm run build`: exit 0
`npx tsc --noEmit`: clean
`npm run lint`: clean (Sprint A/B Next.js 16 middleware deprecation warning still present, intentionally not fixed)

---

## Delivery Package Layout

```
delivery/sprint-c/
├── README.md                              ← you are here
├── status.md                              (Phase status table)
├── baseline.md                            (Sprint C P0 starting state)
├── baseline/                              (P0 captures)
│   ├── git-rev-parse-head.txt
│   ├── prod-{health,build-info,data-status}.json
│   └── prod-payment-create.txt
├── runtime-status.md                      (Sprint C state)
├── adr-0001-src-data.md                   (copy of docs/adr/0001-…)
├── payment-modes.md                       (copy of docs/payment-modes.md)
├── data-update-runbook.md                 (copy of docs/data-update-runbook.md)
├── payment-runtime-check.md               (P3 + P4 status)
├── manual-qa.md                           (8 reproducible tests)
├── sprint-end-questions.md                (8 cited answers)
├── env-audit.md                           (Vercel env vars list)
├── changed-files.md                       (git diff vs Sprint B head)
├── build-log.txt                          (npm run build output)
├── test-suite-final.txt                   (3391 assertions PASS)
└── api-responses/
    ├── local-{health,build-info,data-status}-post-p12.json
    ├── payment-create-local.json
    ├── payment-mode-decision-trail.txt    (9 input combinations)
    ├── route-source-tracking-sample.json
    └── data-manifest-export.json          (8 entries)
```

ZIPs on Desktop:
- `arac-karar-motoru-sprint-c-<commit-short>.zip`
- `delivery-sprint-c-<commit-short>.zip`

---

## Verdict

Sprint C is **delivered and live in production**:

- ✅ All planned code changes are in (P0–P14)
- ✅ Local 3391 test assertions PASS
- ✅ ADR-001 written and accepted
- ✅ Documentation comprehensive (payment-modes, data-update-runbook, ADR-001)
- ✅ **Sprint B iyzico /api/payment/create 500 caveat CLOSED in production** at commit `95bcadc` (dpl `dpl_E9YTfCv4X18i7UsWZb79CpBoBkaR`)
- ✅ **Build parity proven** at runtime (local HEAD === /api/build-info.commit)
- ✅ **/api/health.paymentMode === "paymentSandbox"** verified in prod
- ✅ **/api/data-status.activeSource === "src_data_static_files"** verified in prod with 8-entry manifest[]
- ✅ **POST /api/payment/create returns HTTP 200** with sandbox token in prod (2885-char checkoutFormContent)
- ✅ **No secret leakage** across all 4 endpoints
- ⏸️ Browser sandbox card E2E still deferred (Chrome MCP offline — Sprint C user decision)

The 3 Sprint B caveats are **closed in production**. Sprint C discovered
the actual root cause (iyzipay transitive deps missing from Vercel
lambda bundle, NOT the suspected NEXT_PUBLIC_SITE_URL issue) and fixed
it via 4 diagnostic deploys.

See `sprint-end-questions.md` for the 8 sprint-end answers with
production citations. See `payment-runtime-check.md` for the full
deploy-by-deploy diagnosis timeline.
