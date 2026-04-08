# Admin Update Workflow — Sprint D P10

## Philosophy (ADR-001 bound in Sprint C)

Tariff data is **edited in source files**, not in the admin panel.
The admin panel is **read-only + observability**.

## What admin can do

1. **View dashboard stats** (report count, user count, revenue)
2. **View data manifest** (8 data sources, confidence, dates)
3. **View stale warnings** (Sprint D P10 — yellow card on dashboard)
4. **View early access submissions** (Sprint D P10 — new 4th tab)
5. **View vehicle database** (read-only Sprint C)

## What admin CANNOT do (by ADR-001)

- ❌ Edit MTV tariffs → edit `src/data/mtv.ts` via PR
- ❌ Edit muayene tariffs → edit `src/data/muayene.ts` via PR
- ❌ Edit otoyol tariffs → edit `src/data/otoyol.ts` + `src/data/routes/toll-segments.ts` via PR
- ❌ Edit yakıt prices → edit `src/data/yakit.ts` via PR
- ❌ Edit araç database → edit `src/data/araclar.ts` via PR

All editable paths go through git + Vercel deploy.

## Editorial workflow (from `docs/data-update-runbook.md`)

```
1. Admin opens /admin → Dashboard
2. Stale warning card shows which data is bayat
3. Admin clicks the runbook link next to the stale entry
4. Follows the per-data-type update instructions:
   - Where to find fresh source data
   - Which fields to update
   - How to verify with a local build
5. Admin edits the corresponding src/data/*.ts file (via PR or direct push)
6. Tests must pass locally (3493 assertions)
7. Commit + push to main
8. Vercel auto-deploys (Sprint C manual: CLI deploy)
9. Next /api/data-status.dataFreshness shows the entry is fresh again
```

## When should admin escalate?

- **Supabase schema drift**: If the Supabase tarife tables get out of sync
  with `src/data` snapshots, it's an ADR-001 violation. Alert the team.
- **Stale entries that can't be refreshed quickly**: If a data source
  requires legal review or third-party permission, document in
  `delivery/sprint-X/content-issues.md` and defer.
- **Content drift across sources**: If metodoloji page and data manifest
  disagree, file a Sprint E issue referencing `docs/methodology-parity.md`.

## Related admin endpoints

| Endpoint | Purpose | Sprint |
|---|---|---|
| GET `/api/admin/dashboard` | Stats cards | A |
| GET `/api/admin/tarifeleri?tablo=...` | **DEPRECATED** — Sprint C P6 deprecation headers | A, C |
| PUT `/api/admin/tarifeleri` | **DEPRECATED** — same | A, C |
| GET `/api/admin/early-access` | Sprint D P10 waitlist list | D |

## Cross-references

- ADR: `docs/adr/0001-src-data-as-source-of-truth.md`
- Runbook: `docs/data-update-runbook.md`
- Admin page: `src/app/admin/page.tsx`
- Auth: `src/lib/auth.ts::requireAdmin`
- Policy: `docs/public-beta-policy.md`
