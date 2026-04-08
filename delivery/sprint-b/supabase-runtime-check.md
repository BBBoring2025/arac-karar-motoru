# Supabase Runtime Check — Sprint B

**Project**: `fyuxlmcugtdxuvjnzdtu`
**URL**: `https://fyuxlmcugtdxuvjnzdtu.supabase.co`
**PostgreSQL**: 17.x
**Verified**: 2026-04-08

---

## Tables

From `/api/data-status.supabase.tables[]`:

| Table | Sprint B rowCount | RLS status | Writable via service role | Notes |
|---|---|---|---|---|
| `mtv_tarifeleri`    | 0 | ENABLED (public SELECT)     | ✅ | Target of admin CRUD |
| `muayene_ucretleri` | 0 | ENABLED                     | ✅ | Target of admin CRUD |
| `otoyol_ucretleri`  | 0 | ENABLED                     | ✅ | Target of admin CRUD |
| `yakit_fiyatlari`   | 0 | ENABLED                     | ✅ | Target of admin CRUD |
| `araclar`           | 0 | ENABLED (public SELECT)     | ✅ | Admin read-only; user reads `src/data/araclar.ts` |
| `amortisman_oranlari` | 0 | **DISABLED** (from P0 baseline) | ✅ | Tracked for RLS fix sprint |
| `bakim_benchmark`   | 0 | **DISABLED**                | ✅ | Tracked for RLS fix sprint |
| `noter_ucretleri`   | 0 | **DISABLED**                | ✅ | Tracked for RLS fix sprint |
| `kullanicilar`      | 1 (admin) | ENABLED + self-ref | ✅ (via service role; RLS bypasses) | **Admin user seeded in Sprint B P6** |
| `raporlar`          | 0 | ENABLED                     | ✅ | |
| `odemeler`          | 0 | ENABLED                     | ✅ | Test rows cleaned up after Sprint B verification |
| `hesaplama_loglari` | 0 | **DISABLED**                | ✅ | Tracked for RLS fix sprint |
| `b2b_musteriler`    | 0 | **DISABLED**                | ✅ | Tracked for RLS fix sprint |
| `sayfa_goruntulumeleri` | 0 | **DISABLED**            | ✅ | Tracked for RLS fix sprint |

## RLS findings (from P0 baseline, re-verified)

Six tables have `rowsecurity=false`:
1. `hesaplama_loglari`
2. `bakim_benchmark`
3. `amortisman_oranlari`
4. `noter_ucretleri`
5. `b2b_musteriler`
6. `sayfa_goruntulumeleri`

**Sprint B scope**: **REPORT ONLY**. Not fixed. Tracked for a dedicated
Supabase security sprint. Migration file `supabase/migrations/003_enable_missing_rls.sql`
is the recommended fix.

## Migrations

| # | File | Sprint |
|---|---|---|
| 001 | `001_initial_schema.sql` | Pre-Sprint A |
| 002 | `002_add_updated_by.sql` | Pre-Sprint A (adds `updated_by` audit column to tarife tables) |

No new migrations added in Sprint B.

## Admin User Seed (P6)

| Field | Value |
|---|---|
| `kullanicilar.id` | `ee1a3d33-a8a5-4721-8c4e-b2067fe64443` |
| `kullanicilar.auth_id` | `d3cfcc76-58c0-4be2-a344-deb715c5bd9d` |
| `kullanicilar.email` | `senalpserkan@gmail.com` |
| `kullanicilar.rol` | `admin` |
| `auth.users.id` | `d3cfcc76-58c0-4be2-a344-deb715c5bd9d` (created by user via Dashboard before P6) |

Seed method: `scripts/sprint-b-admin-seed.mjs` using `SUPABASE_SERVICE_ROLE_KEY`.

### Seed idempotency

The script checks `maybeSingle()` on `auth_id` before inserting. Re-running
the script is safe — it will report `found: true` instead of inserting a
duplicate.

## CRUD Verification (P8 Test 3)

Timeline proof from `api-responses/admin-crud-prod-sync.json`:

| Step | Action | Production `mtv_tarifeleri.rowCount` |
|---|---|---|
| 1 | Pre-seed snapshot | 0 |
| 2 | INSERT (script) | — |
| 3 | Post-seed snapshot | **1** |
| 4 | DELETE (script) | — |
| 5 | Post-cleanup snapshot | 0 |

**Proof captured**:
- `productionReflectsWrites: true`
- `productionReflectsDeletes: true`
- No caching layer hiding writes
- `/api/data-status` is the real-time authority

Audit column proof (from `admin-crud-run.json`):
- INSERT: `updated_by = senalpserkan@gmail.com`
- UPDATE: `updated_by = senalpserkan@gmail.com`, `auditPathWorks: true`

## Known Quirks

1. **kullanicilar RLS self-reference**: The `kullanicilar` table has
   policies that reference `kullanicilar` in a subquery, which can cause
   PostgreSQL error 42P17 when queried via the anon client without
   bypassing RLS. Sprint B's `/api/health` probes `mtv_tarifeleri` instead
   to avoid this. Service role key bypasses RLS, so admin scripts are
   unaffected.

2. **`raporlar` and `odemeler` query_error in data-status**: These show
   `query_error` in `/api/data-status.supabase.tables` because the
   data-status route uses the anon client for the count probe, and these
   tables require authentication to SELECT. This is expected and safe —
   the route is not meant to bypass RLS; it's meant to report what's
   reachable by an unauthenticated user.

3. **No backup strategy documented**: Sprint B did not verify whether
   Supabase automatic backups are enabled for the Pro plan. Track for a
   separate audit.

## How to run the Supabase advisors

```bash
# With Supabase MCP (when online):
list_advisors(project_id="fyuxlmcugtdxuvjnzdtu", type="security")
list_advisors(project_id="fyuxlmcugtdxuvjnzdtu", type="performance")

# Without MCP (script):
npx supabase --project-ref fyuxlmcugtdxuvjnzdtu advisors list  # (if available)
```

Sprint B Supabase MCP was offline during most of the verification window,
so advisors were not re-captured. P0 baseline has the last known list.
