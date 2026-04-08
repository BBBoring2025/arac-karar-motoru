# Data Freshness Policy — Sprint D P8/P9

## Overview

Each data manifest entry has a `refreshCadence` that governs how often
it's expected to be refreshed. When `now - lastUpdated > cadence threshold`,
the entry is flagged `stale: true`. Admin dashboard surfaces stale
entries. Public users can verify via `/api/data-status.dataFreshness`.

## Cadence enum

```ts
export type RefreshCadence =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'on-publication';
```

## Max-days per cadence

```ts
const CADENCE_MAX_DAYS = {
  daily: 2,
  weekly: 10,
  monthly: 35,
  quarterly: 100,
  yearly: 380,
  'on-publication': Infinity, // never stales
};
```

`on-publication` is a sentinel for sources that update irregularly when
an authority publishes a new version. There's no expected interval.

## Current state (as of 2026-04-09)

| Key | Cadence | Last updated | Days | Max | Stale? |
|---|---|---|---|---|---|
| `mtv` | yearly | 2026-01-01 | 98 | 380 | ❌ |
| `muayene` | yearly | 2026-01-01 | 98 | 380 | ❌ |
| `yakit` | **monthly** | 2026-01-15 | 84 | 35 | ✅ **STALE** |
| `otoyol-routes` | yearly | 2026-04-05 | 4 | 380 | ❌ |
| `otoyol-segments` | yearly | 2026-04-05 | 4 | 380 | ❌ |
| `araclar` | quarterly | 2026-04-05 | 4 | 100 | ❌ |
| `noter` | yearly | 2026-01-01 | 98 | 380 | ❌ |
| `amortisman` | quarterly | 2026-01-15 | 84 | 100 | ❌ |

**1 stale entry**: `yakit`. 7 fresh.

## Why these cadences?

| Key | Cadence | Rationale |
|---|---|---|
| `mtv` | yearly | GİB publishes the MTV tariff annually (Q4 for next year) |
| `muayene` | yearly | TÜVTÜRK publishes the inspection tariff annually (early January) |
| `yakit` | monthly | PETDER prices change daily; monthly refresh is a sustainable compromise |
| `otoyol-routes` | yearly | KGM publishes HGS/OGS tariffs annually |
| `otoyol-segments` | yearly | Same as routes; bridges/tunnels stable |
| `araclar` | quarterly | Vehicle prices change continuously but quarterly snapshot is sufficient for TCO modeling |
| `noter` | yearly | Adalet Bakanlığı publishes notary fees annually |
| `amortisman` | quarterly | OYDER sector benchmarks update roughly quarterly |

Cadence decisions are based on the update cycles of the upstream data
providers, not on engineering preference. If a provider changes its
cadence, the manifest should be updated to match.

## Public surfacing

### `/api/health.dataFreshness` (summary — Sprint D P9)

```jsonc
{
  "staleCount": 1,
  "oldestStaleKey": "yakit",
  "oldestStaleDays": 84
}
```

Cheap to poll from a monitoring tool. One HTTP GET, one JSON parse.

### `/api/data-status.dataFreshness` (full — Sprint D P9)

```jsonc
{
  "generatedAt": "2026-04-09T...",
  "totalEntries": 8,
  "staleCount": 1,
  "staleKeys": ["yakit"],
  "staleSummary": [
    {
      "key": "yakit",
      "label": "Yakıt Fiyatları",
      "cadence": "monthly",
      "daysSinceUpdate": 84,
      "maxDaysForCadence": 35,
      "runbookAnchor": "#yakit"
    }
  ]
}
```

Per-entry detail for deep audits.

### Admin dashboard (Sprint D P10)

Yellow warning card at the top of the `/admin` Dashboard tab:

```
⚠️ Bayat Veri Uyarısı (1)
Yakıt Fiyatları — 84 gün geçti (maksimum 35 gün — monthly cadence)
→ runbook
```

If `staleEntries.length === 0`, shows a green "✅ Tüm veriler güncel" card instead.

## Editorial workflow for refreshing stale data

Per Sprint C `docs/data-update-runbook.md`:

1. Identify stale entry from `/api/data-status.dataFreshness.staleSummary`
2. Follow the runbook anchor (e.g. `#yakit`) to the data type's update instructions
3. Edit `src/data/yakit.ts`:
   - Update `fuelData.fuelTypes[]` prices to match current PETDER averages
   - Set `fuelData.lastUpdated` to today's ISO date
4. `npm run build` to verify tests pass
5. Commit with message referencing the stale reason
6. Push → Vercel deploy via CLI
7. Next `/api/data-status.dataFreshness` will show `staleCount === 0` for yakit

## Sprint D did NOT refresh yakit

Sprint D P8/P9 **surfaces** staleness. It does NOT **fix** the yakit data
file — that's a content task for Sprint E or a dedicated content refresh
cycle.

**Rationale**: Engineering effort is engineering effort; content refresh
is a separate responsibility. Sprint D makes the system auditable, not
self-healing.

## Cross-references

- Code: `src/lib/data-manifest.ts::computeStaleness` (pure function, testable)
- Code: `src/lib/data-manifest.ts::getStaleEntries` (runtime helper)
- Tests: `src/lib/__tests__/data-manifest.test.ts` Sprint D section (51 new assertions)
- Endpoint: `src/app/api/health/route.ts` dataFreshness summary
- Endpoint: `src/app/api/data-status/route.ts` dataFreshness.staleSummary
- Admin UI: `src/app/admin/page.tsx` stale warning card
- Runbook: `docs/data-update-runbook.md` (Sprint C P13)

## Sprint D verdict

✅ Cadence + stale infrastructure live
✅ Yakit correctly detected stale
✅ Admin + public endpoints both surface it
⚠️ Yakit data itself is still stale (Sprint E content fix)
