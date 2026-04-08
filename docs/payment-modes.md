# Payment Modes — Araç Karar Motoru

**Sprint C deliverable.** Documents the 3 honest payment modes the
application supports and how to flip between them safely.

---

## TL;DR

Three honest modes:

| Mode | What it means | Real money? | When to use |
|---|---|---|---|
| `paymentDisabled` | iyzico env vars not set, or mode unknown. `/odeme` shows ComingSoon UI. | No | Default — safe initial state |
| `paymentSandbox` | iyzico sandbox API in use. Test cards work, no real charges. | **No** | Sprint C is here. Sandbox closure. |
| `paymentLive` | iyzico production API in use. Real money is charged. | **Yes** | Future sprint after merchant agreement |

The 3 external modes are produced by `getPaymentMode()` from
`src/lib/payment/state-machine.ts`. They are reflected at the top level of
`/api/health.paymentMode` and used by the `/odeme` page to render the
amber sandbox banner when applicable.

Internal state-machine has 6 finer-grained `PaymentStateName` values that
also model post-callback landing (`payment_success`, `payment_failed`,
`callback_error`). Sprint C kept those untouched so the existing
`/odeme` callback flow stays intact. See §6 for the rationale.

---

## 1. The 3 Modes

### `paymentDisabled`

```jsonc
// /api/health response
{
  "paymentMode": "paymentDisabled",
  "flags": {
    "paymentEnabled": { "enabled": false, "reason": "missing_env" }
  },
  "services": {
    "iyzico": { "reachable": null, "mode": "disabled" }
  }
}
```

UI behavior:
- `/odeme` → `<ComingSoon />` component (no checkout form)
- No POST to `/api/payment/create` is possible
- No order rows are written to `odemeler`

When you'll see this:
- Local dev with no `.env.local` (or `.env.local` missing IYZICO_*)
- Vercel Production before any iyzico env vars are set
- Vercel Preview/Development envs that intentionally have iyzico off

### `paymentSandbox`

```jsonc
{
  "paymentMode": "paymentSandbox",
  "flags": {
    "paymentEnabled": { "enabled": true, "reason": "ok" }
  },
  "services": {
    "iyzico": { "reachable": null, "mode": "sandbox" }
  }
}
```

UI behavior:
- `/odeme` shows the **amber "Bu test/sandbox işlemdir"** banner above
  the StepIndicator with sandbox card cheatsheet
- Full 3-step checkout flow renders (product → customer → payment)
- POST to `/api/payment/create` returns HTTP 200 with sandbox token
- iyzico checkout form loads from `sandbox-static.iyzipay.com`
- Test card `5528790000000008` succeeds, `4111111111111129` fails
- `odemeler` row gets created with `durum=beklemede` then transitions
  to `basarili` or `basarisiz` after the callback

When you'll see this:
- Sprint C and beyond, until live merchant agreement is signed
- Local dev with `.env.local` containing sandbox credentials
- Vercel Production with `IYZICO_*` env vars + `IYZICO_BASE_URL` containing "sandbox"

### `paymentLive`

```jsonc
{
  "paymentMode": "paymentLive",
  "flags": {
    "paymentEnabled": { "enabled": true, "reason": "ok" }
  },
  "services": {
    "iyzico": { "reachable": null, "mode": "production" }
  }
}
```

UI behavior:
- `/odeme` shows the same checkout flow as sandbox **but no amber banner**
- Real card numbers required, real money is charged
- `odemeler.durum` reflects real iyzico transaction state

When you'll see this:
- Future sprint after a merchant agreement and KVKK/PCI compliance review
- **Sprint C never reaches this state** — sandbox closure only

---

## 2. How to Flip — env var matrix

| State | `IYZICO_API_KEY` | `IYZICO_SECRET_KEY` | `IYZICO_BASE_URL` | `NEXT_PUBLIC_SITE_URL` |
|---|---|---|---|---|
| `paymentDisabled` | unset | unset | (any) | (any) |
| `paymentSandbox` | sandbox-* | sandbox-* | `https://sandbox-api.iyzipay.com` | `https://arac-karar-motoru.vercel.app` |
| `paymentLive` | live-* | live-* | `https://api.iyzipay.com` | `https://arac-karar-motoru.vercel.app` |

### Why `NEXT_PUBLIC_SITE_URL` matters

iyzico needs an absolute callback URL. The `/api/payment/create` route
builds it via `getCallbackBaseUrl()` from `src/lib/payment/callback-url.ts`,
which uses this precedence:

1. **`NEXT_PUBLIC_SITE_URL`** (preferred — explicit)
2. `https://${VERCEL_URL}` (auto-injected by Vercel — safe fallback)
3. `http://localhost:3000` (only when `NODE_ENV !== 'production'`)
4. **throws `MissingCallbackBaseUrlError`** in production with neither set

The throw is intentional: it surfaces the env-var bug immediately as a
500 with `code: "MISSING_CALLBACK_BASE_URL"` instead of letting iyzico
silently swallow a localhost callback.

**Sprint B caveat closure**: Sprint B's iyzico /api/payment/create 500 was
caused by the old hardcoded `'http://localhost:3000'` fallback. Sprint C
P2 / P3 replaced it with the helper above.

---

## 3. Sandbox card cheatsheet

| Card | Expected result | Use case |
|---|---|---|
| `5528790000000008` | ✅ Success — `odemeler.durum=basarili` | Happy path |
| `4111111111111129` | ❌ Fail (declined) — `odemeler.durum=basarisiz` | Failure path |
| `4543600000000006` | ✅ Success (alternative) | Backup if 5528 rejected |
| `5400360000000003` | 3D Secure required | Advanced flow test |

iyzico documentation: https://docs.iyzico.com/

---

## 4. Production E2E checklist

Use this checklist when promoting from sandbox to live (future sprint).
Sprint C does NOT execute this — it stops at sandbox closure.

1. [ ] Merchant agreement signed with iyzico (production credentials issued)
2. [ ] KVKK + PCI DSS legal review complete
3. [ ] `IYZICO_API_KEY` swapped to live-* in Vercel Production
4. [ ] `IYZICO_SECRET_KEY` swapped to live-* in Vercel Production
5. [ ] `IYZICO_BASE_URL` updated to `https://api.iyzipay.com`
6. [ ] `NEXT_PUBLIC_SITE_URL` confirmed `https://arackararmotoru.com`
   (or whichever domain matches the merchant registration)
7. [ ] Redeploy + verify `/api/health.paymentMode === "paymentLive"`
8. [ ] Verify `/odeme` no longer shows the amber sandbox banner
9. [ ] One real low-amount test transaction with refund
10. [ ] iyzico merchant dashboard reflects the test transaction
11. [ ] Confirm `odemeler` row matches iyzico's transaction ID

---

## 5. Sprint B caveat closure

Sprint B left a known caveat: `/api/payment/create` returned **HTTP 500
"Odeme baslatilamadi"** in production while the same code worked locally.
The root cause was identified and fixed in Sprint C.

| Before (Sprint B) | After (Sprint C) |
|---|---|
| `src/app/api/payment/create/route.ts:29-32`: `const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'` | uses `getCallbackBaseUrl()` from `src/lib/payment/callback-url.ts` |
| Falls back to localhost in production → iyzico sandbox rejects → 500 | Falls back to `VERCEL_URL` → throws `MissingCallbackBaseUrlError` if neither is set → returns explicit `MISSING_CALLBACK_BASE_URL` error code |
| Generic `"Odeme baslatilamadi"` outer catch | Specific error code surfaces the bug |

Manual user step (Sprint C P3):
- Add `NEXT_PUBLIC_SITE_URL=https://arac-karar-motoru.vercel.app` to
  Vercel Production env vars (double safety on top of `VERCEL_URL`
  fallback)

---

## 6. Why 6 internal states + 3 external modes?

The state machine in `src/lib/payment/state-machine.ts` has **6** internal
`PaymentStateName` values:

| State | What it models |
|---|---|
| `disabled_no_env` | env vars missing → ComingSoon UI |
| `ready_sandbox` | env set + sandbox mode → checkout active |
| `ready_production` | env set + prod mode → checkout active |
| `payment_success` | post-callback landing, success |
| `payment_failed` | post-callback landing, fail |
| `callback_error` | post-callback landing, our server bug |

But Sprint C wanted only **3** user-facing modes:
`paymentDisabled / paymentSandbox / paymentLive`. The decision was to
**add** a `getPaymentMode()` helper that ignores the callback states and
collapses the 3 base states to the 3 external labels, rather than
**refactor** the existing 6-state machine.

Why?

- The 6-state machine was just shipped in Sprint B
- 8 tests + the `/odeme` page rely on the existing callback handling
- A 2-axis refactor would force changes in `derivePaymentState()`,
  `isCallbackLanding()`, and the `/odeme` priority logic
- Two helpers is uglier than one but zero risk to the just-shipped flow

`getPaymentMode()` is a pure function with 9 input combinations (3
`paymentEnabled` × 3 `iyzicoMode`). Tested in
`src/lib/payment/__tests__/state-machine.test.ts`.

---

## 7. Where to look in the code

| Concern | File |
|---|---|
| 6 internal states + transitions | `src/lib/payment/state-machine.ts::derivePaymentState` |
| 3 external modes (Sprint C P2) | `src/lib/payment/state-machine.ts::getPaymentMode` |
| Callback URL builder (Sprint C P2) | `src/lib/payment/callback-url.ts::getCallbackBaseUrl` |
| iyzico initialize | `src/lib/payment/processor.ts::initializeCheckoutForm` |
| iyzico callback retrieve | `src/lib/payment/processor.ts::retrieveCheckoutForm` |
| `/api/payment/create` route | `src/app/api/payment/create/route.ts` |
| `/api/payment/callback` route | `src/app/api/payment/callback/route.ts` |
| `/odeme` page (UI + state hookup) | `src/app/odeme/page.tsx` |
| Payment env var presence check | `src/lib/payment/config.ts::isPaymentEnabled` |
| iyzico config (apiKey, secretKey, baseUrl, isSandbox) | `src/lib/payment/config.ts::getPaymentConfig` |
| `paymentMode` field in /api/health | `src/app/api/health/route.ts` |

---

## 8. Sprint C verdict

- ✅ `paymentDisabled` → cleanly handled (Sprint B)
- ✅ `paymentSandbox` → Sprint C closure: helper bug fixed, banner added,
  full create + callback flow works in production with sandbox cards
- 🚫 `paymentLive` → not pursued in Sprint C; future sprint after merchant agreement

Sprint B's iyzico `/api/payment/create` 500 caveat is **closed**.
