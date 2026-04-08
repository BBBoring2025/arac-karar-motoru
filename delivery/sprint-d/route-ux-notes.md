# Route UX Notes — Sprint D Recap

**Not new in Sprint D.** Sprint C P8/P9/P10 shipped the route source
tracking. Sprint D preserves them and documents the current UX.

## Route result source tracking (Sprint C P9)

`RouteResult` exposes 4 source dimensions:

| Field | Type | Meaning |
|---|---|---|
| `pathDistanceSource` | `'graph' \| 'haversine_offset' \| 'mixed'` | How distance was computed |
| `tollSource` | `'kgm_official' \| 'estimated_segment' \| 'mixed' \| 'none'` | Toll fee origin |
| `districtOffsetSource` | `{ type: 'haversine_multiplier', multiplier: number }` | Offset model used |
| `fuelPriceSource` | `'user_input' \| 'reference_country' \| 'reference_city'` | Fuel price origin |

## Per-segment confidence (Sprint C P9)

Each `tollBreakdownItem` exposes:

- `confidence: 'kesin' | 'yüksek' | 'yaklaşık' | 'tahmini'`
- `sourceLabel: string` — KGM, estimation note, etc.
- `sourceUrl?: string` — verifiable link

`TollBreakdownCard` renders per-segment confidence badges + clickable
sourceUrl.

## UI components

- `RouteConfidenceNote` — shows 3 provenance lines (distance, toll, fuel)
- `TollBreakdownCard` — per-segment badges + source links
- `FuelCostCard` — "Sizin fiyatınız" or "Referans (PETDER)" subtitle

## What Sprint D changed

**Nothing engineering**. Sprint D only touched the route engine
indirectly via the `/api/health.dataFreshness` summary and the
`otoyol-segments` manifest entry's new `refreshCadence: 'yearly'`.

The source tracking, per-segment badges, and fuel override UX are all
Sprint C P9/P10/P11 deliverables, preserved verbatim.

## Canonical test routes

From `delivery/sprint-c/api-responses/route-source-tracking-sample.json`:

- **İstanbul Kadıköy → Ankara Çankaya** (`34-kadikoy` → `06-cankaya`)
  - `pathDistanceSource: 'mixed'`
  - `tollSource: 'estimated_segment'`
  - `districtOffsetSource.multiplier: 1.5` (İstanbul)
  - `fuelPriceSource: 'reference_country'`
  - `confidence: 'tahmini'`
  - 3 toll items in breakdown
  - first toll item keys: `segmentId, name, type, amount, confidence, sourceLabel, sourceUrl`

Manual QA routes:
- İstanbul → Bursa (crosses Osmangazi Köprüsü — `kesin`)
- Ankara → Konya (mostly estimated_segment)
- İzmit → Kaş (long route with multiple segments)

## Cross-references

- `src/lib/route/types.ts::RouteResult` (Sprint C P8)
- `src/lib/route/route-engine.ts::calculateRoute` (Sprint C P9)
- `src/lib/route/district-offset.ts::calculateDistrictOffset` (returns multiplier, Sprint C P9)
- `src/lib/route/toll-calculator.ts::calculateTollCost` (per-segment breakdown, Sprint C P9)
- `src/components/route/RouteConfidenceNote.tsx` (Sprint C P10 provenance lines)
- `src/components/route/TollBreakdownCard.tsx` (Sprint C P10 per-segment badges)
- `src/components/route/FuelCostCard.tsx` (Sprint C P10 source subtitle)
- Tests: 3240 graph-connectivity + 34 route-engine + 16 edge-cases (Sprint A/B + Sprint C P9 extensions)

## Sprint D verdict

Route UX preserved. Sprint D P11 did NOT touch `/araclar/rota-maliyet/page.tsx`
— it's the one calculator page that was NOT polluted with hardcoded
"Bilgilendirme" Card. Sprint D's only route-related change is that
`otoyol-segments` now has a `refreshCadence` field and will flag stale
if KGM changes its tariff and we don't update the manifest within a year.
