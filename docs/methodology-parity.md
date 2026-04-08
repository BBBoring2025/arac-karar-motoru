# Methodology ↔ Runtime Parity Check

**Sprint D P12 deliverable.** Audit mapping every confidence claim
on the public methodology page against the authoritative runtime data.

**Baseline findings** (Phase 1 exploration, 2026-04-09):
- 7 of 10 metodoloji rows match a `dataManifest` entry exactly
- 2 of 10 are intentional runtime-computed (sigorta, ilçe offset)
- 1 of 10 has a documented **content drift** (araclar)
- 1 **gap**: bakım benchmark listed in metodoloji but absent from manifest

Methodology page: `src/app/metodoloji/page.tsx` (385 lines)
Data manifest: `src/lib/data-manifest.ts` (~440 lines Sprint D)
Trust model: `docs/trust-model.md` (Sprint A)
ADR: `docs/adr/0001-src-data-as-source-of-truth.md` (Sprint C)

---

## Per-row parity table

| # | metodoloji.dataSources row | Manifest key | Metodoloji label | Manifest confidence | Match |
|---|---|---|---|---|---|
| 1 | MTV (Motorlu Taşıt Vergisi) | `mtv` | Kesin | `kesin` | ✅ |
| 2 | Muayene Ücretleri | `muayene` | Kesin | `kesin` | ✅ |
| 3 | Otoyol Ücretleri (route-based) | `otoyol-routes` | Kesin | `kesin` | ✅ |
| 4 | Sigorta Fiyatları | **— (formula)** | Tahmini | n/a | ✅ explained |
| 5 | Bakım Maliyetleri | **— (empty)** | Tahmini | n/a | ⚠️ **gap** |
| 6 | Yakıt Fiyatları (PETDER) | `yakit` | Yaklaşık | `yaklaşık` | ✅ |
| 7 | Amortisman (Değer Kaybı) | `amortisman` | Tahmini | `tahmini` | ✅ |
| 8 | Rota — Köprü/Tünel Ücretleri | `otoyol-segments` (per-segment) | Kesin | `kesin` | ✅ |
| 9 | Rota — Otoyol Segment Ücretleri | `otoyol-segments` (per-segment) | Tahmini | `tahmini` | ✅ |
| 10 | Rota — İl/İlçe Mesafeleri | **— (graph)** | Yaklaşık | n/a | ✅ explained |

**Also present in manifest but NOT in metodoloji's 10-row table** (these appear in the calculation methods narrative on the metodoloji page, but not in the top-level source table):

| # | Manifest key | Metodoloji narrative presence | Manifest confidence | Match |
|---|---|---|---|---|
| 11 | `noter` | Yes (sub-paragraph) | `kesin` | ✅ |
| 12 | `araclar` | Yes, labeled "Tahmini" | `yüksek` | ⚠️ **drift** |

---

## Drift findings

### Drift 1: `araclar.ts.confidence` = `'yüksek'` vs metodoloji = `'Tahmini'`

**File**: `src/data/araclar.ts`
**Current value**: `confidence: 'yüksek'`
**Metodoloji claim**: "Tahmini" (the methodology page lists araclar under
the "Tahmini" confidence tier in the narrative around vehicle price
estimates)
**Impact**: Low. The calculator pages render the manifest confidence
(`yüksek`), so users see "Yüksek Güven" badge on the araclar-dependent
tools. The metodoloji page wording is inconsistent but not user-visible
unless a user cross-reads both.

**Decision for Sprint D**: **DOCUMENT, DO NOT FIX.**
- Changing the data file = changing confidence semantics = content review needed
- Changing the metodoloji page = content edit = content team responsibility
- Sprint D is an engineering sprint; this is a content drift

**Action item for Sprint E / content team**: Decide whether `araclar`
should be `yüksek` (manifest) or `tahmini` (metodoloji). If `tahmini`
wins, update `src/data/araclar.ts::vehicleDatabase.confidence`. If
`yüksek` wins, update `src/app/metodoloji/page.tsx`'s narrative.

### Drift 2 (gap): bakım_benchmark listed in metodoloji, absent from manifest

**File**: `src/data/bakim.ts` — **DOES NOT EXIST**
**Supabase table**: `bakim_benchmark` — **EMPTY** (Sprint B baseline)
**Metodoloji claim**: "Tahmini" (listed as a data source)
**Impact**: Metodoloji implies we have a bakım benchmark data source,
but there's nothing to back it up. Vehicle maintenance costs are
currently computed at runtime via a hardcoded formula in
`src/lib/calculations.ts` (not verified in Phase 1 exploration).

**Decision for Sprint D**: **DOCUMENT, DO NOT FIX.**
- Adding `src/data/bakim.ts` is a Sprint E content task
- Alternative: remove the bakım row from metodoloji's table if no data exists to back it

**Action item for Sprint E**: Either
(a) create `src/data/bakim.ts` with OYDER benchmark data + add manifest entry, or
(b) remove the bakım row from the metodoloji top-level sources table

---

## Intentional no-manifest cases (not drifts)

### Row 4: Sigorta (Insurance)

Sigorta is a **formula-based calculation**, not a snapshot:
- Kasko: ~1.5% of vehicle market price per year
- Trafik: 300-800 TL per year (age/segment dependent)

This is computed at runtime in `src/lib/calculations.ts` using the vehicle
market price from `araclar.ts`. There's no "insurance tariff snapshot" to
put in the manifest because insurance doesn't work that way — each insurer
has proprietary rates.

**Metodoloji label**: "Tahmini" ✅ (correct — it's a model output)

### Row 10: Rota — İl/İlçe Mesafeleri (Distance offsets)

İlçe → anchor distance is computed via **Haversine × regional multiplier**
at runtime in `src/lib/route/district-offset.ts`. There's no table of
district distances to put in the manifest.

**Metodoloji label**: "Yaklaşık" ✅ (correct — geodesic × correction)

The multiplier values (1.25 / 1.4 / 1.5) are hardcoded in the offset module
and exposed at runtime via `RouteResult.districtOffsetSource.multiplier`
(Sprint C P9).

---

## Confidence enum consistency check

| metodoloji label | `DataConfidence` enum | Used in metodoloji top-10? |
|---|---|---|
| Kesin | `kesin` | ✅ yes (MTV, muayene, otoyol, köprü) |
| Yüksek Güven | `yüksek` | ⚠️ NOT in top-10 table (used for araclar only, internally) |
| Yaklaşık | `yaklaşık` | ✅ yes (yakıt, ilçe offset) |
| Tahmini | `tahmini` | ✅ yes (sigorta, bakım, amortisman, otoyol segment) |

**Observation**: The metodoloji page's top-level data source table uses only 3 of the 4 tiers (`kesin`, `yaklaşık`, `tahmini`). `yüksek` is absent from the table but present in the calculation narrative (araclar).

**Not a bug**: The 4-tier enum is a superset of what metodoloji surfaces.
The page deliberately omits `yüksek` from the top table to keep the
3-column color-coded format simple for users.

---

## Sprint D verdict

### What's aligned

✅ All 3 "Kesin" rows in metodoloji have manifest entries with `confidence: 'kesin'`
✅ "Yaklaşık" yakit = manifest yakit (both "yaklaşık")
✅ "Tahmini" amortisman = manifest amortisman (both "tahmini")
✅ "Tahmini" otoyol segment = manifest otoyol-segments per-segment confidence
✅ Sigorta + ilçe offset intentional formulas (documented, not drift)

### What's not aligned (documented, deferred to Sprint E)

⚠️ **Drift 1**: araclar.confidence disagreement (manifest `yüksek` vs metodoloji narrative "Tahmini")
⚠️ **Drift 2**: bakım_benchmark listed in metodoloji but no data file / manifest entry

### Sprint D action

- **Documented via this file** (docs/methodology-parity.md)
- **Sprint E candidates** filed for both drifts (content review)
- **No code changes** in Sprint D
- **No metodoloji page edits** in Sprint D

Both drifts are **honest documentation, not critical bugs**. Sprint D's
focus is public beta + analytics + freshness, and this doc closes the
parity audit without adding engineering scope.

---

## Future drift detection (Sprint E candidate)

A runtime test could assert that every `dataManifest[k].label` has a
corresponding row in the metodoloji page. This requires parsing the
metodoloji TSX file at build time OR refactoring metodoloji to read from
`dataManifest` instead of a hardcoded array.

Sprint D does not add this test because:
1. The metodoloji page is intentionally hardcoded for design/SEO reasons
2. Automatic drift detection would be testing the wrong layer (it would
   be testing the rendered page, not the data source)
3. The content team should own metodoloji, not the engineering team

Recommended Sprint E item: **refactor metodoloji page to read from
`dataManifest` for the top-level data sources table**. This way manifest
changes automatically surface in metodoloji without a separate content
edit.

---

## Cross-references

- `docs/adr/0001-src-data-as-source-of-truth.md` — ADR binding src/data
- `docs/data-source-truth.md` — Sprint B discovery
- `docs/data-update-runbook.md` — Sprint C editorial workflow
- `docs/trust-model.md` — Sprint A confidence enum definition
- `docs/public-beta-policy.md` — Sprint D public beta limitations (lists both drifts as known limitations)
- `src/lib/data-manifest.ts` — canonical manifest (8 entries)
- `src/app/metodoloji/page.tsx` — the page being audited
- `src/data/araclar.ts::vehicleDatabase.confidence` — Drift 1 target
- `src/data/bakim.ts` — **does not exist yet** (Drift 2 target)

---

**Status**: ✅ Sprint D P12 parity check complete. No code changes made.
Both drifts documented as Sprint E candidates.
