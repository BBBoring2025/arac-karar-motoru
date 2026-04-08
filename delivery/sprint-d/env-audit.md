# Sprint D — Environment Variables Audit

## Vercel Production env vars (as of Sprint D planning)

Names only. Values never committed.

### Inherited from Sprint A/B/C (unchanged)

| Name | Required for | Sprint added |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client | A |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon reads | A |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin writes, /api/early-access insert | B P7 |
| `IYZICO_API_KEY` | iyzico checkout init | B P7 |
| `IYZICO_SECRET_KEY` | iyzico HMAC signature | B P7 |
| `IYZICO_BASE_URL` | iyzico endpoint (sandbox vs live) | B P7 |
| `NEXT_PUBLIC_SITE_URL` | callback URL fallback (Sprint C helper) | C P3 |

### New in Sprint D (optional, both default-safe)

| Name | Required for | Sprint added | Default if unset |
|---|---|---|---|
| `PUBLIC_BETA_MODE` | beta badge visibility | D P1 | TRUE (fail-safe — badges visible) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics | D P7 | no Plausible script, `analyticsEnabled.reason === 'missing_env'` |

**Neither is strictly required**. Sprint D ships with sensible defaults:
- `PUBLIC_BETA_MODE` missing → beta ON (fail-safe)
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` missing → analytics honest-disabled

## Vercel-injected (automatic)

Read by `/api/build-info` and `src/lib/payment/callback-url.ts`:

- `VERCEL_GIT_COMMIT_SHA`
- `VERCEL_GIT_COMMIT_REF`
- `VERCEL_GIT_COMMIT_MESSAGE`
- `VERCEL_ENV` (`'production'` | `'preview'` | `'development'`)
- `VERCEL_DEPLOYMENT_ID`
- `VERCEL_REGION`
- `VERCEL_URL` (used by `getCallbackBaseUrl` fallback)

No user action required.

## Sprint D recommended user actions

### 1. Add `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (optional but recommended)

```
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=arac-karar-motoru.vercel.app
Scope: Production (checked)
```

Pre-requisite: create a Plausible account at https://plausible.io (30-day
free trial, $9/mo starter after).

After adding: `npx vercel deploy --prod` (to pick up the env var).

Verify: `curl -s https://arac-karar-motoru.vercel.app/ | grep plausible.io`

### 2. Leave `PUBLIC_BETA_MODE` unset (recommended)

The fail-safe default (TRUE) is correct for Sprint D. Explicit
`PUBLIC_BETA_MODE=false` is ONLY for the eventual live launch sprint.

## Sprint E+ env additions (future reference)

When live launch happens:

| Name | Value | Purpose |
|---|---|---|
| `IYZICO_API_KEY` | live-... | live iyzico credentials |
| `IYZICO_SECRET_KEY` | live-... | live iyzico HMAC key |
| `IYZICO_BASE_URL` | `https://api.iyzipay.com` | live iyzico endpoint |
| `PUBLIC_BETA_MODE` | `false` | hide BETA pill + footer disclosure |

All 4 must be set together before "live launch" is verified.

## Secret leak discipline

- Values NEVER committed to git
- `.env.local` gitignored (verified Sprint B)
- `delivery/**` package contains names only, never values
- ZIP snapshots via `git archive` (tracked files only)
- Early access table stores SHA-256 hashed IP, never cleartext
- Plausible is cookie-free (no third-party data leak)

## Artifacts

- `delivery/sprint-d/api-responses/flags-decision-trail.txt` — `getServerFlags()` output for common env states
- `delivery/sprint-d/api-responses/secret-leak-check-sprint-d.txt` — grep all 3 new endpoint responses for secret patterns, expect 0 hits
