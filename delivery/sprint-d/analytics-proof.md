# Analytics Proof — Sprint D P7

## Provider: Plausible Analytics

Chosen over GA4 for:
- Cookie-free (no KVKK/cookie banner required)
- Privacy-first (no IP tracking, no cross-site tracking)
- Free tier (10k pageviews/month) covers public beta
- Already aligned with `src/lib/analytics/tracker.ts` `window.plausible()` call pattern
- 1-line install (one `<Script>` tag in layout.tsx)

## Install

`src/app/layout.tsx` conditionally loads the Plausible script:

```tsx
{process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
  <>
    <Script
      defer
      data-domain={PLAUSIBLE_DOMAIN}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
    <Script id="plausible-init" strategy="afterInteractive">
      {`window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`}
    </Script>
  </>
)}
```

## Runtime detection

`/api/health.flags.analyticsEnabled` reflects reality:

| Env state | `enabled` | `reason` | `missingVars` |
|---|---|---|---|
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=arac-karar-motoru.vercel.app` | `true` | `'ok'` | — |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN='   '` (whitespace) | `false` | `'missing_env'` | `['NEXT_PUBLIC_PLAUSIBLE_DOMAIN']` |
| env var missing | `false` | `'missing_env'` | `['NEXT_PUBLIC_PLAUSIBLE_DOMAIN']` |

Sprint B's `'unknown'` reason was a lie. Sprint D P7 replaces it with a
deterministic env-var check.

## 10 Events Wired (call site audit)

| # | Event | Helper | Call site | Sprint added |
|---|---|---|---|---|
| 1 | `tool_opened/mtv` | `trackToolOpened('mtv')` | `/araclar/mtv-hesaplama/page.tsx` useEffect mount | D P7 |
| 2 | `tool_opened/yakit` | `trackToolOpened('yakit')` | `/araclar/yakit-hesaplama/page.tsx` useEffect mount | D P7 |
| 3 | `tool_opened/otoyol` | `trackToolOpened('otoyol')` | `/araclar/otoyol-hesaplama/page.tsx` useEffect mount | D P7 |
| 4 | `tool_opened/muayene` | `trackToolOpened('muayene')` | `/araclar/muayene-ucreti/page.tsx` useEffect mount | D P7 |
| 5 | `tool_opened/rota` | `trackToolOpened('rota')` | `/araclar/rota-maliyet/page.tsx` useEffect mount | D P7 |
| 6 | `calculation_completed/{mtv,yakit,otoyol,muayene}` | `trackCalculation(tool, meta)` | 4 calc pages, useEffect on input change | D P7 |
| 7 | `route_calculated` | `trackRouteCalculated(start, end, km)` | `/araclar/rota-maliyet/page.tsx` `handleCalculate` | A (existing) |
| 8 | `calculation_error` | `trackError(tool, msg)` | `/araclar/rota-maliyet/page.tsx` catch block | A (existing) |
| 9 | `premium_cta_clicked` | `trackPremiumCTA(location)` | `src/app/page.tsx` homepage hero buttons | D P7 |
| 10 | `checkout_started` | `trackCheckoutStarted(productId, price)` | `src/app/odeme/page.tsx::ProductSelection.handleProductClick` | D P7 |
| 11 | `payment_success` | `trackPaymentSuccess(paymentId, 0)` | `src/app/odeme/page.tsx::PaymentResult` useEffect | D P7 |
| 12 | `payment_failed` | `trackPaymentFailed(paymentId, msg)` | same useEffect | D P7 |
| 13 | `waitlist_signup` | `trackEvent({category:'premium', action:'waitlist_signup'})` | `EarlyAccessForm.tsx` success branch | D P4 |

Sprint D wired 11 new call sites (spec asked for 10; we got one extra free —
`waitlist_signup` was added as part of P4).

## Verification steps (post-P14 deploy)

### 1. HTML source check (Sprint B Test 8 inversion)

```bash
curl -s https://arac-karar-motoru.vercel.app/ | grep -c "plausible.io"
```

**Expected** (if env var set): `>= 1`
**Expected** (if env var not set): `0`

Sprint B documented "0 gtag + 0 plausible" as a gap. Sprint D flips this.

### 2. /api/health reason check

```bash
curl -s https://arac-karar-motoru.vercel.app/api/health | jq .flags.analyticsEnabled
```

**Expected** (env set): `{"enabled": true, "reason": "ok"}`
**Expected** (env not set): `{"enabled": false, "reason": "missing_env"}`

### 3. Plausible dashboard pageview

Open Plausible dashboard for `arac-karar-motoru.vercel.app` domain.
Visit homepage. Wait 30 seconds. Expect ≥1 pageview.

### 4. Custom event check

Visit `/araclar/mtv-hesaplama`. Change the fuel type selector. Wait 60
seconds. Expect the `tool_opened` + `calculation_completed` custom events
in Plausible's "Custom Events" section.

## Env var — user manual step

Sprint D does NOT automate this. User must add to Vercel Production:

```
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=arac-karar-motoru.vercel.app
```

Steps:
1. https://vercel.com → arac-karar-motoru project → Settings → Environment Variables
2. Add variable: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` = `arac-karar-motoru.vercel.app` (scope: Production)
3. Redeploy (the next Vercel deploy picks it up automatically; OR `npx vercel deploy --prod --force`)
4. Run Test 8 in `manual-qa.md` to verify

If the user does NOT add this, Sprint D is still honest — analytics
stays disabled with `reason: 'missing_env'`. No fake "active" claim.

## Honest disabled state (if env var not set)

- No `<Script>` in HTML
- `window.plausible` undefined (tracker.ts fails silently — no crash)
- `/api/health.flags.analyticsEnabled.enabled === false`
- `/api/health.flags.analyticsEnabled.reason === 'missing_env'`
- 10 event call sites exist in code, all no-op
- Next sprint can flip it on by setting the env var + redeploy (1-line change)

## Cross-references

- Sprint A `src/lib/analytics/tracker.ts` (provider abstraction, unchanged)
- Sprint D P7 `src/app/layout.tsx` (conditional Script)
- Sprint D P7 `src/lib/flags.ts::analyticsEnabled` (env detection)
- Sprint D P7 7 page files (event call sites)
- Sprint A `src/lib/analytics/types.ts` (EventCategory enum)
- Plausible docs: https://plausible.io/docs/custom-event-goals

## Sprint D verdict

✅ Code infrastructure ready
✅ 10 events wired (spec asked; got 11)
✅ Honest reason in flags when env missing
⚠️ Plausible account + env var pending user action
⚠️ Dashboard-based event verification pending post-P14 + env var add
