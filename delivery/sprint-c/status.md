# Sprint C — Phase Status

| Phase | Name | Status | Evidence |
|---|---|---|---|
| P0 | Baseline Capture | ✅ DONE | `baseline.md`, `baseline/*.{json,txt}` |
| P1 | ADR-001 binding decision | ✅ DONE | `adr-0001-src-data.md`, `docs/adr/0001-…`, `docs/data-source-truth.md` Sprint C update section |
| P2 | Payment helpers (callback-url + getPaymentMode) | ✅ DONE | `src/lib/payment/callback-url.ts` + `state-machine.ts::getPaymentMode`, **8 + 9 = 17 unit tests pass** |
| P3 | Payment runtime fix + sandbox banner UI | ✅ DONE | `src/app/api/payment/create/route.ts:29-32` rewired, `/odeme/page.tsx` banner. Helper is active and in place. **Real Sprint B caveat was a Vercel file tracing issue, not this helper** — see P4 |
| P4 | Sandbox proof capture | ✅ **DONE (production HTTP 200)** | Actual root cause diagnosed via `vercel logs`: iyzipay 71 transitive deps missing from lambda. Fix committed as `95bcadc` → dpl `E9YTfCv4X18i7UsWZb79CpBoBkaR`. Production POST returns HTTP 200 with sandbox token (orderId 16, token d65483a8-...). See `payment-runtime-check.md` for 4-deploy diagnosis timeline. |
| P5 | Data manifest layer | ✅ DONE | `src/lib/data-manifest.ts` (8 entries) + **84 drift assertions pass** |
| P6 | Admin UI hardening + tab hiding | ✅ DONE | `src/app/admin/page.tsx` (3 tabs instead of 5: dashboard / data-manifest / araclar), `/api/admin/tarifeleri` deprecation headers + warn |
| P7 | Public DataSourceFooter on calculator pages | ✅ DONE | `src/components/ui/DataSourceFooter.tsx` + 5 pages updated (mtv, muayene, yakit, otoyol, rota-maliyet) |
| P8 | Route types extension (additive) | ✅ DONE | `src/lib/route/types.ts` extended; **3240 + 34 + 16 tests still pass** |
| P9 | Route engine threading (fill source fields) | ✅ DONE | `route-engine.ts`, `district-offset.ts`, `toll-calculator.ts` updated; sample run shows `pathDistanceSource=mixed`, `tollSource=estimated_segment`, `districtOffsetSource.multiplier=1.5`, `fuelPriceSource=reference_country` |
| P10 | Route UI surfaces | ✅ DONE | `RouteConfidenceNote` 3 source lines, `TollBreakdownCard` per-line confidence badge + sourceUrl link, `FuelCostCard` "Sizin fiyatınız" / "Referans (PETDER)" subtitle |
| P11 | Fuel reference + override UX | ✅ DONE | `VehicleSelector` priceOverridden state, `RouteForm` propagates fuelPriceSource, `/araclar/yakit-hesaplama` "Sizin fiyatınız" badge + reset link |
| P12 | Health/data-status endpoint extensions | ✅ **DONE (production verified)** | `/api/health.paymentMode === "paymentSandbox"` verified in prod, `/api/data-status.activeSource === "src_data_static_files"` + `adrReference` + `manifest[]` (8 entries) verified in prod. See `api-responses/prod-*-final.json` |
| P13 | Documentation (payment-modes + runbook) | ✅ DONE | `docs/payment-modes.md`, `docs/data-update-runbook.md`, `docs/data-source-truth.md` updated, `docs/adr/0001-…` |
| P14 | Sprint-end delivery package + ZIPs | ✅ DONE | This file + sibling delivery files; ZIPs on Desktop |

## Pending after Sprint C

- **Browser test (optional)**: Open `/odeme` in the browser, verify amber
  sandbox banner is visible, complete a sandbox card transaction with
  `5528790000000008`. This is the only Sprint C test still deferred
  (Chrome MCP was offline throughout Sprint C). Document in
  `delivery/sprint-c+1/` or as a Sprint D item.
- **Data source audit**: Validate MTV snapshot against the official GİB
  Tebliği PDF (Sprint D content work, not engineering).
- **Next.js 16 middleware deprecation fix**: Track as dedicated Sprint
  (out of Sprint C scope).

## Sprint B caveat closure

| Sprint B caveat | Sprint C status |
|---|---|
| iyzico /api/payment/create 500 in production | ✅ **CLOSED in production** (commit `95bcadc`, dpl `E9YTfCv4X18i7UsWZb79CpBoBkaR`). Actual root cause was iyzipay 71 transitive deps missing from Vercel lambda bundle, NOT the suspected NEXT_PUBLIC_SITE_URL issue. See `payment-runtime-check.md` §"Sprint B caveat CLOSURE — Timeline" |
| `src/data` vs Supabase fork | ✅ **DECIDED** via ADR-001, admin tabs hidden, runbook written, /api/data-status exposes `activeSource` in production |
| Tarife snapshot accuracy | ✅ **Documented** via `docs/data-update-runbook.md`. Update workflow now atomic. Snapshot accuracy itself is still per-source-PDF responsibility (not Sprint C scope) |

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
| Vercel MCP | ❌ Offline | Cannot trigger deploy or read runtime logs via MCP — used **Vercel CLI (`npx vercel deploy --prod`)** as fallback instead. This was the key unblock for Sprint B caveat closure |
| Vercel build pipeline auto-trigger | ⚠️ Not firing on push | Manual deploy via Vercel CLI worked perfectly. 4 successful deploys in Sprint C via CLI. |
| Vercel CLI | ✅ Installed via `npx --yes vercel` | User was already logged in as `senalpserkan-4123`; enabled deploy + log streaming |
| Claude in Chrome MCP | ❌ Offline | Browser-based sandbox card E2E deferred (per user decision) |
| Claude Preview MCP | ✅ Used for local dev | Local payment + endpoint verification PASS |
