# Sprint C — Changed Files

Two commit waves:

1. **Wave 1** (`baf4c5c`) — P0/P1/P2/P3/P8: ADR + payment helpers + sandbox banner + route types
2. **Wave 2** (`ba97d3e`) — P5/P6/P7/P9/P10/P11/P12: data manifest + admin UI + footer + route engine + endpoints

Plus Wave 3 (uncommitted at delivery time) — P4/P13/P14: docs + delivery package.

---

## Wave 1 — `baf4c5c`

```
feat(sprint-c): callback URL helper + payment mode + ADR-001 + sandbox banner

14 files changed, 690 insertions(+), 9 deletions(-)
```

### New files

- `delivery/sprint-c/baseline/git-rev-parse-head.txt` — P0
- `delivery/sprint-c/baseline/prod-build-info.json` — P0
- `delivery/sprint-c/baseline/prod-data-status.json` — P0
- `delivery/sprint-c/baseline/prod-health.json` — P0
- `delivery/sprint-c/baseline/prod-payment-create.txt` — P0
- `docs/adr/0001-src-data-as-source-of-truth.md` — P1 (binding decision)
- `src/lib/payment/callback-url.ts` — P2 (`getCallbackBaseUrl()` helper)
- `src/lib/payment/__tests__/callback-url.test.ts` — P2 (8 fixtures)
- `src/lib/payment/__tests__/state-machine.test.ts` — P2 (9 fixtures for `getPaymentMode`)

### Modified files

- `docs/data-source-truth.md` — P1: Sprint C update section
- `src/app/api/payment/create/route.ts` — P3: uses `getCallbackBaseUrl()` instead of hardcoded localhost
- `src/app/odeme/page.tsx` — P3: amber sandbox banner + `paymentMode` derivation
- `src/lib/payment/state-machine.ts` — P2: appends `getPaymentMode()` (existing exports unchanged)
- `src/lib/route/types.ts` — P8: extends `RouteResult` + `TollBreakdownItem` + `RouteParams` with optional source tracking fields (additive only)

---

## Wave 2 — `ba97d3e`

```
feat(sprint-c): data manifest + route source tracking + admin UI hide + endpoint extensions

20 files changed, 1160 insertions(+), 462 deletions(-)
```

### New files

- `src/lib/data-manifest.ts` — P5 (typed re-export of 8 data type metadata)
- `src/lib/__tests__/data-manifest.test.ts` — P5 (84 drift assertions)
- `src/components/ui/DataSourceFooter.tsx` — P7 (compact source footer)

### Modified files

- `src/lib/route/district-offset.ts` — P9: returns `multiplier` alongside distance/duration
- `src/lib/route/route-engine.ts` — P9: derives + populates 4 source tracking fields, adds 2 helper functions
- `src/lib/route/toll-calculator.ts` — P9: per-line confidence + sourceLabel + sourceUrl
- `src/components/route/RouteConfidenceNote.tsx` — P10: 3 source provenance lines
- `src/components/route/TollBreakdownCard.tsx` — P10: per-segment confidence badge + sourceUrl link
- `src/components/route/FuelCostCard.tsx` — P10: "Sizin fiyatınız" / "Referans (PETDER)" subtitle
- `src/components/route/VehicleSelector.tsx` — P11: tracks `priceOverridden` + propagates `fuelPriceSource`
- `src/components/route/RouteForm.tsx` — P11: pipes `fuelPriceSource` through to `RouteParams`
- `src/app/araclar/mtv-hesaplama/page.tsx` — P7: replaces footer with `<DataSourceFooter manifestKey="mtv" />`
- `src/app/araclar/muayene-ucreti/page.tsx` — P7: same with `manifestKey="muayene"`
- `src/app/araclar/yakit-hesaplama/page.tsx` — P7 + P11: footer + override badge + reset link
- `src/app/araclar/otoyol-hesaplama/page.tsx` — P7: `manifestKey="otoyol-segments"`
- `src/app/araclar/rota-maliyet/page.tsx` — P7: two footers side by side (otoyol + yakit)
- `src/app/admin/page.tsx` — P6: rewritten — removes mtv/muayene/otoyol tabs, adds dashboard info card + data-manifest tab
- `src/app/api/admin/tarifeleri/route.ts` — P6: deprecation headers + console.warn
- `src/app/api/health/route.ts` — P12: top-level `paymentMode` field
- `src/app/api/data-status/route.ts` — P12: `activeSource` + `adrReference` + `precedence` + `manifest[]` fields, ALIGNMENT_WARNING text updated to cite ADR-001

---

## Wave 3 — Uncommitted at delivery time (P4/P13/P14)

These are the files added after the second push for documentation +
delivery package assembly.

### New files (docs)

- `docs/payment-modes.md` — P13 (3 honest payment modes documentation)
- `docs/data-update-runbook.md` — P13 (8 sections, one per data type)

### New files (delivery package)

- `delivery/sprint-c/README.md` — P14 (index)
- `delivery/sprint-c/status.md` — P14 (phase table)
- `delivery/sprint-c/baseline.md` — P14 (Sprint C P0 narrative)
- `delivery/sprint-c/runtime-status.md` — P14
- `delivery/sprint-c/adr-0001-src-data.md` — P14 (copy of docs/adr/0001-…)
- `delivery/sprint-c/payment-modes.md` — P14 (copy of docs/payment-modes.md)
- `delivery/sprint-c/data-update-runbook.md` — P14 (copy of docs/data-update-runbook.md)
- `delivery/sprint-c/payment-runtime-check.md` — P4 + P14
- `delivery/sprint-c/manual-qa.md` — P14 (8 reproducible tests)
- `delivery/sprint-c/sprint-end-questions.md` — P14 (8 cited answers)
- `delivery/sprint-c/env-audit.md` — P14
- `delivery/sprint-c/changed-files.md` — this file
- `delivery/sprint-c/build-log.txt` — P14 (`npm run build` output)
- `delivery/sprint-c/test-suite-final.txt` — P14 (3391 assertions)

### New files (api-responses)

- `delivery/sprint-c/api-responses/local-health-post-p12.json`
- `delivery/sprint-c/api-responses/local-build-info-post-p12.json`
- `delivery/sprint-c/api-responses/local-data-status-post-p12.json`
- `delivery/sprint-c/api-responses/payment-create-local.json`
- `delivery/sprint-c/api-responses/payment-mode-decision-trail.txt`
- `delivery/sprint-c/api-responses/route-source-tracking-sample.json`
- `delivery/sprint-c/api-responses/data-manifest-export.json`

---

## File preservation list (Sprint B → Sprint C unchanged)

These were Sprint A/B deliverables Sprint C explicitly preserved without
touching:

- `src/lib/flags.ts` — Sprint B feature flag system
- `src/lib/payment/processor.ts` — iyzico SDK wrapper
- `src/lib/payment/config.ts` — env presence check
- `src/lib/payment/state-machine.ts::derivePaymentState` body — 6-state callback flow
- `src/lib/supabase.ts` — admin + public clients
- `src/app/api/payment/callback/route.ts` — `request.url` redirect path (works in prod)
- `src/app/api/build-info/route.ts` — already correct, no changes needed
- `src/app/api/admin/dashboard/route.ts` — auth path
- `src/lib/auth.ts` — `requireAdmin()` helper
- `src/middleware.ts` — Next.js 16 deprecation warning ignored
- `src/data/**` — all 7 data files (manifest reads, doesn't modify)
- `src/lib/route/{graph-search,haversine}.ts` — graph topology spine
- `src/data/routes/{graph,toll-segments}.ts` — graph data
- `src/data/locations/{anchors,districts}.ts` — graph topology
- `src/lib/route/__tests__/*.test.ts` — all 3 tests pass without modification (3240 graph + 34 route + 16 edge cases)
- `src/lib/{mtv,muayene,report}/**` — calculation modules
- `next.config.ts`, `package.json`, `tsconfig.json` — build config
- `scripts/sprint-b-{admin-seed,crud-prod-sync}.mjs` — Sprint B regression scripts (Sprint C runs them as smoke tests)
- `delivery/sprint-b/**/*` — historical record
- `docs/archive/**` — Sprint A/B archived docs

---

## Test Suite Final

```
8     callback-url.test.ts          — Sprint C P2 NEW
9     state-machine.test.ts         — Sprint C P2 NEW
84    data-manifest.test.ts         — Sprint C P5 NEW
34    route-engine.test.ts          — Sprint A/B (no Sprint C modification)
16    edge-cases.test.ts            — Sprint A/B (no Sprint C modification)
3240  graph-connectivity.test.ts    — Sprint A/B (no Sprint C modification)
─────
3391  total assertions PASS
```

`npx tsc --noEmit`: clean
`npm run build`: exit 0
`npm run lint`: clean (Sprint A/B Next.js 16 middleware deprecation warning still present, intentionally not fixed)
