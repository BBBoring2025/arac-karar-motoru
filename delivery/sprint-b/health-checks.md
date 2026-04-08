# Health Endpoints — Sprint B Specifications

Three new endpoints added in Sprint B P2. All three are:

- `GET` only
- `export const runtime = 'nodejs'`
- `export const dynamic = 'force-dynamic'` (never cached)
- Always return HTTP 200 (service down = response field, not HTTP code)
- Never leak secrets (verified in P8 Test 10)

---

## `/api/health`

**Source**: `src/app/api/health/route.ts`
**Purpose**: Overall runtime state + feature flags + service reachability probes.

### Response shape

```json
{
  "status": "ok" | "degraded" | "fail",
  "timestamp": "ISO8601",
  "flags": {
    "paymentEnabled": { "enabled": boolean, "reason": string },
    "adminWriteEnabled": { "enabled": boolean, "reason": string },
    "analyticsEnabled": { "enabled": boolean, "reason": string },
    "routeV3Enabled": { "enabled": boolean, "reason": string },
    "pdfEnabled": { "enabled": boolean, "reason": string }
  },
  "services": {
    "supabase": {
      "reachable": boolean,
      "latencyMs": number,
      "error"?: string
    },
    "iyzico": {
      "reachable": null,   // never actually probed, just mode detect
      "mode": "sandbox" | "production" | "disabled"
    }
  }
}
```

### Probe behavior

- **Supabase**: Runs `SELECT * FROM mtv_tarifeleri LIMIT 0` via the anon
  client (not admin, to avoid any accidental privilege escalation). 2
  second timeout via `Promise.race`. On success: `reachable:true,
  latencyMs`. On error: `reachable:false` + `error` = error code only
  (`.code` from PostgREST or `.name` from thrown Error; never `.message`
  or `.stack`).
- **iyzico**: No network call. Just inspects
  `process.env.IYZICO_BASE_URL` for the substring "sandbox" and reports
  `mode`. `reachable:null` because we don't actually probe iyzico from
  the health endpoint.

### Why `mtv_tarifeleri` not `kullanicilar`?

Sprint B discovered that `kullanicilar` has an RLS self-reference
(`CREATE POLICY ... USING (EXISTS (SELECT ... FROM kullanicilar WHERE ...))`)
that causes PostgreSQL error 42P17 "infinite recursion detected in
policy". Using `mtv_tarifeleri` (which has `CREATE POLICY ... USING
(true)` for SELECT) avoids this. Since the goal is merely to prove the
connection works, any public-read table is fine.

### Never-leak discipline

The full response body was grep-tested for:

- `sb_secret_`, `sb_publishable_` (Supabase key prefixes)
- `sandbox-[a-zA-Z0-9]{20,}` (iyzico key pattern)
- `IYZICO_SECRET`, `SERVICE_ROLE` (env var names)
- `eyJ[a-zA-Z0-9]{30,}` (JWT fragments)

Result: 0 hits. See `api-responses/secret-leak-check-post-env.txt`.

---

## `/api/build-info`

**Source**: `src/app/api/build-info/route.ts`
**Purpose**: Runtime proof of which commit is actually running.

### Response shape

```json
{
  "commit": "0be9b8e7612bd2b365a5418922d22981981c7f37",
  "commitShort": "0be9b8e",
  "commitMessage": "feat(sprint-b): ...",
  "branch": "main",
  "env": "production",
  "builtAt": "2026-04-08T13:50:07.884Z",
  "nextVersion": "16.2.2",
  "nodeVersion": "24.13.0",
  "deploymentId": "dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa",
  "region": "iad1"
}
```

### Source of each field

| Field | Source |
|---|---|
| `commit` | `process.env.VERCEL_GIT_COMMIT_SHA` (injected by Vercel at build time) |
| `commitShort` | Same, sliced to 7 chars |
| `commitMessage` | `process.env.VERCEL_GIT_COMMIT_MESSAGE` |
| `branch` | `process.env.VERCEL_GIT_COMMIT_REF` |
| `env` | `process.env.VERCEL_ENV` |
| `builtAt` | `new Date().toISOString()` at module init time, frozen |
| `nextVersion` | `import nextPkg from 'next/package.json'; nextPkg.version` |
| `nodeVersion` | `process.versions.node` at runtime |
| `deploymentId` | `process.env.VERCEL_DEPLOYMENT_ID` |
| `region` | `process.env.VERCEL_REGION` |

### Parity guarantee

Sprint B P8 Test 1 verified that `commit === git rev-parse HEAD` at the
moment of the last deploy. Any drift would indicate a stale deploy or a
manual branch force-push. The endpoint is the **runtime authority** for
"what commit is actually running."

---

## `/api/data-status`

**Source**: `src/app/api/data-status/route.ts`
**Purpose**: Surface the `src/data` vs Supabase misalignment + show
state of both stores.

### Response shape

```json
{
  "timestamp": "ISO8601",
  "calculationSource": "src_data_static_files",
  "adminCrudTarget": "supabase_tables",
  "alignmentWarning": "...long explanatory string...",
  "supabase": {
    "reachable": true,
    "tables": [
      { "name": "mtv_tarifeleri", "rowCount": 0, "rlsEnabled": null, "writable": true },
      ...
    ]
  },
  "srcDataFiles": {
    "mtv": { "path": "src/data/mtv.ts", "populated": true, "itemCount": 32, "snapshotOf": "...", "effectiveDate": "2026-01-01" },
    ...
  }
}
```

### Why this endpoint exists

Sprint B's most important truth-telling deliverable. Read
`data-source-truth.md` for the full explanation. In short: admin CRUD
writes to Supabase, calculators read from `src/data/*.ts`, these are
two different stores, the misalignment is now surfaced in real time.

### What the fields mean

- `calculationSource` — What the user-facing calculators actually read.
  Fixed string `"src_data_static_files"` to make the claim explicit and
  greppable.
- `adminCrudTarget` — What the admin CRUD code writes to. Fixed string
  `"supabase_tables"` for the same reason.
- `alignmentWarning` — 408-character plain-English explanation. Any
  CI/monitoring tool can detect this string and alert.
- `supabase.tables[]` — Live row counts + RLS + writable state per
  table. If a row shows up here during an admin test write, it proves
  the Supabase path works.
- `srcDataFiles` — For each calculator data file: path, whether
  populated, item count, snapshot source, effective date. Gives
  auditors a way to see which snapshots are live and how old.

### Sprint B P8 Test 3 used this endpoint

The `scripts/sprint-b-crud-prod-sync.mjs` script takes three snapshots
of `/api/data-status` (before seed, after seed, after cleanup) and
asserts that `mtv_tarifeleri.rowCount` transitions through
`0 → 1 → 0`. This is the production-level proof that admin writes
reach Supabase AND that production reflects them in real time.

---

## Where to add future health endpoints

Pattern: `src/app/api/<name>/route.ts` + `export const runtime = 'nodejs'`
+ `export const dynamic = 'force-dynamic'` + strict whitelist response
JSON + error handling that only captures `.code`/`.name`.

Do NOT:
- Leak environment variable values
- Return `.stack`/`.message` from caught errors
- Return HTTP 500 for service degradation (use HTTP 200 + `status:"degraded"`)
- Cache the response (always set `dynamic:'force-dynamic'`)
