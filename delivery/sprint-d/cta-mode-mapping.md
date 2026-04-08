# CTA Mode Mapping — Sprint D P5/P6

How the product renders CTAs based on the `paymentMode` × `publicBetaMode` matrix.

## Matrix

| paymentMode | publicBetaMode | Header | Footer | `/odeme` default | `/odeme?mode=sandbox` |
|---|---|---|---|---|---|
| `paymentDisabled` | `true` | BETA pill | disclosure | `<ComingSoon />` | same (param ignored) |
| `paymentDisabled` | `false` | — | — | `<ComingSoon />` | same |
| `paymentSandbox` | `true` (Sprint D state) | BETA pill | disclosure | **`<WaitlistVariant />`** | Sprint C 3-step + amber banner |
| `paymentSandbox` | `false` (launch prep) | — | — | `<WaitlistVariant />` | Sprint C 3-step + amber banner |
| `paymentLive` | `true` | BETA pill | disclosure | Sprint C 3-step (no banner) | same |
| `paymentLive` | `false` | — | — | Sprint C 3-step (no banner) | same |

## Per-state CTA copy

### `paymentDisabled` → `<ComingSoon />`
- Title: "Ödeme Sistemi Hazırlanıyor"
- Body: "Güvenli ödeme altyapımız üzerinde çalışıyoruz"
- CTA: "Ücretsiz Araçlara Git" → `/araclar`

### `paymentSandbox` + public → `<WaitlistVariant />` (Sprint D NEW)
- Title: "🧪 Public Beta — Ödeme henüz aktif değil"
- Body: "Aşağıdaki formu doldurun, ödeme sistemimiz aktif olduğunda size haber verelim"
- CTA: `<EarlyAccessForm source="odeme" />` → POSTs to `/api/early-access`
- Fallback: `/araclar` link

### `paymentSandbox` + `?mode=sandbox` → Sprint C 3-step
- Title: "Bu test/sandbox işlemdir, gerçek para çekilmez"
- Body: Test card cheatsheet (5528790000000008 / 4111111111111129)
- CTA: Sprint C 3-step checkout flow
- sessionStorage: `odeme_mode=sandbox` persists across iyzico redirect

### `paymentLive` → Sprint C 3-step (no banner)
- Title: — (no banner)
- Body: — (go straight to checkout)
- CTA: Sprint C 3-step flow with live iyzico

## Other CTA surfaces (Sprint A)

### Homepage hero (`src/app/page.tsx`)
- "Ücretsiz Hesapla" → `/rapor` (unchanged Sprint A)
- "Örnek Raporu Gör" → `/rapor`
- Sprint D P7 added: `onClick={() => trackPremiumCTA('hero_ucretsiz_hesapla')}` analytics

### Calculator pages
- Bottom CTA: "Karar Raporu Al" → `/rapor` (unchanged Sprint A)

### Rapor page
- PDF download button (unchanged Sprint A)
- "Parametreleri Düzenle" back button
- No direct `/odeme` link (Sprint B discovery)

## Current production state

As of Sprint D deployment:
- `paymentMode === 'paymentSandbox'`
- `publicBetaMode === true` (fail-safe default)

Therefore:
- Header: BETA pill visible
- Footer: "🧪 Public Beta" disclosure visible
- `/odeme` public: waitlist
- `/odeme?mode=sandbox`: Sprint C 3-step + amber banner (admin/test path)
- Callback URLs: Sprint C `<PaymentResult />` handles success/failure correctly

## When live launch flips this matrix

Set `PUBLIC_BETA_MODE=false` + Vercel iyzico env swap:
- `paymentMode` flips to `paymentLive`
- `publicBetaMode` flips to `false`
- Header + Footer beta badges disappear
- `/odeme` public → Sprint C 3-step (live iyzico)
- `?mode=sandbox` query becomes harmless/unused

## Cross-references

- `src/app/odeme/page.tsx` Sprint D P5 routing
- `src/lib/payment/state-machine.ts::getPaymentMode` Sprint C P2
- `src/lib/flags.ts::publicBetaMode` Sprint D P1
- `src/components/layout/{Header,Footer}.tsx` Sprint D P6
- `docs/payment-modes.md` Sprint C
- `docs/public-beta-policy.md` Sprint D
