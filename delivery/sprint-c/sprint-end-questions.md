# Sprint C — Sprint-End Questions

Eight questions, eight cited answers.

---

## Q1 — Production'da çalışan commit hash tam olarak ne?

**A1**: As of 2026-04-08T17:14Z, production is still on Sprint B's
commit `0be9b8e7612bd2b365a5418922d22981981c7f37` (short: `0be9b8e`).
Sprint C's commits `baf4c5cb9bbf5d12dc5d5b8b3a4e5d11119e7a23` (P0–P3) and
`ba97d3eaa904b481aaae49911da80ef8f6b89a19` (P5–P12) have been pushed to
`origin/main` but the Vercel build pipeline did not pick them up within
the Sprint C verification window.

**Citation**:
- Local: `git rev-parse HEAD` → `ba97d3eaa904b481aaae49911da80ef8f6b89a19`
- Production: `curl https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit`
  → `0be9b8e7612bd2b365a5418922d22981981c7f37`
- Artifact: `delivery/sprint-c/baseline/prod-build-info.json`
- Artifact: `delivery/sprint-c/api-responses/local-build-info-post-p12.json`

**Action required from user**: Open Vercel Dashboard → Project →
Deployments → click "Redeploy" on commit `ba97d3e`. After deploy is
READY, the runtime commit will match `ba97d3e` and Sprint B's iyzico
caveat will close automatically.

---

## Q2 — Payment mode şu an ne? (disabled / sandbox / live)

**A2**: **`paymentSandbox`** in code and locally. **Same in production
(after Sprint C deploys)** — env vars from Sprint B (IYZICO_API_KEY,
IYZICO_SECRET_KEY, IYZICO_BASE_URL=sandbox-api.iyzipay.com) remain set.

The new top-level field `/api/health.paymentMode` (Sprint C P12) returns
one of `paymentDisabled` / `paymentSandbox` / `paymentLive`, derived via
`getPaymentMode()` from `src/lib/payment/state-machine.ts`.

**Local proof**:
```json
{
  "paymentMode": "paymentSandbox",
  "flags": { "paymentEnabled": { "enabled": true, "reason": "ok" } },
  "services": { "iyzico": { "reachable": null, "mode": "sandbox" } }
}
```
Source: `delivery/sprint-c/api-responses/local-health-post-p12.json`

**Production proof**: pending Sprint C deploy. After deploy:
```bash
curl -s https://arac-karar-motoru.vercel.app/api/health | jq .paymentMode
# Expected: "paymentSandbox"
```

**Decision trail**: `delivery/sprint-c/api-responses/payment-mode-decision-trail.txt`
shows `getPaymentMode()` output for all 9 input combinations.

---

## Q3 — Sandbox ödeme gerçekten production'da çalışıyor mu?

**A3**: **Local: YES.** **Production: code is fixed, deploy pending.**

**Local PASS** (with `.env.local`):

```bash
$ curl -s -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"productId":"tekli","customer":{"firstName":"Sprint","lastName":"C","email":"sprint-c-local@example.com","phone":"+905555555555"}}'
{
  "checkoutFormContent": "<script type=\"text/javascript\">...isSandbox:true...sandbox-static.iyzipay.com...",
  "token": "a8faded4-82f9-4eeb-8c9a-73648a57b911",
  "orderId": 9
}
```

HTTP 200, sandbox token, orderId persisted to `odemeler` table. The
Sprint C P3 helper (`getCallbackBaseUrl()`) is verified working locally.

**Production**: Sprint B's caveat still applies until Sprint C deploys.
After deploy:
- `/api/payment/create` will use `getCallbackBaseUrl()` → `NEXT_PUBLIC_SITE_URL`
  → `VERCEL_URL` fallback → throws explicit `MISSING_CALLBACK_BASE_URL`
  if neither set
- iyzico sandbox callback will reach the production URL instead of
  the broken localhost fallback

**Browser sandbox card E2E** (5528790000000008 / 4111111111111129):
deferred per user decision (API-level proof primary, browser bonus,
Chrome MCP offline). See `manual-qa.md` Test 8 for the browser steps.

**Citations**:
- `delivery/sprint-c/api-responses/payment-create-local.json`
- `delivery/sprint-c/payment-runtime-check.md`
- `src/lib/payment/callback-url.ts` (the helper)
- `src/lib/payment/__tests__/callback-url.test.ts` (8 test fixtures pass)

---

## Q4 — Live ödeme için şu an eksik olan tek şeyler neler?

**A4**: **Sprint C never pursued live payments.** Live mode (`paymentLive`)
requires the following items, none of which are in Sprint C scope:

1. **Merchant agreement signed** with iyzico (production credentials issued)
2. **KVKK + PCI DSS legal review** complete
3. **Production credentials** (live-* API keys) provisioned
4. **Vercel env swap**:
   - `IYZICO_API_KEY` from sandbox-* to live-*
   - `IYZICO_SECRET_KEY` from sandbox-* to live-*
   - `IYZICO_BASE_URL` from `https://sandbox-api.iyzipay.com` to `https://api.iyzipay.com`
5. **Domain verification**: ensure `NEXT_PUBLIC_SITE_URL` matches the
   merchant-registered domain
6. **First low-amount real transaction** with refund (smoke test)
7. **iyzico merchant dashboard** showing the test transaction
8. **`odemeler` row matching** the iyzico transaction ID

After all 8 items are done, `/api/health.paymentMode` will return
`paymentLive` and the `/odeme` page will not show the amber sandbox
banner.

**Citation**: `docs/payment-modes.md` §4 "Production E2E checklist"
documents this end-to-end.

---

## Q5 — Public sayfalar hangi veri katmanını source-of-truth olarak kullanıyor?

**A5**: **`src/data/*.ts`** (binding via ADR-001).

Sprint C accepted ADR-001 (`docs/adr/0001-src-data-as-source-of-truth.md`)
which binds `src/data/*.ts` as the single source of truth for all tariff
data. The Supabase tarife tables (mtv_tarifeleri, muayene_ucretleri,
otoyol_ucretleri, yakit_fiyatlari, etc.) are explicitly **ignored** by
the user-facing calculators.

The MTV / muayene / otoyol / yakıt admin tabs were hidden in Sprint C P6.
The araclar tab is preserved (read-only, already aligned).

**Runtime proof** (from local /api/data-status, will match production
after Sprint C deploys):

```json
{
  "activeSource": "src_data_static_files",
  "adrReference": "docs/adr/0001-src-data-as-source-of-truth.md",
  "precedence": [
    "src/data/*.ts (binding)",
    "(supabase tarife tables ignored — see ADR-001)"
  ],
  "alignmentWarning": "ADR-001 (accepted Sprint C, 2026-04-08): src/data/*.ts is the binding source of truth ..."
}
```

**Citations**:
- ADR: `docs/adr/0001-src-data-as-source-of-truth.md`
- Endpoint code: `src/app/api/data-status/route.ts`
- Local proof: `delivery/sprint-c/api-responses/local-data-status-post-p12.json`
- Sprint B history: `docs/data-source-truth.md` (Sprint C update section)
- Editorial workflow: `docs/data-update-runbook.md`

**Sprint D opportunity**: ADR-001 is reversible. A future Sprint D may
write `0002-supabase-tariff-source.md` to flip back to Path B (calculators
read from Supabase with cache). Cost estimate: ~4 days.

---

## Q6 — Yakıt, rota ve otoyol tarafında hangi alanlar hâlâ approximate?

**A6**: Sprint C P9/P10 added per-line provenance to make this explicit.
Each `RouteResult` now exposes 4 source dimensions:

| Dimension | Value | Confidence |
|---|---|---|
| `pathDistanceSource` | `graph` / `haversine_offset` / `mixed` | mixed in most routes |
| `tollSource` | `kgm_official` / `estimated_segment` / `mixed` / `none` | per-route |
| `districtOffsetSource` | `{ type: 'haversine_multiplier', multiplier: 1.25 / 1.4 / 1.5 }` | always Haversine × multiplier |
| `fuelPriceSource` | `user_input` / `reference_country` / `reference_city` | depends on user override |

**Sample route** (Kadıköy → Çankaya):

```json
{
  "pathDistanceSource": "mixed",
  "tollSource": "estimated_segment",
  "districtOffsetSource": { "type": "haversine_multiplier", "multiplier": 1.5 },
  "fuelPriceSource": "reference_country",
  "confidence": "tahmini"
}
```

**Approximations that remain**:
- **District offset distance**: always Haversine × multiplier; no real
  road network to/from anchor. Tracked as `districtOffsetSource`.
- **Highway segment tolls**: tahmini for non-bridge/tunnel segments
  (KGM does not publish full per-segment tariffs). Tracked per segment
  via `tollBreakdownItem.confidence`.
- **Fuel price**: PETDER country average unless user overrides. Tracked
  as `fuelPriceSource`.
- **MTV tarife**: snapshot-based. Confidence `kesin` for current GİB
  Tebliği values, but if a new Tebliğ has been published since the
  last manifest update, it would be `lastUpdated` lag, not the engine's
  fault.

**What's exact (kesin)**:
- Bridge fees (Osmangazi, Yavuz Sultan, Avrasya, etc.) — KGM official
- Tunnel fees (Avrasya) — KGM official
- TÜVTÜRK muayene fees — official tariff
- Noter fees — Adalet Bakanlığı tariff

**UI surfacing** (Sprint C P10):
- `RouteConfidenceNote`: 3 source lines visible above the route
  confidence badge
- `TollBreakdownCard`: per-segment confidence badge + sourceUrl link
- `FuelCostCard`: "Sizin fiyatınız" / "Referans (PETDER)" subtitle

**Citations**:
- `src/lib/route/types.ts` (the new fields)
- `src/lib/route/route-engine.ts` (where they're populated)
- `delivery/sprint-c/api-responses/route-source-tracking-sample.json`
- `docs/trust-model.md` (confidence enum semantics, Sprint A)

---

## Q7 — Kullanıcıya gösterilen ama hâlâ tam aktif olmayan ne kaldı?

**A7**: Three things, all surfaced honestly with banners or labels:

1. **Sandbox payment mode**:
   - `/odeme` shows the amber "Bu test/sandbox işlemdir, gerçek para çekilmez" banner
   - Test card cheatsheet visible
   - Real money is NOT charged
   - Sprint C closure: this is the intended state for Sprint C; live mode is a future sprint

2. **Analytics layer**:
   - Code is in (`src/lib/analytics/tracker.ts`) but `analyticsEnabled.enabled = false`
   - 0 provider scripts in production HTML (Sprint B P8 Test 8)
   - Sprint C did NOT change this — `/api/health.flags.analyticsEnabled` still `{ enabled: false, reason: 'unknown' }`
   - Tracking calls are no-ops

3. **MTV tarife snapshot accuracy**:
   - `src/data/mtv.ts` confidence is "kesin" for current values, but the
     accuracy depends on whether the snapshot tracks the latest GİB
     Tebliği. Sprint C added the runbook (`docs/data-update-runbook.md`)
     to make updates atomic and verifiable, but the snapshot itself is
     not re-validated against the live PDF in Sprint C scope.

Honorable mentions (not user-visible but runtime caveats):

- **Vercel deploy of Sprint C is pending**. /odeme behavior, /api/health.paymentMode,
  /api/data-status.activeSource etc. won't appear until the deploy lands.
- **Next.js 16 `middleware → proxy` deprecation**: build warning,
  Sprint C did not fix.

**Citation**: `docs/runtime-status.md` (will be updated post-deploy with
the Sprint C state).

---

## Q8 — Bu sprintten sonra gerçek ödeme açmak için gereken son adımlar neler?

**A8**: Same as Q4 but in execution order, with cross-references:

```
1. (Now)        Complete Sprint C deploy verification:
                  - Trigger Vercel redeploy of ba97d3e
                  - Verify /api/build-info.commit === ba97d3e
                  - Verify /api/payment/create returns HTTP 200 + sandbox token
                  - Browser sandbox card E2E (5528790000000008)

2. (Sprint D)   ADR-002 decision: do we still want live payments?
                  - Business question, not engineering
                  - Validate market need + revenue model

3. (Sprint D)   iyzico merchant agreement
                  - Apply via iyzico merchant portal
                  - Provide company info, bank account, etc.
                  - Receive live-* API keys

4. (Sprint D)   KVKK + PCI DSS legal review
                  - Audit data flow for PII
                  - Confirm odemeler table only stores card last 4 + brand
                  - Document retention policy

5. (Sprint D)   Vercel env swap (production scope only)
                  - IYZICO_API_KEY: sandbox-* → live-*
                  - IYZICO_SECRET_KEY: sandbox-* → live-*
                  - IYZICO_BASE_URL: sandbox URL → https://api.iyzipay.com
                  - Verify NEXT_PUBLIC_SITE_URL matches merchant domain

6. (Sprint D)   Production smoke test
                  - One real low-amount transaction
                  - Refund the transaction
                  - Confirm odemeler.iyzico_payment_id matches the iyzico dashboard

7. (Sprint D)   Public launch
                  - Remove the amber sandbox banner (automatic — paymentMode flips to paymentLive)
                  - Optional: announce the launch
                  - Monitor odemeler row insertion rate
```

**Sprint C does NOT do any of steps 2–7.** Sprint C stops at sandbox
closure. The fix in code is in place; the merchant + legal work is the
gating item.

**Citations**:
- `docs/payment-modes.md` §4 "Production E2E checklist"
- `delivery/sprint-c/payment-runtime-check.md` §"Action required (post-Sprint C)"
- `delivery/sprint-c/manual-qa.md` Test 8 (browser sandbox flow)
