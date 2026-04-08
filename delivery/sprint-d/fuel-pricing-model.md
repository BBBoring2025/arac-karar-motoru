# Fuel Pricing Model — Sprint D Recap

**Not new in Sprint D.** Sprint C P11 shipped the reference+override
semantics. Sprint D preserves them and cleans up duplicate source
surfaces (Sprint D P11 "Bilgilendirme" Card removal).

## Two sources

| Source | Where | Label in UI |
|---|---|---|
| **Reference** | `src/data/yakit.ts::fuelData.fuelTypes` | "Referans (PETDER)" |
| **User override** | form input | "Sizin fiyatınız" |

## UX states

### `/araclar/yakit-hesaplama` (Sprint C P11)

- Initial load: "Referans (PETDER)" badge on the unit price field
- User edits the price: badge flips to "Sizin fiyatınız" (orange)
- "Referansa dön" button restores the reference value + resets the badge

### `/araclar/rota-maliyet` → FuelCostCard (Sprint C P10)

- Sprint C P10 added `fuelPriceSource` on `RouteResult`
- `FuelCostCard` shows the subtitle based on `fuelPriceSource`:
  - `'user_input'` → "Sizin fiyatınız"
  - `'reference_country'` → "Referans (PETDER ortalaması)"
- `VehicleSelector` tracks override state and propagates to `RouteForm`

## What Sprint D changed

- **Sprint D P11**: Removed the hardcoded "Bilgilendirme" Card on
  `/araclar/yakit-hesaplama` that said "Kaynak: PETDER 2026 Fiyatları".
  The `<DataSourceFooter manifestKey="yakit" />` already renders this
  information from the manifest. The override badges (Sprint C P11) are
  preserved.

- **Sprint D P8**: `data-manifest.ts::yakit` entry now has
  `refreshCadence: 'monthly'` which flags the entry as `stale` when
  `lastUpdated` is older than 35 days. As of today, yakit IS stale (84
  days).

- **Sprint D P9**: Yakit staleness is visible via
  `/api/data-status.dataFreshness.staleSummary` and admin dashboard
  warning card.

## Cross-references

- `src/data/yakit.ts` (Sprint A — fuel data with confidence='yaklaşık')
- `src/components/route/FuelCostCard.tsx` (Sprint C P10)
- `src/components/route/VehicleSelector.tsx` (Sprint C P11 override state)
- `src/app/araclar/yakit-hesaplama/page.tsx` (Sprint C P11 "Sizin fiyatınız" badge, Sprint D P11 cleanup)
- `src/lib/data-manifest.ts::yakit` (Sprint D P8 refreshCadence='monthly')
- `docs/data-update-runbook.md` (Sprint C P13)
- `delivery/sprint-d/data-freshness-policy.md`

## Sprint D verdict

No engineering changes needed. Sprint D preserves the Sprint C reference+override model, cleans up duplicate source labels (P11), and surfaces the staleness status (P8+P9).
