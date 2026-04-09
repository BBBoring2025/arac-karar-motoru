# Sprint D P14 — Deployment Summary

**Deployment ID**: `dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W`
**Production URL**: https://arac-karar-motoru.vercel.app
**Commit**: `9371f75752e0b36de191ee55e53e9806310e3206`
**Branch**: `main`
**Deployed at**: 2026-04-08T21:58:38.182Z
**Region**: `iad1`
**Status**: READY
**Build time**: ~25s on Vercel
**CLI**: `npx vercel deploy --prod --yes` (senalpserkan-4123)

---

## 4-Proof Audit (post-deploy)

### Proof 1 — Code/commit parity

```
$ git rev-parse HEAD
9371f75752e0b36de191ee55e53e9806310e3206

$ curl -s https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit
9371f75752e0b36de191ee55e53e9806310e3206
```

✅ MATCH

### Proof 2 — Runtime new fields present

```json
// /api/health (extract)
{
  "paymentMode": "paymentSandbox",
  "publicBetaMode": true,
  "flags": {
    ...
    "analyticsEnabled": {
      "enabled": false,
      "reason": "missing_env"
    },
    "publicBetaMode": {
      "enabled": true,
      "reason": "ok"
    }
  },
  "dataFreshness": {
    "staleCount": 1,
    "oldestStaleKey": "yakit",
    "oldestStaleDays": 83
  }
}
```

```json
// /api/data-status.dataFreshness (extract)
{
  "generatedAt": "2026-04-08T21:58:40.860Z",
  "totalEntries": 8,
  "staleCount": 1,
  "staleKeys": ["yakit"],
  "staleSummary": [
    {
      "key": "yakit",
      "label": "Yakıt Fiyatları",
      "cadence": "monthly",
      "daysSinceUpdate": 83,
      "maxDaysForCadence": 35,
      "runbookAnchor": "#yakit"
    }
  ]
}
```

✅ All Sprint D new fields present

### Proof 3 — Deployment status

```
vercel deploy --prod --yes →
{
  "deployment": {
    "id": "dpl_Hty7iW3mntNRtrpWWZWiaWLCWu9W",
    "url": "https://arac-karar-motoru-mkvln57yy-senalpserkan-4123s-projects.vercel.app",
    "readyState": "READY",
    "target": "production"
  }
}

Aliased: https://arac-karar-motoru.vercel.app
```

✅ READY + target=production + aliased correctly

### Proof 4 — Env vars (as observed via runtime state)

| Env Var | Set? | Runtime evidence |
|---|---|---|
| `PUBLIC_BETA_MODE` | unset (default TRUE) | `/api/health.publicBetaMode === true`, `flags.publicBetaMode.enabled === true` with `reason: 'ok'` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | unset (user Sprint D decision) | `flags.analyticsEnabled === {enabled: false, reason: 'missing_env'}`; 0 `plausible.io` hits in prod HTML |
| `IYZICO_API_KEY` + `IYZICO_SECRET_KEY` + `IYZICO_BASE_URL` | set (Sprint B/C) | `paymentMode === 'paymentSandbox'` + `flags.paymentEnabled === {enabled: true, reason: 'ok'}` |
| `SUPABASE_SERVICE_ROLE_KEY` | set (Sprint B) | `services.supabase.reachable === true` + `/api/early-access` reaches DB (returns PGRST205 only because table doesn't exist yet) |
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | set (Sprint A) | Supabase handshake returns latency `895ms`, table queries succeed |
| `VERCEL_GIT_COMMIT_SHA` etc. | Vercel auto-injected | `/api/build-info` fully populated |

✅ All required env vars accounted for; 2 Sprint D-optional env vars deliberately unset per user decision

---

## Production JS chunk verification

### `/odeme` page chunk `0ylwmzmqx7t1o.js` (31 KB)

Sprint D markers found:
```
Erken Erişim Listesi     ← WaitlistVariant heading (P5)
amber                    ← Sprint C amber banner text preserved (P5)
early-access             ← POST endpoint URL (P3)
odeme_mode               ← sessionStorage key (P5)
paymentSandbox           ← Sprint C mode (P5)
sandbox modu             ← isAdminTestMode banner text (P5)
trackCheckoutStarted     ← P7 analytics (fires no-op, honest)
trackPaymentFailed       ← P7 analytics
trackPaymentSuccess      ← P7 analytics
waitlist_signup          ← P4 analytics event on form success
```

### MTV calculator page chunk `0mg0bf8gcr0yb.js`

Sprint D markers found:
```
trackCalculation          ← P7 analytics
trackToolOpened           ← P7 analytics
```

---

## HTTP probes summary

| Endpoint | HTTP | Notes |
|---|---|---|
| `GET /` | 200 | Homepage 46156 bytes, BETA pill + Public Beta disclosure present, 0 plausible.io (honest disabled) |
| `GET /odeme` | 200 | /odeme public 21858 bytes, BETA pill + disclosure present, client-rendered waitlist (JS chunk proof above) |
| `GET /odeme?mode=sandbox` | 200 | Same HTML shell as public (client-rendered), JS chunk contains Sprint C 3-step preserved |
| `GET /api/build-info` | 200 | Commit matches HEAD |
| `GET /api/health` | 200 | publicBetaMode + dataFreshness + honest analytics reason all present |
| `GET /api/data-status` | 200 | dataFreshness.staleSummary[0].key === "yakit" |
| `POST /api/early-access` (valid, pre-migration) | 500 | `{"ok":false,"error":"db_error","code":"PGRST205"}` — pre-migration probe (table didn't exist) |
| `POST /api/early-access` (invalid, pre-migration) | 400 | `{"ok":false,"error":"ad_too_short"}` — validation works correctly |
| `POST /api/early-access` (valid, POST-MIGRATION) | ✅ 200 | `{"ok":true,"id":1}` — genel enum, first row |
| `POST /api/early-access` (valid #2, POST-MIGRATION) | ✅ 200 | `{"ok":true,"id":2}` — karsilastirma enum, second row |
| `POST /api/early-access` (invalid, POST-MIGRATION) | ✅ 400 | `{"ok":false,"error":"missing_ad"}` — validation short-circuits before DB call |

---

## User actions status (post-P15)

1. **Apply migration 003**: ✅ DONE — User applied via Supabase Dashboard SQL Editor 2026-04-08. Screenshot confirmed "Success. No rows returned" on CREATE TABLE/INDEX/POLICY batch. Verified by 2 successful `/api/early-access` POSTs (ids 1 and 2).

2. **Plausible env var**: INTENTIONALLY deferred per Sprint D user decision. Honest-disabled state (`reason: 'missing_env'`) is the final Sprint D answer. Future sprint can activate by adding `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=arac-karar-motoru.vercel.app` to Vercel Production and redeploying.

3. **Optional cleanup**: 2 test rows (ids 1 and 2) remain in `erken_erisim` table from post-migration verification. Harmless fake emails, can be left or DELETEd via Dashboard: `DELETE FROM erken_erisim WHERE email IN ('sprintd-postmigration@example.com','sprintd-test2@example.com');`

---

## Desktop artifacts

```
~/Desktop/arac-karar-motoru-sprint-d-9371f75.zip     (682 KB — full repo)
~/Desktop/delivery-sprint-d-9371f75.zip              (74 KB — delivery folder)
```

Secret leak check: ✅ CLEAN (all matches are documentation references to env var NAMES, no JWT/key values)
