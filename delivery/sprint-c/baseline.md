# Sprint C — Baseline Capture (P0)

**Date**: 2026-04-08
**Local HEAD at start**: `81d44cbb4796ac2718833ad3da374c7576424082` (Sprint B wave 2 docs commit)
**Production commit**: `0be9b8e7612bd2b365a5418922d22981981c7f37` (Sprint B wave 1)

---

## Summary

Sprint C inherits the following state from Sprint B:

1. ✅ Build parity verified at runtime via `/api/build-info`
2. ✅ Health endpoints (`/api/health`, `/api/build-info`, `/api/data-status`) live
3. ✅ Feature flags centralized in `src/lib/flags.ts`
4. ✅ Payment 6-state machine in `src/lib/payment/state-machine.ts`
5. ✅ Supabase admin user `senalpserkan@gmail.com` seeded
6. ✅ Supabase admin CRUD verified end-to-end (Sprint B P8 Test 3)
7. ✅ Analytics honestly inactive (0 provider scripts in HTML)
8. ✅ `src/data` vs Supabase fork surfaced via `/api/data-status.alignmentWarning`
9. ⚠️ **Open caveat**: `/api/payment/create` returns HTTP 500 in
   production (Sprint B caveat #1)
10. ⚠️ **Open caveat**: `src/data` vs Supabase fork **decided but not
    yet bound** (Sprint B caveat #2)
11. ⚠️ **Open caveat**: Tarife update workflow **not yet documented**
    (Sprint B caveat #3)

---

## Pre-Sprint-C verification curls (Sprint C P0)

```bash
$ curl -s https://arac-karar-motoru.vercel.app/api/health
{
  "status": "ok",
  "timestamp": "2026-04-08T15:48:48.416Z",
  "flags": {
    "paymentEnabled":   { "enabled": true,  "reason": "ok" },
    "adminWriteEnabled":{ "enabled": true,  "reason": "ok" },
    "analyticsEnabled": { "enabled": false, "reason": "unknown" },
    "routeV3Enabled":   { "enabled": true,  "reason": "ok" },
    "pdfEnabled":       { "enabled": true,  "reason": "ok" }
  },
  "services": {
    "supabase": { "reachable": true, "latencyMs": 1034 },
    "iyzico":   { "reachable": null, "mode": "sandbox" }
  }
}
```

Note: no `paymentMode` field at top level (Sprint C P12 will add it).

```bash
$ curl -s https://arac-karar-motoru.vercel.app/api/build-info
{
  "commit": "0be9b8e7612bd2b365a5418922d22981981c7f37",
  "commitShort": "0be9b8e",
  "commitMessage": "feat(sprint-b): health endpoints + feature flags + payment state machine",
  "branch": "main",
  "env": "production",
  "builtAt": "2026-04-08T15:48:48.825Z",
  "nextVersion": "16.2.2",
  "nodeVersion": "24.13.0",
  "deploymentId": "dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa",
  "region": "iad1"
}
```

```bash
$ curl -s -X POST https://arac-karar-motoru.vercel.app/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"productId":"tekli","customer":{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+905555555555"}}' \
  -w "\nHTTP:%{http_code}\n"
{"error":"Odeme baslatilamadi"}
HTTP:500
```

**Sprint B caveat persists**: production /api/payment/create still
returns 500. This is the bug Sprint C P3 fixes.

---

## Capture artifacts

- `baseline/git-rev-parse-head.txt` — `81d44cbb4796ac2718833ad3da374c7576424082`
- `baseline/prod-health.json` — full /api/health snapshot
- `baseline/prod-build-info.json` — full /api/build-info snapshot
- `baseline/prod-data-status.json` — full /api/data-status snapshot
- `baseline/prod-payment-create.txt` — Sprint B caveat snapshot

---

## What Sprint C inherits but does NOT modify

These are Sprint A/B artifacts that Sprint C explicitly preserves:

- `src/lib/flags.ts` — Sprint B feature flag system
- `src/lib/payment/processor.ts` — Sprint A iyzico SDK wrapper (lazy loaded)
- `src/lib/payment/config.ts` — Sprint A env presence check
- `src/lib/payment/state-machine.ts::derivePaymentState` — Sprint B 6-state machine (Sprint C only adds `getPaymentMode` next to it)
- `src/lib/supabase.ts` — Sprint A admin + public client setup
- `src/middleware.ts` — Next.js 16 deprecation warning ignored, defer to a dedicated sprint
- `src/data/**` — all 7 data files preserved (Sprint C reads, doesn't modify)
- `src/lib/route/{graph-search,haversine}.ts` — graph topology spine
- `src/data/routes/{graph,toll-segments}.ts`, `src/data/locations/*.ts` — graph data
- `src/lib/route/__tests__/*.test.ts` — must keep passing without modification
- `delivery/sprint-b/**/*` — Sprint B historical record
- `scripts/sprint-b-{admin-seed,crud-prod-sync}.mjs` — Sprint B regression scripts (Sprint C runs them as smoke tests)

---

## Decisions taken in Sprint C P0 / P1

| Decision | Outcome | Source |
|---|---|---|
| ADR-001 source-of-truth | A: src/data binding, admin tarife tabs hidden | User Phase 3 question 1 |
| Callback URL strategy | Helper VERCEL_URL fallback + manual NEXT_PUBLIC_SITE_URL | User Phase 3 question 2 |
| iyzico E2E proof type | API-level primary, browser bonus | User Phase 3 question 3 |
