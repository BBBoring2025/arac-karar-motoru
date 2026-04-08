# Sprint C Delivery Package — Sandbox Closure + Data Update System

**Delivered**: 2026-04-08
**Local commit**: `ba97d3eaa904b481aaae49911da80ef8f6b89a19`
**Production commit**: `0be9b8e7612bd2b365a5418922d22981981c7f37` (Sprint B; Sprint C deploy pending — see §Caveats)
**Production URL**: https://arac-karar-motoru.vercel.app

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

### Caveat 1 — Vercel deploy of Sprint C pending

Sprint C's commits (`baf4c5c`, `ba97d3e`) are pushed to `origin/main`
but as of the verification window the Vercel build pipeline did not pick
them up. Production is still on Sprint B commit `0be9b8e`. Vercel MCP was
offline, so the deploy could not be triggered programmatically.

**Action required**: User opens the Vercel Dashboard → Project →
Deployments and clicks "Redeploy" on the latest commit (`ba97d3e`). After
the deploy reaches READY:

```bash
curl -s https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit
# Expected: ba97d3eaa904b481aaae49911da80ef8f6b89a19

curl -s https://arac-karar-motoru.vercel.app/api/health | jq .paymentMode
# Expected: "paymentSandbox"

curl -s -X POST https://arac-karar-motoru.vercel.app/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"productId":"tekli","customer":{"firstName":"T","lastName":"U","email":"a@b.com","phone":"+905551234567"}}' \
  -w "\nHTTP:%{http_code}\n"
# Expected: HTTP 200 + checkoutFormContent + token + orderId
```

After this verification, Sprint B's caveat closes and Sprint C is fully
live in production.

### Caveat 2 — Browser sandbox card E2E deferred

Per Sprint C user decision, the browser-based sandbox card E2E test
(5528790000000008 success + 4111111111111129 fail) is deferred. Chrome
MCP was offline. The full create flow is API-level proven locally.
Manual browser test instructions are in `manual-qa.md` Test 8.

### Caveat 3 — Sprint B caveat closure depends on Caveat 1

The iyzico create 500 caveat closes the moment Sprint C commit is live
in production. The fix is in code, tested locally, committed, and pushed.
Only deploy is pending.

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

Sprint C is **delivered as scoped**:

- ✅ All planned code changes are in (P0–P14)
- ✅ Local 3391 test assertions PASS
- ✅ ADR-001 written and accepted
- ✅ Documentation comprehensive (payment-modes, data-update-runbook, ADR-001)
- ✅ Local sandbox flow PASS (helper fix verified)
- ⚠️ Production deploy of Sprint C commits pending (Vercel pipeline issue, user action required)
- ⚠️ Browser sandbox card E2E deferred (Chrome MCP offline)

The 3 Sprint B caveats are **closed in code**. The /api/payment/create
500 caveat will close in production the moment Sprint C deploys.

See `sprint-end-questions.md` for the 8 sprint-end answers with citations.
