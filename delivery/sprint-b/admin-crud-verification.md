# Admin CRUD Verification — Sprint B P8 Test 3

**Date**: 2026-04-08
**Goal**: Prove that Supabase write path from admin → DB → runtime is real,
audit-capable, and reflected in production runtime without any cache lag.

## Scope of the proof

1. Admin user exists in `kullanicilar` with `rol='admin'`.
2. INSERT → UPDATE → DELETE cycle on `mtv_tarifeleri` works via service role key.
3. `updated_by` audit column populates correctly.
4. Production `/api/data-status` reflects the writes in real time.

## Method

Run `scripts/sprint-b-admin-seed.mjs` and `scripts/sprint-b-crud-prod-sync.mjs`.
Both read credentials from `.env.local` (gitignored) and use the Supabase
JavaScript client's service role mode (RLS bypass).

## Step 1 — Admin User Seed

```
$ node scripts/sprint-b-admin-seed.mjs
{ step: '1-insert-admin', success: true,
  id: 'ee1a3d33-a8a5-4721-8c4e-b2067fe64443',
  email: 'senalpserkan@gmail.com',
  rol: 'admin' }
```

**Verified**: `kullanicilar` row inserted, linked to Supabase auth user
`d3cfcc76-58c0-4be2-a344-deb715c5bd9d` (created manually via Supabase
Dashboard before the script run).

## Step 2 — CRUD Cycle

```
{ step: '2-seed-mtv',   success: true, id: 1,
  yillik_tutar: 9999.99,
  kaynak: 'SPRINT_B_TEST_DO_NOT_USE',
  updated_by: 'senalpserkan@gmail.com' }

{ step: '3-update-mtv', success: true, id: 1,
  new_yillik_tutar: 10101.01,
  updated_by: 'senalpserkan@gmail.com' }

{ step: '4-verify-mtv', success: true, id: 1,
  yillik_tutar: 10101.01,
  updated_by: 'senalpserkan@gmail.com',
  isUpdated: true,
  auditPathWorks: true }

{ step: '5-cleanup-mtv', success: true }

{ step: '6-verify-cleanup', success: true, rowCount: 0 }
```

**Verified**:
- INSERT writes a row with audit column set.
- UPDATE updates `yillik_tutar` AND `updated_by` (audit re-stamp).
- SELECT reads the updated values.
- DELETE removes the row cleanly.
- Post-cleanup row count returns to 0 (matches pre-test baseline).

## Step 3 — Production Sync Timeline

```
$ node scripts/sprint-b-crud-prod-sync.mjs
```

Output (abbreviated):

```json
{
  "timeline": [
    { "step": 1, "label": "before_seed",    "mtv_rowCount": 0 },
    { "step": 2, "action": "seed_ok", "id": 2 },
    { "step": 3, "label": "after_seed",     "mtv_rowCount": 1 },
    { "step": 4, "action": "delete_ok" },
    { "step": 5, "label": "after_cleanup",  "mtv_rowCount": 0 }
  ],
  "proof": {
    "passed": true,
    "beforeCount": 0,
    "afterSeedCount": 1,
    "afterCleanupCount": 0,
    "productionReflectsWrites":  true,
    "productionReflectsDeletes": true
  }
}
```

**Verified**:
- Before seed: production `/api/data-status` reports `mtv_tarifeleri.rowCount = 0`.
- After seed (a few hundred milliseconds after the script wrote the row):
  production reports `rowCount = 1`. This proves there is **no cache**
  hiding writes and production reads reflect Supabase state in real time.
- After cleanup: production reports `rowCount = 0` again. Symmetrical proof
  for deletes.

## Step 4 — User-Visible Impact (the critical insight)

After `scripts/sprint-b-crud-prod-sync.mjs` the `mtv_tarifeleri` table was
clean (0 rows). But even **during** the window when 1 row existed, the
public calculator at `/araclar/mtv-hesaplama` returned the same value it
always returns — because the calculator reads from `src/data/mtv.ts`, not
from Supabase.

This is the **truth-telling observation** of Sprint B:

> Supabase CRUD is REAL. The production runtime reflects it. But the
> user-facing calculators don't use it. Therefore editing Supabase via the
> admin UI has **zero** user-visible effect. The alignment warning in
> `/api/data-status.alignmentWarning` surfaces this. `docs/data-source-truth.md`
> explains why and what to do next.

## Verdict

✅ **P8 Test 3: PASSED**
- Admin user seeded
- Supabase CRUD cycle works end-to-end with audit column
- Production read reflects writes in real time

⚠️ **Adjunct finding**: write path works but is disconnected from the
calculators. Tracked in `docs/data-source-truth.md`.

## Artifacts

- `delivery/sprint-b/api-responses/admin-crud-run.json`
- `delivery/sprint-b/api-responses/admin-crud-prod-sync.json`
- `scripts/sprint-b-admin-seed.mjs` (reproducible)
- `scripts/sprint-b-crud-prod-sync.mjs` (reproducible)
