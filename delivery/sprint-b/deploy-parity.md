# Deploy Parity — Sprint B

**Sprint A residual gap**: Production was at `3c4d723` (Sprint A code
commit), local HEAD was at `dd408ef` (Sprint A delivery docs-only commit).

**Sprint B resolution**: After P5 deploy run #1, production commit ===
local HEAD. Verified at runtime via `/api/build-info`.

## Deploy Runs

| Run | Deployment ID | Commit (short) | Purpose | Verdict |
|---|---|---|---|---|
| Pre-Sprint-B | `dpl_Gi5LahvvYHjkRrbrV9QLWofzmULv` | `3c4d723` | Sprint A code | Sprint A state |
| P5 (code only) | (see VERCEL_DEPLOYMENT_ID post-P5) | `0be9b8e` | Sprint B feature flags + health endpoints + state machine | Code merged, env not flipped yet |
| P7 (env flip, same code) | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | `0be9b8e` | Same code with added `SUPABASE_SERVICE_ROLE_KEY` + `IYZICO_*` env vars | **Current production** |

## Parity proof

```bash
# Verification (run at any time)
git rev-parse HEAD                                                  # local authority
curl -s https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit  # runtime authority
```

Both produce `0be9b8e7612bd2b365a5418922d22981981c7f37` at time of
Sprint B verification.

## What parity guarantees

- Source code files in production lambda === source code files in local
  repository at HEAD
- Any `src/**` change requires a new commit + push for production to
  see it (environment variable changes alone don't update code)
- `VERCEL_GIT_COMMIT_SHA` is injected by Vercel CLI at build time, not at
  runtime — so a lambda can't "fake" its commit hash after the fact
- `/api/build-info` freezes `builtAt` at module init, so comparing
  multiple responses from the same deployment gives the same `builtAt`

## What parity does NOT guarantee

- That the Supabase database schema matches the code's expectations
  (separate concern: migrations)
- That the environment variables match the code's expectations (separate
  concern: feature flags; see `env-audit.md`)
- That third-party APIs (iyzico, etc.) are in a specific state
- That the lambda cold start is warmed up

## Sprint A gap story

Sprint A delivered docs-only commits on top of the code commit that was
last deployed to production. At the end of Sprint A, the difference was:

```
local HEAD:  dd408ef  "docs(sprint-a): delivery + runtime-status"
production:  3c4d723  "feat(sprint-a): truth alignment + runtime-status-v1"
```

No code difference. But no runtime way to verify that. Sprint B added the
runtime way (`/api/build-info`) and automatically closed the gap at P5
because the new deploy included the newer commit.

## Sprint B verdict

✅ **Parity proven at runtime**
✅ **Parity preserved across the env flip (P7)** — code commit stayed
the same, only env vars changed, new deployment ID but same source tree.
