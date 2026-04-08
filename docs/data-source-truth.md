# Data Source Truth — Araç Karar Motoru

**Status**: Known misalignment, documented and surfaced.
**Sprint B evidence**: `GET /api/data-status` on production.
**Related**: `docs/runtime-status.md`, `docs/feature-flags.md`.

## Problem Statement

The Araç Karar Motoru app has **two parallel data stores** but only **one**
is actually read by the user-facing calculators. The admin CRUD UI writes to
the other one. This means:

> **Editing MTV / muayene / otoyol tarifes in the admin panel has zero
> effect on what users see on `/araclar/mtv-hesaplama`,
> `/araclar/muayene-hesaplama`, or `/araclar/yakit-hesaplama`.**

This is a hidden technical-debt misalignment and was one of the main
motivations for Sprint B's runtime verification effort.

## Two Data Stores

### Store A — `src/data/*.ts` (authoritative for calculations)

Hardcoded TypeScript files, bundled into the Next.js build:

| File | Snapshot | Item count | Read by |
|---|---|---|---|
| `src/data/mtv.ts`      | GİB 2026 MTV Tebliği (yaklaşık) | 32 rows  | `src/lib/mtv/calculator.ts:17` → `@/data/mtv` |
| `src/data/muayene.ts`  | TÜVTÜRK 2026 (kesin)            | 8 rows   | `src/lib/muayene/calculator.ts`               |
| `src/data/yakit.ts`    | PETDER 2026 (yaklaşık)          | 4 rows   | `src/lib/yakit/calculator.ts`                  |
| `src/data/araclar.ts`  | OYDER + manufacturer (yüksek)   | 161 rows | `/araclar/*` pages, route engine              |
| `src/data/otoyol.ts`   | KGM 2026 (kesin + tahmini)      | 13 rows  | `src/lib/route/*`                              |

Touching these files requires:
1. Edit the `.ts` file
2. `git commit`
3. `git push`
4. Vercel rebuild + deploy
5. The new values go live

### Store B — Supabase tables (target of admin CRUD)

Server-side Postgres tables, written to by `/api/admin/tarifeleri` route:

| Table | Rows (Sprint B) | Written by |
|---|---|---|
| `mtv_tarifeleri`    | 0 (empty) | `src/app/api/admin/tarifeleri/route.ts` → PUT with `updated_by` |
| `muayene_ucretleri` | 0         | same |
| `otoyol_ucretleri`  | 0         | same |
| `yakit_fiyatlari`   | 0         | same |
| `araclar`           | 0         | (admin UI is read-only for this) |

Editing a row here is a real database write (`updated_by` column audits the
admin email), but the write never reaches the user-facing calculators
because **the calculators never read from Supabase**.

## Proof — Surfaced at Runtime

`GET /api/data-status` (added in Sprint B P2) returns:

```json
{
  "calculationSource": "src_data_static_files",
  "adminCrudTarget":   "supabase_tables",
  "alignmentWarning":  "Admin CRUD writes to Supabase tables that are NOT read by the public calculators. src/data/*.ts files are the authoritative source for all /araclar/* calculation pages. Editing Supabase mtv_tarifeleri / muayene_ucretleri / otoyol_ucretleri has ZERO effect on user-visible calculations. This misalignment is tracked in docs/data-source-truth.md and is a known tech debt. See docs/runtime-status.md for status."
}
```

Sprint B P8 Test 3 proved the Supabase write path works end-to-end:
- INSERT via service role key → row appears in `/api/data-status.tables`
  (rowCount flipped from 0 → 1)
- UPDATE → `updated_by` column set to admin email
- DELETE → rowCount flipped back to 0
- Production read reflects the change in real time (no caching issue)

**But**: the calculator at `/araclar/mtv-hesaplama` returned the exact same
value before and after the test write, because it reads from `src/data/mtv.ts`
regardless of what's in `mtv_tarifeleri`.

This is **the critical insight** Sprint B wanted to surface.

## Impact Table

| Admin action | Supabase write | User-visible effect |
|---|---|---|
| Edit MTV tarife in admin UI          | ✅ Row updated with `updated_by`  | ❌ None — MTV page still reads `src/data/mtv.ts` |
| Edit muayene tarife in admin UI      | ✅ Row updated                    | ❌ None — muayene page still reads `src/data/muayene.ts` |
| Edit otoyol tarife in admin UI       | ✅ Row updated                    | ❌ None — route engine still reads `src/data/otoyol.ts` |
| Edit yakit fiyat in admin UI         | ✅ Row updated                    | ❌ None — yakit page still reads `src/data/yakit.ts` |
| View araclar list in admin UI        | Read-only, reads `src/data/araclar.ts` | ℹ️ Both admin and user read the same file — no fork here |

The **araclar** store is consistent: both admin (read-only) and user read
from `src/data/araclar.ts`. Only MTV / muayene / otoyol / yakit have the
fork.

## Why This Happened

Historical sequence (inferred):

1. Initial prototype used Supabase for everything (typical for a Next.js +
   Supabase starter).
2. At some point, the developer wanted deterministic, versioned tarife values
   for regression testing and PDF reports. Hardcoded TypeScript files were
   added to `src/data/*.ts` as "source of truth snapshots" with an
   effective date and source citation.
3. The calculators were refactored to read from those hardcoded files for
   simplicity and test stability.
4. The admin CRUD code was NOT migrated — it continued to write to Supabase,
   creating the fork.
5. The fork was never noticed because the Supabase tables were empty (no
   production admin user existed) and the two code paths never visibly
   collided.

Sprint B's `/api/data-status` endpoint is the first time this has been
surfaced programmatically.

## Three Paths Forward

### Path A — Code generation from Supabase to `src/data`

Admin UI writes to Supabase → build-time hook generates `src/data/*.ts`
from Supabase content → commits to git → Vercel rebuilds → values go live.

- **Pros**: Single source of truth (Supabase), `src/data` stays in sync
  automatically, deterministic builds preserved.
- **Cons**: Complex build pipeline, requires CI to have Supabase read
  access, admin edits take 1–3 minutes to appear in production (build time).

### Path B — Calculators read from Supabase with cache (Recommended medium-term)

`src/lib/mtv/calculator.ts` fetches from `mtv_tarifeleri` at request time
with 1-hour in-memory cache. Seed Supabase from current `src/data/*.ts`
values.

- **Pros**: Admin edits take effect within 1 hour, single source of truth,
  `src/data/*.ts` can still be used as a regression snapshot (for test mode).
- **Cons**: Cold-start adds Supabase round-trip to every calculator call,
  test mode needs a way to bypass the fetch.

### Path C — Hide admin tarife tabs (Immediate mitigation)

Hide the MTV / muayene / otoyol tabs in the admin sidebar until Path B is
done.

- **Pros**: Zero risk, zero user confusion, one-line UI change.
- **Cons**: Admin users can't edit tarifes at all (consistent with current
  reality where their edits had no effect).

## Sprint B Decision

- **Now**: Document the misalignment in this file and surface it via
  `/api/data-status` (done).
- **Sprint B+1 (next)**: Apply **Path C** — hide the tarife tabs in admin
  sidebar, add a red banner on each tab: "⚠️ Bu sekmede yaptığınız
  değişiklikler production hesaplayıcıları etkilemez. Sprint B+2'de
  düzeltilecek."
- **Sprint B+2 (medium)**: Apply **Path B** — refactor calculators to
  read from Supabase with cache, seed the tables from `src/data/*.ts`.

## Running the Proof Yourself

```bash
# 1. Snapshot before
curl -s https://arac-karar-motoru.vercel.app/api/data-status \
  | jq '.supabase.tables[] | select(.name=="mtv_tarifeleri")'
# Expected: rowCount = 0

# 2. Insert a test row (requires SUPABASE_SERVICE_ROLE_KEY in .env.local)
node scripts/sprint-b-crud-prod-sync.mjs

# 3. During the script, production /api/data-status briefly shows rowCount=1
#    for mtv_tarifeleri, proving the write path is real and production reads
#    reflect it.

# 4. After the script, rowCount returns to 0 (cleanup worked).

# 5. The calculator at /araclar/mtv-hesaplama returns the SAME value before
#    and after — because it reads src/data/mtv.ts, which is unaffected.
```

The `admin-crud-prod-sync.json` artifact under `delivery/sprint-b/api-responses/`
contains the timeline output of step 2.

## Sprint B Verdict

**✅ Misalignment surfaced, documented, and remediation plan written.**
**❌ Misalignment NOT fixed in Sprint B** (intentionally out of scope).

---

## Sprint C Update — ADR-001 Accepted

**Date**: 2026-04-08
**Decision**: **Path A** (`src/data` as binding source of truth) accepted in
[ADR-001](./adr/0001-src-data-as-source-of-truth.md). Path B (Supabase as
source) deferred to Sprint D.

### What changed in Sprint C

1. **`docs/adr/0001-src-data-as-source-of-truth.md` written and accepted**
   — binding decision with full reversibility plan.
2. **Admin tarife tabs hidden** in `src/app/admin/page.tsx`. The
   `'mtv' | 'muayene' | 'otoyol'` tabs no longer appear in the admin UI.
   The `araclar` tab stays visible (already aligned, read-only).
3. **`/api/admin/tarifeleri` route deprecated** with `X-See-ADR` header
   and `console.warn` on every call. Sprint B's regression script
   (`scripts/sprint-b-crud-prod-sync.mjs`) still passes — the route's
   functionality is preserved for back-compat, just marked deprecated.
4. **`docs/data-update-runbook.md` written** — one section per data type,
   with the explicit "edit src/data → PR → Vercel rebuild" workflow.
5. **`src/lib/data-manifest.ts` created** — single typed export of all 8
   data type metadata. Consumers (admin UI, public footer, /api/data-status)
   read from the manifest instead of crawling individual data files.
6. **`/api/data-status.activeSource` field added** with value
   `'src_data_static_files'`. The endpoint also exposes `adrReference`
   pointing to ADR-001.
7. **Public calculator pages got a `<DataSourceFooter>` component** that
   shows source label, effective date, last updated, and confidence
   badge. Backed by the manifest.

### What "Path C in Sprint B+1" used to mean (now obsolete)

The original Sprint B doc suggested "Path C immediate (Sprint B+1)" =
hide tarife tabs as a temporary mitigation. Sprint C executed this
directly via ADR-001 and made it permanent. Sprint B+1 as a separate
sprint never existed.

### When will Sprint D revisit this?

Sprint D may write `0002-supabase-tariff-source.md` to flip back to
Path B if:
- Live tariff edits become a business requirement
- Multiple admin users need to coordinate updates
- A drift detection system is needed between the two stores

The cost estimate is ~4 days (see ADR-001 §Reversibility).

### Cross-references

- [ADR-001](./adr/0001-src-data-as-source-of-truth.md) — the binding decision
- [data-update-runbook.md](./data-update-runbook.md) — the editorial workflow
- `delivery/sprint-c/adr-0001-src-data.md` — copy in delivery package
- `delivery/sprint-c/sprint-end-questions.md` Q5 — answers "which data layer is the source of truth"
