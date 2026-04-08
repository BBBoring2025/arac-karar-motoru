# Sprint C — Vercel Environment Variables Audit

**Verified**: 2026-04-08 (post Sprint C P3 + P12 commits)
**Source of truth**: inferred from `/api/health` and Sprint C P0 baseline.
**Never committed**: actual values. This file lists **names only**.

## Production scope (after Sprint B P7 + Sprint C)

| Name | Status | Sprint added | Observed via |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ set | pre-Sprint A | `/api/health.services.supabase.reachable=true` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ set | pre-Sprint A | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ set | Sprint B P7 | `/api/health.flags.adminWriteEnabled.enabled=true` |
| `IYZICO_API_KEY` | ✅ set | Sprint B P7 | `/api/health.flags.paymentEnabled.enabled=true` |
| `IYZICO_SECRET_KEY` | ✅ set | Sprint B P7 | Same |
| `IYZICO_BASE_URL` | ✅ set | Sprint B P7 | `/api/health.services.iyzico.mode="sandbox"` |
| `NEXT_PUBLIC_SITE_URL` | ⚠️ **recommended for Sprint C** | Sprint C P3 (manual user step) | Sprint C `getCallbackBaseUrl()` falls back to `VERCEL_URL` if missing |

## Vercel-injected (automatic, no action needed)

| Name | Used by Sprint C |
|---|---|
| `VERCEL_GIT_COMMIT_SHA` | `/api/build-info.commit` (Sprint B), Sprint C parity verification |
| `VERCEL_GIT_COMMIT_REF` | `/api/build-info.branch` |
| `VERCEL_ENV` | `/api/build-info.env`, `getCallbackBaseUrl()` precedence (NODE_ENV check) |
| `VERCEL_DEPLOYMENT_ID` | `/api/build-info.deploymentId` |
| `VERCEL_REGION` | `/api/build-info.region` |
| `VERCEL_GIT_COMMIT_MESSAGE` | `/api/build-info.commitMessage` |
| **`VERCEL_URL`** | **Sprint C P2: `getCallbackBaseUrl()` fallback chain** |

## Sprint C — Recommended manual env addition

```
NEXT_PUBLIC_SITE_URL = https://arac-karar-motoru.vercel.app
Scope: Production (checked)
```

### Why?

The Sprint C P2 helper (`src/lib/payment/callback-url.ts`) uses this
precedence:

1. `NEXT_PUBLIC_SITE_URL` (preferred — explicit)
2. `https://${VERCEL_URL}` (auto-injected by Vercel — safe fallback)
3. `http://localhost:3000` (only when `NODE_ENV !== 'production'`)
4. throws `MissingCallbackBaseUrlError` (production with neither set)

**Without `NEXT_PUBLIC_SITE_URL`**: helper uses `VERCEL_URL` →
`https://arac-karar-motoru-{git-hash}.vercel.app` → callback URL is
deploy-specific. iyzico sandbox accepts this but the URL changes per
deploy.

**With `NEXT_PUBLIC_SITE_URL`**: helper uses the stable canonical
domain → callback URL is the same across deploys. **Recommended for
production stability**.

### How to add (manual step, ~30 seconds)

1. Open Vercel Dashboard: https://vercel.com/<team>/arac-karar-motoru/settings/environment-variables
2. Click "Add New"
3. Name: `NEXT_PUBLIC_SITE_URL`
4. Value: `https://arac-karar-motoru.vercel.app` (or the custom domain `https://arackararmotoru.com` if/when promoted)
5. Scope: **Production** (checkbox)
6. Click Save
7. Trigger redeploy (Dashboard → Deployments → latest → Redeploy)

After redeploy, `getCallbackBaseUrl()` will use the explicit value
instead of the dynamic VERCEL_URL.

## Sprint D recommended additions (live payments)

| Name | Why | Priority |
|---|---|---|
| `IYZICO_API_KEY=live-...` | Production iyzico credentials | HIGH (after merchant agreement) |
| `IYZICO_SECRET_KEY=live-...` | Same | HIGH |
| `IYZICO_BASE_URL=https://api.iyzipay.com` | Switch from sandbox to production iyzico endpoint | HIGH |
| `NEXT_PUBLIC_SITE_URL=https://arackararmotoru.com` | Domain match for live payments callback | HIGH |

These are NOT in Sprint C scope. Sprint C stops at sandbox closure.

## Secret-handling discipline

- No env var **values** are committed to git.
- This file contains **names only**.
- `.env.local` is gitignored (verified).
- Sprint B's `delivery/sprint-b/admin-credentials.md` and Sprint C's
  test/proof scripts read from `.env.local` and never print secrets.
- The Sprint C ZIP snapshot uses `git archive` so it cannot include
  unstaged secret files.
- Sprint C's `payment-create-local.json` artifact contains a sandbox
  token (`a8faded4-…`) which is OK to commit because:
  - It's a one-time iyzico session token, not an API key
  - It's already expired by the time anyone reads the artifact
  - It's clearly labeled as a sandbox transaction
