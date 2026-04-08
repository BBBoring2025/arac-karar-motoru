# Sprint C — Sprint-End Questions

Eight questions, eight cited answers.

---

## Q1 — Production'da çalışan commit hash tam olarak ne?

**A1**: **`95bcadc8e6770372e483948b74e5446d3aac56c6`** (short: `95bcadc`)

Deploy via Vercel CLI (`vercel deploy --prod`) — production auto-deploy
webhook had stopped firing for unrelated reasons. 4 deploys total in the
Sprint C verification window:

| # | Deploy | Commit | Outcome |
|---|---|---|---|
| 1 | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | `0be9b8e` (Sprint B) | Baseline |
| 2 | `dpl_H9442CBxnfjTMHA8msVUExzVBMDU` | `595d7b8` (Sprint C full wave) | 500 + new root cause exposed via logs |
| 3 | `dpl_AjkQDRxg9En54Q2NYMDBiUTQcuqW` | `b683a2d` (iyzipay/lib include) | 500 + deeper error |
| 4 | **`dpl_E9YTfCv4X18i7UsWZb79CpBoBkaR`** | **`95bcadc`** (71 transitive deps) | **✅ 200** |

**Citations**:
- Runtime: `curl -s https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit`
  → `95bcadc8e6770372e483948b74e5446d3aac56c6`
- Local: `git rev-parse HEAD` → **MATCH**
- Artifact: `delivery/sprint-c/api-responses/prod-build-info-final.json`
- Build parity PROVEN at runtime.

---

## Q2 — Payment mode şu an ne? (disabled / sandbox / live)

**A2**: **`paymentSandbox`** — verified in production.

The new top-level field `/api/health.paymentMode` (Sprint C P12) returns
one of `paymentDisabled` / `paymentSandbox` / `paymentLive`, derived via
`getPaymentMode()` from `src/lib/payment/state-machine.ts`.

**Production proof** (captured 2026-04-08T18:10:43Z):

```json
{
  "status": "ok",
  "paymentMode": "paymentSandbox",
  "flags": { "paymentEnabled": { "enabled": true, "reason": "ok" } },
  "services": {
    "supabase": { "reachable": true, "latencyMs": 777 },
    "iyzico": { "reachable": null, "mode": "sandbox" }
  }
}
```

Source: `delivery/sprint-c/api-responses/prod-health-final.json`

**Decision trail**: `delivery/sprint-c/api-responses/payment-mode-decision-trail.txt`
shows `getPaymentMode()` output for all 9 input combinations.

---

## Q3 — Sandbox ödeme gerçekten production'da çalışıyor mu?

**A3**: **YES — verified via API-level proof in production.**

### Production PASS

```bash
$ curl -s -X POST https://arac-karar-motoru.vercel.app/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"productId":"tekli","customer":{"firstName":"Sprint","lastName":"C","email":"sprint-c-prod-final@example.com","phone":"+905551234567"}}'

HTTP: 200
{
  "checkoutFormContent": "<script ...isSandbox:true...sandbox-static.iyzipay.com...",
  "token": "d65483a8-8d70-44dc-8701-21281232e564",
  "orderId": 16
}
```

- HTTP 200 ✅
- 2885-char `checkoutFormContent` (full iyzico checkout form bundle)
- Sandbox token generated
- `orderId 16` persisted in `odemeler` table (cleaned up post-test)
- `isSandbox: true` confirmed in the iyzico bundle

Source: `delivery/sprint-c/api-responses/payment-create-prod.json`

### How the caveat was closed (4-deploy diagnosis)

Sprint B's 500 turned out to have a **completely different** root cause
than suspected:

| Suspected (Sprint B) | Actual root cause (Sprint C via vercel logs) |
|---|---|
| `NEXT_PUBLIC_SITE_URL` missing, callback rejected | iyzipay's `lib/resources/*.js` files + 71 transitive deps missing from Vercel lambda bundle (Turbopack nft cannot follow dynamic `fs.readdirSync` + `require()` chain) |

**Fix**: `next.config.ts` → `outputFileTracingIncludes` for
`/api/payment/create` and `/api/payment/callback` routes, explicitly
listing `iyzipay/**` + `postman-request/**` + 69 other transitive deps.

Commit: `95bcadc` (Sprint C fix #2)

### The Sprint C P2 `getCallbackBaseUrl()` helper is still valid

Even though `NEXT_PUBLIC_SITE_URL` turned out not to be the bug, the
Sprint C P2 helper is still in place and active. It correctly implements
4-tier precedence (NEXT_PUBLIC_SITE_URL → VERCEL_URL → localhost dev →
explicit throw in prod) and ships with 8 unit test fixtures. It's the
right long-term hardening for callback URL correctness.

### Browser sandbox card E2E (still deferred)

5528790000000008 / 4111111111111129 browser test deferred per user
decision (API-level proof primary). Chrome MCP remained offline through
the entire Sprint C window. See `manual-qa.md` Test 8 for browser steps.

**Citations**:
- `delivery/sprint-c/api-responses/payment-create-prod.json` (HTTP 200 proof)
- `delivery/sprint-c/api-responses/payment-create-local.json` (local PASS)
- `delivery/sprint-c/payment-runtime-check.md` (full timeline + diagnosis)
- `next.config.ts` (the actual fix — 71 transitive deps whitelist)
- `src/lib/payment/callback-url.ts` (Sprint C P2 helper, still active)
- `src/lib/payment/__tests__/callback-url.test.ts` (8 fixtures)

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
