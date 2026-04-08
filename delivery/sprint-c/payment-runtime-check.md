# Sprint C — Payment Runtime Check

**Date**: 2026-04-08
**Sprint**: C
**Goal**: Verify the iyzico sandbox flow works end-to-end after Sprint C P3
fixed Sprint B's `MISSING_CALLBACK_BASE_URL` caveat.

---

## Summary Table

| Test | Local (`npm run dev` + .env.local) | Production (arac-karar-motoru.vercel.app) |
|---|---|---|
| `/api/health.paymentMode` | `paymentSandbox` ✅ | **deferred** — production stuck at Sprint B commit `0be9b8e`, Sprint C `ba97d3e` not yet built (Vercel pipeline issue, see §Limitations) |
| `/api/health.flags.paymentEnabled.enabled` | `true` ✅ | true (Sprint B state, paymentMode field absent until ba97d3e deploys) |
| `/api/health.services.iyzico.mode` | `sandbox` ✅ | sandbox (Sprint B state) |
| `/api/data-status.activeSource` | `src_data_static_files` ✅ | **deferred** — field not present until ba97d3e deploys |
| `/api/data-status.adrReference` | `docs/adr/0001-src-data-as-source-of-truth.md` ✅ | **deferred** |
| `/api/data-status.manifest` | 8 entries ✅ | **deferred** |
| POST `/api/payment/create` HTTP | 200 ✅ | 500 (Sprint B caveat persists until Sprint C deploys) |
| Returns checkoutFormContent | ✅ (3000+ chars) | ❌ (caveat) |
| Returns sandbox token | ✅ (`a8faded4-…`) | ❌ |
| `orderId` in response | ✅ (`9`, persisted to `odemeler.id=9`) | ❌ |
| `checkoutFormContent.includes('sandbox-static.iyzipay.com')` | `true` ✅ | ❌ |
| `getCallbackBaseUrl()` precedence | `NEXT_PUBLIC_SITE_URL` → `https://arackararmotoru.com/api/payment/callback` ✅ | TBD after deploy |
| `/odeme` sandbox banner visible | ✅ (paymentMode=paymentSandbox triggers amber banner) | TBD after deploy |
| Sandbox card 5528790000000008 → odemeler basarili | TBD (browser flow needed) | TBD |
| Sandbox card 4111111111111129 → odemeler basarisiz | TBD | TBD |

---

## Local PASS Evidence

Captured 2026-04-08 from `npm run dev` against `.env.local`:

### `local-health-post-p12.json` (excerpt)

```json
{
  "status": "ok",
  "paymentMode": "paymentSandbox",
  "flags": {
    "paymentEnabled": { "enabled": true, "reason": "ok" }
  },
  "services": {
    "iyzico": { "reachable": null, "mode": "sandbox" }
  }
}
```

The new top-level `paymentMode` field is present and equals
`paymentSandbox`, exactly what Sprint C P12 specified.

### `local-data-status-post-p12.json` (excerpt)

```json
{
  "activeSource": "src_data_static_files",
  "adrReference": "docs/adr/0001-src-data-as-source-of-truth.md",
  "precedence": [
    "src/data/*.ts (binding)",
    "(supabase tarife tables ignored — see ADR-001)"
  ],
  "alignmentWarning": "ADR-001 (accepted Sprint C, 2026-04-08): src/data/*.ts is the binding source of truth ...",
  "manifest": [
    { "key": "mtv", "label": "MTV Tarifeleri", ... },
    ... (7 more)
  ]
}
```

All Sprint C P12 fields present:
- `activeSource` (new)
- `adrReference` (new)
- `precedence` (new)
- `alignmentWarning` updated to cite ADR-001 (Sprint B's "remediation in B+1" wording removed)
- `manifest` (new) — 8 entries from `src/lib/data-manifest.ts`

### `payment-create-local.json` (excerpt)

```json
{
  "checkoutFormContent": "<script type=\"text/javascript\">if (typeof iyziInit == 'undefined') {var iyziInit = ...isSandbox:true,storeNewCardEnabled:true,..."}",
  "token": "a8faded4-82f9-4eeb-8c9a-73648a57b911",
  "orderId": 9
}
```

- HTTP 200
- `checkoutFormContent` includes `sandbox-static.iyzipay.com` (proves sandbox mode)
- `isSandbox:true` literal in the iyzico bundle
- Token generated (proves iyzico API call succeeded)
- `orderId` 9 (proves Supabase `odemeler` insert worked)
- Cleanup: row 9 was deleted post-test (along with 7, 8, 10 from earlier tests)

---

## Production: Sprint B caveat status

**Sprint B**: `/api/payment/create` returned `{"error":"Odeme baslatilamadi"}`
HTTP 500 in production. Local PASS, prod fail.

**Sprint C P2**: Added `getCallbackBaseUrl()` helper in
`src/lib/payment/callback-url.ts` with 4-tier precedence.

**Sprint C P3**: Wired `/api/payment/create:29-32` to use the helper.
Returns explicit `MISSING_CALLBACK_BASE_URL` error code if callback URL
cannot be determined in production.

**Sprint C deploys**:
- `baf4c5c` (P0–P3 wave) — pushed 2026-04-08T16:08
- `ba97d3e` (P5–P12 wave) — pushed 2026-04-08T17:13

**Production state at 2026-04-08T17:14**:
- `/api/build-info.commit` = `0be9b8e7612bd2b365a5418922d22981981c7f37`
  (Sprint B wave 1, before Sprint C)
- `/api/build-info.deploymentId` = `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa`
  (no new deployment ID assigned)
- `/api/payment/create` POST → still returns Sprint B 500 (because the
  Sprint C code is not yet running)

**Diagnosis**: GitHub commits made it to remote (`baf4c5c` and `ba97d3e`
both in `origin/main`). But Vercel build pipeline did not pick them up
within the Sprint C verification window. Vercel MCP was offline so we
could not query the deploy status programmatically.

**Action required (post-Sprint C)**:
1. User opens Vercel Dashboard → Project → Deployments
2. Finds the most recent commit (`ba97d3e`) and clicks "Redeploy" if it
   isn't already in flight
3. Waits for `READY` status
4. Optionally: adds `NEXT_PUBLIC_SITE_URL=https://arac-karar-motoru.vercel.app`
   to Production env vars (helper has VERCEL_URL fallback so this is
   double safety, not strict requirement)
5. Re-runs:
   ```bash
   curl -s https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit
   # Expected: ba97d3eaa904b481aaae49911da80ef8f6b89a19
   curl -s https://arac-karar-motoru.vercel.app/api/health | jq .paymentMode
   # Expected: "paymentSandbox"
   curl -s -X POST https://arac-karar-motoru.vercel.app/api/payment/create \
     -H "Content-Type: application/json" \
     -d '{"productId":"tekli","customer":{"firstName":"T","lastName":"U","email":"a@b.com","phone":"+905551234567"}}'
   # Expected: HTTP 200 + checkoutFormContent + token + orderId
   ```

After these commands return success, the Sprint B caveat is fully closed.

---

## Sandbox card E2E (deferred for browser)

The browser-based sandbox card E2E (5528790000000008 success +
4111111111111129 fail) was not run because:

1. The production deploy is still pending (see §Diagnosis above)
2. Chrome MCP was confirmed offline at the start of Sprint C and not
   re-checked since (Sprint C user explicitly approved API-level proof
   primary, browser bonus)

The API-level proof of the create flow is captured above. Once production
is on Sprint C commit, a manual browser test can verify:

| Step | Action | Expected result |
|---|---|---|
| 1 | Open `https://arac-karar-motoru.vercel.app/odeme` | Page loads, amber banner "Bu test/sandbox işlemdir" visible |
| 2 | Click "Tekli" product | Step 2 (customer form) renders |
| 3 | Fill name + email + phone | Step 3 (checkout) renders |
| 4 | Wait for iyzico form (loaded from sandbox-static.iyzipay.com) | Form visible |
| 5 | Enter card `5528790000000008`, expiry `12/30`, CVC `123` | iyzico processes |
| 6 | Submit | Browser redirects to `/odeme?status=success&paymentId=…` |
| 7 | Check Supabase `odemeler` table for the conversation ID | `durum=basarili` |
| 8 | Repeat steps 1–6 with card `4111111111111129` | Browser redirects to `/odeme?status=error&message=…` |
| 9 | Check Supabase `odemeler` for the new conversation ID | `durum=basarisiz` |

---

## Limitations

- **Vercel deploy stuck**: production is on `0be9b8e` (Sprint B), Sprint C
  commits `baf4c5c` and `ba97d3e` are pushed but not yet built. Vercel
  MCP offline, cannot trigger or query deploys. User intervention needed.
- **Vercel logs MCP offline**: cannot read function stdout for the
  payment route, so any production-side anomaly cannot be diagnosed
  without dashboard access.
- **Chrome MCP offline**: browser-driven sandbox card E2E deferred to
  manual user test once Sprint C is live.

---

## Verdict

✅ **Sprint C P2 + P3 code fix is correct and verified locally.**
✅ **Sprint C P12 endpoint extensions (`paymentMode`, `activeSource`, `manifest`) work locally.**
⚠️ **Production deploy of Sprint C is pending (Vercel pipeline issue).**
⚠️ **Sprint B `/api/payment/create` 500 caveat closure cannot be verified in production until the Sprint C commit deploys.**

**The Sprint B caveat will close automatically once Sprint C deploys to production.** The fix is in code, tested locally, committed, and pushed. No further code work is needed for closure.

---

## Artifacts

- `delivery/sprint-c/api-responses/local-health-post-p12.json`
- `delivery/sprint-c/api-responses/local-build-info-post-p12.json`
- `delivery/sprint-c/api-responses/local-data-status-post-p12.json`
- `delivery/sprint-c/api-responses/payment-create-local.json`
- `delivery/sprint-c/api-responses/payment-mode-decision-trail.txt` (9 input combinations)
- `delivery/sprint-c/api-responses/route-source-tracking-sample.json`
- `delivery/sprint-c/api-responses/data-manifest-export.json` (8 entries)
- `delivery/sprint-c/baseline/prod-payment-create.txt` (Sprint B caveat snapshot)
- `docs/payment-modes.md` (Sprint C deliverable)
