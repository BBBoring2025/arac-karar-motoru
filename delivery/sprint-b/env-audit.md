# Vercel Environment Variables Audit — Sprint B

**Verified**: 2026-04-08 (after P7 env flip)
**Source of truth**: inferred from `/api/health` and `/api/payment/*` behavior.
**Never committed**: actual values. This file lists **names only**.

## Production scope (required for full operation)

| Name | Status | Observed via |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ set | `/api/health.services.supabase.reachable=true` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ set | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ **set in Sprint B P7** | `/api/health.flags.adminWriteEnabled.enabled=true`, `/api/data-status.supabase.reachable=true` |
| `IYZICO_API_KEY` | ✅ **set in Sprint B P7** | `/api/health.flags.paymentEnabled.enabled=true` |
| `IYZICO_SECRET_KEY` | ✅ **set in Sprint B P7** | Same |
| `IYZICO_BASE_URL` | ✅ **set in Sprint B P7** | `/api/health.services.iyzico.mode="sandbox"` (value contains "sandbox") |
| `NEXT_PUBLIC_SITE_URL` | ❓ **SUSPECTED NOT SET** | `/api/payment/create` returns 500 in prod but 200 locally; most likely root cause is callbackUrl defaulting to `http://localhost:3000` |

## Vercel-injected (automatic, verified via /api/build-info)

| Name | Observed value |
|---|---|
| `VERCEL_GIT_COMMIT_SHA` | `0be9b8e7612bd2b365a5418922d22981981c7f37` |
| `VERCEL_GIT_COMMIT_REF` | `main` |
| `VERCEL_ENV` | `production` |
| `VERCEL_DEPLOYMENT_ID` | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` |
| `VERCEL_REGION` | `iad1` |
| `VERCEL_GIT_COMMIT_MESSAGE` | `feat(sprint-b): health endpoints + feature flags + payment state machine` |

## Sprint B+1 Recommended additions

| Name | Why | Priority |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL=https://arac-karar-motoru.vercel.app` (or `https://arackararmotoru.com`) | Required for iyzico callback URL to be accepted by sandbox | **HIGH** — unblocks iyzico E2E |

## Secret-handling discipline

- No env var **values** are committed to git.
- The delivery package contains this file (names only).
- `.env.local` is gitignored (verified).
- Admin credentials file is gitignored (`delivery/sprint-b/admin-credentials.md`,
  `delivery/**/admin-credentials.md` patterns in `.gitignore`).
- The ZIP snapshot on Desktop is produced via `git archive` which only
  includes tracked files, so secrets cannot leak there.
- Scripts under `scripts/sprint-b-*.mjs` read from `.env.local` and never
  print secret values to stdout; only `.code`/`.name` fields on errors.

## How the env flip was performed (audit trail)

**Step 1** — User went to Vercel Dashboard → Project `arac-karar-motoru` →
Settings → Environment Variables.

**Step 2** — For each of the new variables:

1. Clicked "Add New"
2. Entered the name (uppercase, no whitespace)
3. Pasted the value from local `.env.local`
4. **Scope: Production checkbox CHECKED** (Vercel default is
   Production+Preview+Development; user verified Production was included)
5. Clicked Save

**Step 3** — For `SUPABASE_SERVICE_ROLE_KEY`: user discovered an existing
row was in Preview scope only. **Edited** (not duplicated) to add
Production scope.

**Step 4** — Triggered a redeploy (Dashboard → Deployments → latest →
"Redeploy" button without "Use existing Build Cache" option).

**Step 5** — Sprint B verification ran `/api/health` and confirmed the
flags flipped. `IYZICO_BASE_URL` must contain the substring "sandbox" for
`/api/health.services.iyzico.mode` to report `"sandbox"`. The observed
value confirms this.
