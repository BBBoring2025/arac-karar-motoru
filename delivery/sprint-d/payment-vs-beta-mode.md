# Payment Mode vs Beta Mode — Sprint D Clarification

Two independent axes:

## Axis 1: Payment Mode (from `getPaymentMode()`)

Three values. Computed server-side from env vars.

| Value | `IYZICO_*` env | What `/odeme` defaults to |
|---|---|---|
| `paymentDisabled` | unset | Sprint A `<ComingSoon />` |
| `paymentSandbox` | sandbox-* | **Sprint D**: waitlist for public, Sprint C 3-step for `?mode=sandbox` |
| `paymentLive` | live-* + production URL | Sprint C 3-step (same) |

See Sprint C `docs/payment-modes.md` for the flip matrix.

## Axis 2: Public Beta Mode (Sprint D P1)

Two values. Computed from `PUBLIC_BETA_MODE` env var.

| Value | `PUBLIC_BETA_MODE` | BETA pill? | Footer disclosure? |
|---|---|---|---|
| `true` (default) | unset, `true`, `'0'`, anything except `'false'` | ✅ visible | ✅ visible |
| `false` (explicit launch) | literal `'false'` | hidden | hidden |

## Interaction matrix

| Payment × Beta | Header | Footer | /odeme public | /odeme `?mode=sandbox` |
|---|---|---|---|---|
| `paymentSandbox` × `beta=true` | BETA pill | disclosure | **waitlist** | Sprint C 3-step |
| `paymentSandbox` × `beta=false` | no pill | no disclosure | **waitlist** | Sprint C 3-step |
| `paymentLive` × `beta=true` | BETA pill | disclosure | Sprint C 3-step | same |
| `paymentLive` × `beta=false` | no pill | no disclosure | Sprint C 3-step | same |
| `paymentDisabled` × `beta=true` | BETA pill | disclosure | Sprint A `<ComingSoon />` | same |

## Sprint D current state (production)

- `paymentMode === 'paymentSandbox'` (Sprint C)
- `publicBetaMode === true` (Sprint D, fail-safe default)
- Public `/odeme` → waitlist
- Admin `/odeme?mode=sandbox` → Sprint C 3-step iyzico
- Header BETA pill visible
- Footer disclosure visible

## Live launch checklist

To flip out of beta:
1. Obtain iyzico live merchant credentials
2. Set Vercel env: `IYZICO_API_KEY=live-...`, `IYZICO_SECRET_KEY=live-...`, `IYZICO_BASE_URL=https://api.iyzipay.com`
3. Set Vercel env: `PUBLIC_BETA_MODE=false`
4. Redeploy via `npx vercel deploy --prod`
5. Verify `curl /api/health | jq '.paymentMode, .publicBetaMode'` → `"paymentLive", false`
6. BETA pill + Footer disclosure automatically hide
7. `/odeme` public users see the live 3-step checkout

## Cross-references

- `docs/payment-modes.md` — Sprint C 3-mode payment machine
- `docs/public-beta-policy.md` — Sprint D beta definition
- `src/lib/payment/state-machine.ts::getPaymentMode` — Sprint C P2
- `src/lib/flags.ts::publicBetaMode` — Sprint D P1
- `src/app/odeme/page.tsx` — Sprint D P5 routing
