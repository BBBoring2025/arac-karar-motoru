# ADR-001: src/data is the binding source of truth for tariff data

**Status**: Accepted
**Date**: 2026-04-08
**Sprint**: C
**Authors**: Sprint C planning + execution
**Supersedes**: none
**Superseded by**: TBD (Sprint D may write `0002-supabase-tariff-source.md` to flip this)

---

## Context

Sprint B's runtime verification surfaced a hidden architectural fork:

| Layer | What it does | Reads from | Writes to |
|---|---|---|---|
| Public calculators (`/araclar/*`) | Render numbers users see | `src/data/*.ts` (hardcoded TS) | nothing |
| Admin CRUD UI (`/admin`) | Lets admins "edit" tariffs | Supabase tarife tables | Supabase tarife tables |

These two stores are **completely disconnected**. An admin editing
`mtv_tarifeleri` in Supabase produces a real database write with
`updated_by` audit, but the user-visible MTV calculator at
`/araclar/mtv-hesaplama` returns the exact same value before and after
because it reads from `src/data/mtv.ts`.

Sprint B documented this in `docs/data-source-truth.md` and proposed three
remediation paths:

- **Path A**: Codegen Supabase → `src/data` at build time
- **Path B**: Calculators read from Supabase with 1-hour cache
- **Path C**: Hide the misaligned admin tabs entirely (immediate)

Sprint B left the decision unmade, with Path C suggested as the immediate
mitigation and Path B as the medium-term plan.

Sprint C must commit to a binding decision so that:
1. The admin UI stops being theater (or becomes real)
2. The runbook for tariff updates is unambiguous
3. `/api/data-status` can report a single, honest `activeSource`
4. Future code reviews have a clear precedent

## Decision

**`src/data/*.ts` is the binding source of truth for all tariff data through Sprint C.** Supabase tarife tables (`mtv_tarifeleri`,
`muayene_ucretleri`, `otoyol_ucretleri`, `yakit_fiyatlari`,
`amortisman_oranlari`, `bakim_benchmark`, `noter_ucretleri`) are
**ignored** by the user-facing calculators and the admin tabs that wrote
to them are **hidden from the admin UI**.

`araclar` is exempt: both admin (read-only) and public consumers already
read from `src/data/araclar.ts`, so no fork exists for it. The araclar tab
stays visible in the admin UI as a read-only inventory view.

Tariff updates follow this workflow:

```
1. Author edits the relevant src/data/*.ts file
2. Author runs `npm run build` locally to verify TypeScript + tests pass
3. Author opens a PR with the change
4. Reviewer compares against the official source (linked in the manifest)
5. Merge → Vercel auto-deploys → values are live
```

The full per-data-type workflow is documented in
`docs/data-update-runbook.md`.

## Consequences

### Positive

- **Single source of truth.** No more ambiguity about where calculators read from.
- **Honest admin UI.** Admins are not given controls that produce zero user-visible effect.
- **Atomic deploys.** Tariff changes ride on the same git history as code changes; rollback = `git revert`.
- **Test stability.** Existing 3240+106+8 tests run against deterministic data files; no Supabase coupling, no cold-start latency.
- **Type safety.** Each tariff has compile-time type checking via the TypeScript modules.

### Negative

- **No live tariff updates.** Editing a tariff requires a PR + deploy cycle (~3 minutes via Vercel). Cannot do hot edits.
- **No multi-author safety.** Two PRs editing the same tariff file conflict at git level.
- **Admin UI shrinks.** MTV / muayene / otoyol / yakıt edit tabs are hidden. Admins lose UI affordance for tariff edits — they must edit files directly via PR.
- **No audit trail in DB.** `updated_by` column on `mtv_tarifeleri` etc. is no longer the canonical audit; git blame on `src/data/mtv.ts` is.

### Sprint C scope (binding)

- Hide `'mtv' | 'muayene' | 'otoyol'` tabs from `src/app/admin/page.tsx`
- Do NOT delete `/api/admin/tarifeleri` route — Sprint B's regression script still uses it
- Add deprecation header `X-See-ADR: docs/adr/0001-src-data-as-source-of-truth.md` to that route
- Add `console.warn` in the route body when called
- `/api/data-status.activeSource = 'src_data_static_files'`
- `/api/data-status.adrReference = 'docs/adr/0001-src-data-as-source-of-truth.md'`
- Build a typed `src/lib/data-manifest.ts` that re-exports per-data-type metadata so consumers stop crawling individual data files
- Write `docs/data-update-runbook.md` with one section per data type
- Add a `<DataSourceFooter manifestKey={...} />` to every public calculator page

## Reversibility

This ADR is reversible. Sprint D may write `0002-supabase-tariff-source.md`
that supersedes ADR-001 with the following workflow:

1. Seed each Supabase tarife table from the corresponding `src/data/*.ts`
   file (one-time migration script)
2. Refactor each calculator to read from Supabase with a 1-hour in-memory
   cache (Path B)
3. Re-enable the admin tarife edit tabs
4. Update `/api/data-status.activeSource` to `'supabase_tables'`
5. Update `/api/data-status.precedence` accordingly
6. Add an automated drift detection job comparing `src/data/*.ts` snapshots
   against Supabase rows

The cost of doing this in Sprint D is roughly:

- 1 day for the seed migration script
- 1 day for refactoring 4 calculators with the cache layer
- 1 day for cache invalidation tests + cold-start latency benchmarks
- 0.5 day for re-enabling admin UI + new tests
- 0.5 day for drift detection job

Total: ~4 days. This is the right size for a dedicated sprint, not a
slipped scope item in Sprint C.

## Alternatives considered

### Alternative 1: Path B (Supabase as source) in Sprint C

Rejected because:
- Supabase tarife tables are currently empty (Sprint B baseline)
- Requires seeding script + cache layer + 4 calculator refactors
- Adds cold-start latency to all calculator endpoints
- Sprint C scope is verification + closure, not architectural rewrite

Cost: ~4 days. This blew Sprint C's timeline.

### Alternative 2: Path C with admin tabs visible + red banner

Rejected because:
- Sprint B explicitly identified this as "creating cognitive misalignment"
- Admins seeing "edit MTV" tabs but being told the edits don't matter
  is exactly the user-experience problem we're trying to fix
- The runbook gives admins a deterministic, working alternative

Cost: ~2 hours (just CSS). But the long-term maintainability cost of
keeping confused tabs visible is higher.

### Alternative 3: Hybrid (src/data default, Supabase override)

Rejected because:
- Adds precedence logic to every calculator
- Doubles the surface area of bugs (which store has the live value?)
- Requires drift detection between the two stores
- The "override" semantics are confusing — admins can't see at a glance
  whether a tariff is using src/data or a Supabase override

Cost: ~3 days. Lower than Path B but higher than Path A. Decided that
hybrid systems are usually worse than picking one side.

## References

- `docs/data-source-truth.md` — Sprint B's original analysis
- `delivery/sprint-b/data-source-truth.md` — copy preserved in delivery
- `delivery/sprint-b/admin-crud-verification.md` — Sprint B P8 Test 3 evidence
- Sprint C P5 — `src/lib/data-manifest.ts` (the typed manifest layer)
- Sprint C P6 — `src/app/admin/page.tsx` (tab deletion diff)
- Sprint C P12 — `src/app/api/data-status/route.ts` (activeSource + adrReference)
- `docs/data-update-runbook.md` — the workflow this ADR mandates
