# Data Update Runbook — Araç Karar Motoru

**Sprint C deliverable.** Step-by-step workflow for editing the 8 data
sources the application reads from. Read this before any tariff change.

ADR-001 (`docs/adr/0001-src-data-as-source-of-truth.md`) binds
`src/data/*.ts` as the single source of truth. Admin UI tarife edit tabs
were intentionally hidden in Sprint C P6 because Supabase writes were not
read by user-facing calculators. **Editing files in `src/data/` is the
only correct way** to update tariffs.

---

## TL;DR — The 5-step workflow

```
1. Edit  → src/data/<file>.ts
2. Build → npm run build  (verify TypeScript + tests still pass)
3. Test  → npm run dev    (eyeball /araclar/* pages locally)
4. PR    → git commit + push + open PR
5. Deploy → Merge to main → Vercel auto-deploys → values are live
```

Roll back: `git revert <commit>` and re-deploy.

Total time per update: ~5–10 minutes for a small change. ~30 minutes for
a tariff overhaul if you also need to update the date metadata and source
URL.

---

## 8 Data Sources (manifest entries)

The data manifest at `src/lib/data-manifest.ts` is the canonical list.
Each section below maps to one manifest key.

### #mtv — MTV Tarifeleri
- **File:** `src/data/mtv.ts`
- **Source:** GİB (Gelir İdaresi Başkanlığı) MTV Tebliği
- **URL:** https://www.gib.gov.tr
- **Confidence:** kesin
- **Update frequency:** Annual (Q4 of previous year for next year's tarifes)
- **What to update:**
  - `gasoline[]`, `diesel[]`, `lpg[]`, `hybrid[]`, `electric{}` arrays
  - Each bracket: `{ motorHacmiAlt, motorHacmiUst, yasAlt, yasUst, yillikTutar }`
  - Top-level: `lastUpdated`, `effectiveDate`, `year`
- **How to verify:** Pick a sample vehicle (e.g., 1.6 L benzinli 5-yaşında Otomobil), compute MTV, compare against `/araclar/mtv-hesaplama` UI
- **Source verification:** Cross-check with the official GİB Tebliği PDF before merging
- **Pre-publish checklist:**
  - [ ] All `yillikTutar` values are positive integers
  - [ ] `motorHacmiAlt < motorHacmiUst` for each bracket
  - [ ] `yasAlt < yasUst` for each bracket
  - [ ] `effectiveDate` is in YYYY-MM-DD format
  - [ ] `npm run build` succeeds

### #muayene — Muayene Ücretleri
- **File:** `src/data/muayene.ts`
- **Source:** TÜVTÜRK Muayene Ücret Tarifesi
- **URL:** https://www.tuvturk.com.tr
- **Confidence:** kesin
- **Update frequency:** Annual (early January)
- **What to update:**
  - `vehicleTypes[]` array with `{ aracTipi, ilkMuayene, periyodikMuayene, tekrarMuayene, egzozEmisyon }`
  - `additionalFees{}` for non-standard items
- **Pre-publish checklist:**
  - [ ] All fee values are positive integers
  - [ ] All vehicle types from TÜVTÜRK official tariff present
  - [ ] `effectiveDate` matches the tariff PDF
  - [ ] `npm run build` succeeds

### #yakit — Yakıt Fiyatları (Reference)
- **File:** `src/data/yakit.ts`
- **Source:** PETDER Akaryakıt Fiyat Ortalamaları
- **URL:** https://www.petder.org.tr
- **Confidence:** yaklaşık
- **Update frequency:** Monthly recommended (prices fluctuate)
- **What to update:**
  - `fuelTypes[]`: per fuel type `{ id, name, displayName, symbol, price, unit }`
  - `vehicleConsumption[]`: per vehicle `{ id, brand, model, year, fuelType, consumption, co2 }`
  - Top-level: `lastUpdated`, `effectiveDate`
- **How to verify:** Sanity check the unit price against current Turkey average (PETDER website)
- **Pre-publish checklist:**
  - [ ] Prices are within ±10% of current PETDER published average
  - [ ] No fuel type has price = 0
  - [ ] `unit` matches `pricePerUnit` display string
- **Note:** This is the **reference** price. Users can override on the
  /araclar/yakit-hesaplama page (Sprint C P11 added the override UX).

### #otoyol-routes — Otoyol Tarifeleri (route-based, eski)
- **File:** `src/data/otoyol.ts`
- **Source:** KGM 2026 HGS/OGS Ücret Tarifesi
- **URL:** https://www.kgm.gov.tr
- **Confidence:** kesin
- **Status:** **LEGACY**. Used by `/araclar/otoyol-hesaplama` route-based view.
- **Update frequency:** Annual or when KGM publishes a new tariff
- **Pre-publish checklist:** Cross-check with `src/data/routes/toll-segments.ts` (the new format)

### #otoyol-segments — Otoyol/Köprü Segmentleri (route engine)
- **File:** `src/data/routes/toll-segments.ts`
- **Source:** KGM resmi tarifesi (köprüler), tahmini segmentler (otoyollar)
- **URL:** https://www.kgm.gov.tr
- **Confidence:** Per-segment (kesin for bridges, tahmini for highway segments)
- **Update frequency:** Annual or when bridge/tunnel fees change
- **What to update:**
  - `tollSegments[]` array with `{ id, name, type, effectiveDate, sourceLabel, sourceUrl, confidence, vehicleClassFees, nightDiscount? }`
- **Pre-publish checklist:**
  - [ ] Each bridge/tunnel has `confidence: 'kesin'`
  - [ ] Each highway segment has `confidence: 'tahmini'`
  - [ ] `vehicleClassFees['1']` is set for every segment
  - [ ] `effectiveDate` is in YYYY-MM-DD format
  - [ ] After update, run `npx tsx src/lib/route/__tests__/route-engine.test.ts`
        and `graph-connectivity.test.ts` to confirm no regression

### #araclar — Araç Veritabanı
- **File:** `src/data/araclar.ts`
- **Source:** OYDER + manufacturer data
- **URL:** https://www.oyder.org.tr
- **Confidence:** yüksek
- **Update frequency:** Quarterly recommended (vehicle prices change)
- **What to update:**
  - `vehicles[]` array with full vehicle records (brand, model, engineSize, fuelType, avgConsumption, avgMarketPrice, segment, year ranges, etc.)
- **Pre-publish checklist:**
  - [ ] Each vehicle has all required fields
  - [ ] `avgMarketPrice` reflects current market (sample 5 vehicles)
  - [ ] `avgConsumption` matches WLTP if available
  - [ ] `npm run build` succeeds

### #noter — Noter Ücretleri
- **File:** `src/data/noter.ts`
- **Source:** Adalet Bakanlığı / Noterler Birliği 2026 Tarifesi
- **URL:** https://www.noterlerbirligi.org.tr
- **Confidence:** kesin
- **Update frequency:** Annual
- **Pre-publish checklist:**
  - [ ] All `services[]` entries have `nonResidual` and `residual` rates if applicable
  - [ ] `effectiveDate` is in YYYY-MM-DD format

### #amortisman — Amortisman Oranları
- **File:** `src/data/amortisman.ts`
- **Source:** OYDER Sektör Verileri ve İkinci El Pazar Analizi
- **URL:** https://www.oyder.org.tr
- **Confidence:** tahmini
- **Update frequency:** Annual
- **What to update:**
  - `segments[]` array with year-by-year depreciation rates per segment
- **Note:** This is a model output, not an official tariff. Confidence
  is intentionally `tahmini`. Update only when OYDER publishes new
  sector benchmarks.

---

## How a tariff edit reaches production

```
[1] You edit src/data/mtv.ts
        ↓
[2] npm run build → tsc + lint + 13 route tests + 16 edge cases + 3240 graph pairs + 84 manifest tests pass
        ↓
[3] git add src/data/mtv.ts && git commit
        ↓
[4] git push → opens PR (or direct push to main if you have rights)
        ↓
[5] Reviewer cross-checks against the source PDF (GİB Tebliği), approves
        ↓
[6] Merge to main → Vercel auto-deploy
        ↓
[7] /api/build-info.commit reflects the new commit hash
        ↓
[8] /api/data-status.manifest reflects the new lastUpdated date
        ↓
[9] /araclar/mtv-hesaplama returns the new value
```

Total time: ~3–5 minutes from merge to live, dominated by Vercel build.

---

## Roll back a bad update

```
1. git log --oneline src/data/mtv.ts  # find the bad commit
2. git revert <commit-hash>
3. git push origin main
4. Vercel auto-deploys the revert
5. Verify /api/build-info.commit reflects the revert commit
6. Verify /araclar/mtv-hesaplama returns the old value
```

If the bad value was already in a snapshot users saw, you cannot
"unsend" it. You can:
- Add a banner explaining the temporary error
- Email affected users (if any)
- Document the incident in `delivery/sprint-X/incidents/`

---

## Verification workflow before merge

Mandatory:
```bash
# 1. Type check
npx tsc --noEmit
# Expected: clean, no errors

# 2. Lint (if any rules apply)
npm run lint
# Expected: clean, no warnings besides Next 16 middleware deprecation

# 3. Manifest assertions (catches missing metadata)
npx tsx src/lib/__tests__/data-manifest.test.ts
# Expected: 84 / 84 pass

# 4. Route engine tests (if you touched src/data/routes/* or otoyol)
npx tsx src/lib/route/__tests__/route-engine.test.ts
npx tsx src/lib/route/__tests__/edge-cases.test.ts
npx tsx src/lib/route/__tests__/graph-connectivity.test.ts
# Expected: 34 + 16 + 3240 pass

# 5. Build
npm run build
# Expected: exit 0
```

Optional but recommended:
```bash
# 6. Run dev server, eyeball the affected pages
npm run dev
open http://localhost:3000/araclar/mtv-hesaplama
# Pick 3-5 sample inputs and verify the displayed values match expectations
```

---

## Who can edit what

| Data type | Who edits | How |
|---|---|---|
| All `src/data/*.ts` | Core engineering team | Direct PR |
| `src/data/araclar.ts` | Engineering + content team | PR with reviewer |
| `src/data/mtv.ts`, `src/data/muayene.ts`, `src/data/noter.ts` | Engineering + legal review | PR with PDF cross-check |
| `src/data/routes/toll-segments.ts` | Engineering only (graph topology coupling) | PR with route test pass |
| `src/data/yakit.ts` | Engineering or designated content lead | PR with PETDER cross-check |

---

## When in doubt

- Read `docs/adr/0001-src-data-as-source-of-truth.md` for the WHY
- Read `docs/data-source-truth.md` for the historical fork (Sprint B)
- Check `docs/trust-model.md` for the confidence enum semantics
- Check `delivery/sprint-c/manual-qa.md` for end-to-end validation steps

If a Sprint D introduces a Path B (Supabase as source), this runbook
must be updated and ADR-002 must be written.
