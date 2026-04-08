# Sprint C — Payment Runtime Check

**Date**: 2026-04-08
**Sprint**: C
**Final production deployment**: `dpl_E9YTfCv4X18i7UsWZb79CpBoBkaR`
**Final production commit**: `95bcadc8e6770372e483948b74e5446d3aac56c6`
**Status**: ✅ **Sprint B caveat CLOSED in production**

---

## Summary Table (FINAL)

| Test | Local (`npm run dev` + .env.local) | Production (arac-karar-motoru.vercel.app) |
|---|---|---|
| `/api/health.paymentMode` | `paymentSandbox` ✅ | **`paymentSandbox`** ✅ |
| `/api/health.flags.paymentEnabled.enabled` | `true` ✅ | **`true`** ✅ |
| `/api/health.services.iyzico.mode` | `sandbox` ✅ | **`sandbox`** ✅ |
| `/api/data-status.activeSource` | `src_data_static_files` ✅ | **`src_data_static_files`** ✅ |
| `/api/data-status.adrReference` | `docs/adr/0001-src-data-as-source-of-truth.md` ✅ | **same** ✅ |
| `/api/data-status.manifest` | 8 entries ✅ | **8 entries** ✅ |
| POST `/api/payment/create` HTTP | 200 ✅ | **200** ✅ |
| Returns checkoutFormContent | 2880 chars ✅ | **2885 chars** ✅ |
| Returns sandbox token | ✅ | ✅ (e.g. `d65483a8-8d70-44dc-8701-21281232e564`) |
| `orderId` in response | ✅ (local id=9) | ✅ (prod id=16) |
| `checkoutFormContent.includes('sandbox-static.iyzipay.com')` | `true` ✅ | **`true`** ✅ |

---

## Sprint B caveat CLOSURE — Timeline

Sprint B left a known caveat: `/api/payment/create` returned **HTTP 500
"Odeme baslatilamadi"** in production while the same code worked locally.
Sprint C spent 4 deploys diagnosing and fixing the ACTUAL root cause,
which turned out to be **NOT** the `NEXT_PUBLIC_SITE_URL` issue I
originally suspected.

### Deploy timeline

| # | Deployment ID | Commit | Purpose | Result |
|---|---|---|---|---|
| 1 | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | `0be9b8e` | Sprint B baseline | 500 (caveat) |
| 2 | `dpl_H9442CBxnfjTMHA8msVUExzVBMDU` | `595d7b8` | Sprint C full wave (P0-P14) — `getCallbackBaseUrl()` helper + getPaymentMode + data manifest + admin UI + route source tracking + endpoint extensions | 500 (helper works but DIFFERENT root cause exposed via logs) |
| 3 | `dpl_AjkQDRxg9En54Q2NYMDBiUTQcuqW` | `b683a2d` | 1st attempt: `outputFileTracingIncludes: iyzipay/lib/**` | Still 500 (ENOENT scandir closed, new `Cannot find module 'postman-request'` exposed) |
| 4 | `dpl_E9YTfCv4X18i7UsWZb79CpBoBkaR` | `95bcadc` | **Final fix**: `outputFileTracingIncludes` for 71 iyzipay transitive deps (iyzipay + postman-request + 69 nested) | **200 ✅** |

### Root cause diagnosis

Sprint C deploy #2 surfaced the real error via `vercel logs`:

```
[Payment] Create error: Error: ENOENT: no such file or directory,
  scandir '/var/task/node_modules/iyzipay/lib/resources'
  errno: -2, code: 'ENOENT', syscall: 'scandir',
  path: '/var/task/node_modules/iyzipay/lib/resources'
```

The iyzipay SDK loads its `lib/resources/` folder via
`fs.readdirSync(__dirname + '/resources/')` at runtime. Vercel's `nft`
(node-file-trace) static analyzer cannot follow dynamic fs scans, so
the 50+ resource files (ApiTest.js, CheckoutForm.js,
CheckoutFormInitialize.js, ...) were never included in the lambda
bundle.

After fix #3 (`iyzipay/lib/**` include), deploy #3 exposed the next
layer:

```
[Payment] Create error: Error: Cannot find module 'postman-request'
Require stack:
  /var/task/node_modules/iyzipay/lib/IyzipayResource.js
  /var/task/node_modules/iyzipay/lib/resources/ApiTest.js
  /var/task/node_modules/iyzipay/lib/Iyzipay.js
  ...
```

iyzipay has 71 transitive dependencies through `postman-request`. All
of them needed to be explicitly whitelisted. Final fix #4 walked the
package.json dependency tree recursively and added all 71 packages to
`outputFileTracingIncludes`.

### What Sprint B actually fixed vs what it thought

| Sprint | Thought the bug was | Actually was |
|---|---|---|
| B | iyzico server error + missing env vars | (not diagnosed — prod logs not reachable) |
| C P2/P3 | `NEXT_PUBLIC_SITE_URL` missing → localhost callback rejected | Still wrong; getCallbackBaseUrl() helper IS useful and safer but wasn't the bug |
| C fix #1 | iyzipay resources folder missing from bundle | Correct insight! But incomplete — only added lib, not deps |
| C fix #2 (final) | iyzipay transitive deps (71 packages) missing from bundle | **CORRECT** — closes the caveat |

**Credit**: The `getCallbackBaseUrl()` helper from Sprint C P2 is still
valid and in place. It correctly implements the 4-tier precedence and
surfaces `MISSING_CALLBACK_BASE_URL` explicitly when needed. But it
wasn't the bug Sprint B hit. The bug was a deeper Vercel + Turbopack +
iyzipay dynamic require interaction.

---

## Production PASS Evidence (FINAL)

All endpoint snapshots captured under
`delivery/sprint-c/api-responses/prod-*-final.json` at 2026-04-08T18:10Z.

### `prod-health-final.json` (excerpt)

```json
{
  "status": "ok",
  "timestamp": "2026-04-08T18:10:43.708Z",
  "paymentMode": "paymentSandbox",
  "flags": {
    "paymentEnabled": { "enabled": true, "reason": "ok" },
    "adminWriteEnabled": { "enabled": true, "reason": "ok" },
    "analyticsEnabled": { "enabled": false, "reason": "unknown" },
    "routeV3Enabled": { "enabled": true, "reason": "ok" },
    "pdfEnabled": { "enabled": true, "reason": "ok" }
  },
  "services": {
    "supabase": { "reachable": true, "latencyMs": 777 },
    "iyzico": { "reachable": null, "mode": "sandbox" }
  }
}
```

### `prod-build-info-final.json`

```json
{
  "commit": "95bcadc8e6770372e483948b74e5446d3aac56c6",
  "commitShort": "95bcadc",
  "commitMessage": "fix(sprint-c): outputFileTracingIncludes — full iyzipay transitive dep tree (71 packages)",
  "branch": "main",
  "env": "production",
  "builtAt": "2026-04-08T18:10:44.209Z",
  "nextVersion": "16.2.2",
  "nodeVersion": "24.13.0",
  "deploymentId": "dpl_E9YTfCv4X18i7UsWZb79CpBoBkaR",
  "region": "iad1"
}
```

### `payment-create-prod.json` (excerpt)

```json
{
  "checkoutFormContent": "<script type=\"text/javascript\">if (typeof iyziInit == 'undefined') {var iyziInit = {...isSandbox:true...sandbox-static.iyzipay.com...}",
  "token": "d65483a8-8d70-44dc-8701-21281232e564",
  "orderId": 16
}
```

**HTTP 200** — Sprint B caveat closed.

### `prod-data-status-final.json` (excerpt)

```json
{
  "activeSource": "src_data_static_files",
  "adrReference": "docs/adr/0001-src-data-as-source-of-truth.md",
  "precedence": [
    "src/data/*.ts (binding)",
    "(supabase tarife tables ignored — see ADR-001)"
  ],
  "manifest": [ ... 8 entries ... ],
  "alignmentWarning": "ADR-001 (accepted Sprint C, 2026-04-08): src/data/*.ts is the binding source of truth for all tariff..."
}
```

### Secret leak check (all 4 endpoints)

```
prod-health-final.json:      0 hits
prod-build-info-final.json:  0 hits
prod-data-status-final.json: 0 hits
payment-create-prod.json:    0 hits
```

Pattern searched: `(sb_secret_[A-Za-z0-9_-]{20,}|sandbox-[A-Za-z0-9]{28,})`

---

## Browser sandbox card E2E (still deferred)

Per Sprint C user decision, browser-driven sandbox card E2E
(5528790000000008 / 4111111111111129) is still deferred because Chrome
MCP remained offline through the entire Sprint C verification window.

**However, all API-level proof is in place**:
- `/api/payment/create` returns HTTP 200 with sandbox token in production
- iyzipay SDK loads + calls iyzico sandbox API successfully (the 2885-char
  checkoutFormContent proves the SDK reached iyzico and got a full response)
- `odemeler` row is persisted (orderId=16 etc.)

The next step (manual user verification, ~6 min) is documented in
`manual-qa.md` Test 8. Open `/odeme`, fill the customer form, enter
sandbox card `5528790000000008`, verify the callback redirects to
`/odeme?status=success&paymentId=…` and the `odemeler` row flips to
`basarili`.

---

## Cleanup

Sprint C test rows from the `odemeler` table (ids 7-16 across all
verification runs) were cleaned up post-test via a service-role DELETE.
Post-cleanup row count: 0.

---

## Verdict

✅ **Sprint B caveat closed.**
✅ **Sprint C fully live in production** at commit `95bcadc` (dpl `E9YTfCv4X18i7UsWZb79CpBoBkaR`).
✅ **All 4 endpoints return expected Sprint C state.**
✅ **All secret leak checks pass** (0 hits across 4 endpoints).
✅ **iyzico sandbox create verified via API-level proof** in production.
⏸️ Browser sandbox card E2E deferred per Sprint C user decision.

The 4-proof rule is satisfied for every Sprint C claim:
- **Code**: file path + git commit
- **Runtime**: curl output + production response
- **Deploy**: `dpl_E9YTfCv4X18i7UsWZb79CpBoBkaR`
- **Env**: all Sprint B env vars preserved

---

## Artifacts

- `delivery/sprint-c/api-responses/prod-health-final.json`
- `delivery/sprint-c/api-responses/prod-build-info-final.json`
- `delivery/sprint-c/api-responses/prod-data-status-final.json`
- `delivery/sprint-c/api-responses/payment-create-prod.json`
- `delivery/sprint-c/api-responses/prod-final-summary.txt`
- `delivery/sprint-c/api-responses/local-*-post-p12.json` (local PASS reference)
- `delivery/sprint-c/api-responses/payment-create-local.json` (local HTTP 200)
- `delivery/sprint-c/api-responses/payment-mode-decision-trail.txt` (9 input combinations)
- `delivery/sprint-c/api-responses/route-source-tracking-sample.json`
- `delivery/sprint-c/api-responses/data-manifest-export.json`
- `docs/payment-modes.md` (Sprint C deliverable)
- `next.config.ts` (the actual fix — 71 transitive deps whitelist)
