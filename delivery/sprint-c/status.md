# Sprint C — Phase Status

| Phase | Name | Status | Evidence |
|---|---|---|---|
| P0 | Baseline Capture | ✅ DONE | `baseline.md`, `baseline/*.{json,txt}` |
| P1 | ADR-001 binding decision | ✅ DONE | `adr-0001-src-data.md`, `docs/adr/0001-…`, `docs/data-source-truth.md` Sprint C update section |
| P2 | Payment helpers (callback-url + getPaymentMode) | ✅ DONE | `src/lib/payment/callback-url.ts` + `state-machine.ts::getPaymentMode`, **8 + 9 = 17 unit tests pass** |
| P3 | Payment runtime fix + sandbox banner UI | ✅ DONE (code) / ⚠️ DEFERRED (production verification) | `src/app/api/payment/create/route.ts:29-32` rewired, `/odeme/page.tsx` banner, **local POST returns HTTP 200 + sandbox token** |
| P4 | Sandbox proof capture | ⚠️ PARTIAL | Local PASS captured. Production proof deferred — Sprint C commits pushed but Vercel deploy pipeline did not pick them up; user must redeploy from dashboard |
| P5 | Data manifest layer | ✅ DONE | `src/lib/data-manifest.ts` (8 entries) + **84 drift assertions pass** |
| P6 | Admin UI hardening + tab hiding | ✅ DONE | `src/app/admin/page.tsx` (3 tabs instead of 5: dashboard / data-manifest / araclar), `/api/admin/tarifeleri` deprecation headers + warn |
| P7 | Public DataSourceFooter on calculator pages | ✅ DONE | `src/components/ui/DataSourceFooter.tsx` + 5 pages updated (mtv, muayene, yakit, otoyol, rota-maliyet) |
| P8 | Route types extension (additive) | ✅ DONE | `src/lib/route/types.ts` extended; **3240 + 34 + 16 tests still pass** |
| P9 | Route engine threading (fill source fields) | ✅ DONE | `route-engine.ts`, `district-offset.ts`, `toll-calculator.ts` updated; sample run shows `pathDistanceSource=mixed`, `tollSource=estimated_segment`, `districtOffsetSource.multiplier=1.5`, `fuelPriceSource=reference_country` |
| P10 | Route UI surfaces | ✅ DONE | `RouteConfidenceNote` 3 source lines, `TollBreakdownCard` per-line confidence badge + sourceUrl link, `FuelCostCard` "Sizin fiyatınız" / "Referans (PETDER)" subtitle |
| P11 | Fuel reference + override UX | ✅ DONE | `VehicleSelector` priceOverridden state, `RouteForm` propagates fuelPriceSource, `/araclar/yakit-hesaplama` "Sizin fiyatınız" badge + reset link |
| P12 | Health/data-status endpoint extensions | ✅ DONE (code) / ⚠️ DEFERRED (production verification) | `/api/health.paymentMode` field added, `/api/data-status.activeSource` + `adrReference` + `precedence` + `manifest[]` added — **local PASS captured** in `api-responses/local-*-post-p12.json` |
| P13 | Documentation (payment-modes + runbook) | ✅ DONE | `docs/payment-modes.md`, `docs/data-update-runbook.md`, `docs/data-source-truth.md` updated, `docs/adr/0001-…` |
| P14 | Sprint-end delivery package + ZIPs | ✅ DONE | This file + sibling delivery files; ZIPs on Desktop |

## Pending after Sprint C

- **User action**: Trigger Vercel redeploy of `ba97d3e` from the Vercel
  Dashboard. Then re-run the 3 verification curls in
  `payment-runtime-check.md` §"Action required". After production shows
  Sprint C commit, the iyzico create 500 caveat is closed.
- **Optional**: Add `NEXT_PUBLIC_SITE_URL=https://arac-karar-motoru.vercel.app`
  to Vercel Production env vars (helper has VERCEL_URL fallback so this
  is double safety, not a hard requirement).
- **Browser test**: Open `/odeme` after deploy, verify amber sandbox
  banner is visible, complete a sandbox card transaction with
  `5528790000000008`. Document in `delivery/sprint-c+1/`.

## Sprint B caveat closure

| Sprint B caveat | Sprint C status |
|---|---|
| iyzico /api/payment/create 500 in production | **CLOSED in code** (helper fix) — verification pending Vercel deploy |
| `src/data` vs Supabase fork | **DECIDED** via ADR-001, admin tabs hidden, runbook written |
| Tarife snapshot accuracy | **Documented** via `docs/data-update-runbook.md`. Update workflow now atomic. Snapshot accuracy itself is still per-source-PDF responsibility (not Sprint C scope) |

## Test Suite Status

```
8     callback-url.test.ts          (Sprint C P2 — NEW)
9     state-machine.test.ts         (Sprint C P2 — NEW)
84    data-manifest.test.ts         (Sprint C P5 — NEW)
34    route-engine.test.ts          (Sprint A/B — Sprint C P9 didn't break)
16    edge-cases.test.ts            (Sprint A/B — Sprint C P9 didn't break)
3240  graph-connectivity.test.ts    (Sprint A/B — Sprint C P9 didn't break)
─────
3391  total assertions PASS
```

## External Dependencies Observed

| Tool | State | Sprint C Impact |
|---|---|---|
| Supabase MCP | ❌ Offline | Direct REST scripts via service role key (Sprint B pattern) |
| Vercel MCP | ❌ Offline | Cannot trigger deploy or read runtime logs. **Blocks production verification** |
| Vercel build pipeline | ⚠️ Slow / not picking up commits | Production stuck at Sprint B commit. User must manually redeploy. |
| Claude in Chrome MCP | ❌ Offline | Browser-based sandbox card E2E deferred (per user decision) |
| Claude Preview MCP | ✅ Used for local dev | Local payment + endpoint verification PASS |
