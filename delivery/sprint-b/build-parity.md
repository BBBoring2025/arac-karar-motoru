# Build Parity Verification — Sprint B P8 Test 1

**Date**: 2026-04-08
**Test**: Verify that the production deployment is running exactly the code at the current git HEAD.

## Method

Compare `git rev-parse HEAD` (authoritative local source of truth) against
`/api/build-info.commit` (runtime value read from `VERCEL_GIT_COMMIT_SHA` at
build time and frozen in the deployed bundle).

Vercel's `VERCEL_GIT_COMMIT_SHA` is injected by the Vercel build pipeline
before `next build` runs, so any mismatch means the deployment does NOT
reflect the current branch tip.

## Results

| Source | Value |
|---|---|
| `git rev-parse HEAD` (local, Sprint B) | `0be9b8e7612bd2b365a5418922d22981981c7f37` |
| `/api/build-info.commit` (production) | `0be9b8e7612bd2b365a5418922d22981981c7f37` |
| Match? | ✅ **YES** |

## Full `/api/build-info` response

```json
{
  "commit": "0be9b8e7612bd2b365a5418922d22981981c7f37",
  "commitShort": "0be9b8e",
  "commitMessage": "feat(sprint-b): health endpoints + feature flags + payment state machine",
  "branch": "main",
  "env": "production",
  "builtAt": "2026-04-08T13:50:07.884Z",
  "nextVersion": "16.2.2",
  "nodeVersion": "24.13.0",
  "deploymentId": "dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa",
  "region": "iad1"
}
```

## Pre-vs-Post Env Flip Comparison

| Field | Pre-env flip (Deploy Run #1) | Post-env flip (Deploy Run #2) |
|---|---|---|
| commit | `0be9b8e` | `0be9b8e` |
| deploymentId | `dpl_Gi5LahvvYHjkRrbrV9QLWofzmULv` (pre Sprint B) → new deploy after P5 | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` |
| builtAt | — | `2026-04-08T13:50:07.884Z` |

Note: The env flip (P7) triggers a Vercel redeploy with new env vars, which
rebuilds the lambda bundles. The commit hash stays identical because the
source code did not change between P5 and P7 — the only thing that changed
was the environment variable set.

## Deploy Parity Truth

**Sprint A residual problem (documented in docs/sprint-b-baseline.md):**
Production was running `3c4d723` (Sprint A commit) while local HEAD was
`dd408ef` (Sprint A delivery docs commit — zero code delta).

**Sprint B resolution:** After P5, production commit === local HEAD every
time, verified at runtime via `/api/build-info` rather than by checking
the Vercel dashboard (which can be stale or misread).

## Artifacts

- `delivery/sprint-b/api-responses/prod-build-info-pre-env.json`
- `delivery/sprint-b/api-responses/prod-build-info-post-env.json`

## Proof Citation

```
$ git rev-parse HEAD
0be9b8e7612bd2b365a5418922d22981981c7f37

$ curl -s https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit
0be9b8e7612bd2b365a5418922d22981981c7f37
```

✅ **P8 Test 1: PASSED**
