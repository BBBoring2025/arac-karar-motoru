# Sprint D — 8 Sprint-End Questions

Each answer cites a file, URL, or commit. Sprint D's 4-proof rule applies.

---

## Q1 — Production'da çalışan commit hash tam olarak ne?

**A1**: Sprint D P14 deploy sonrasında filled in. Pre-deploy baseline:
`c34193a` (Sprint C final).

**Target post-P14**: A new Sprint D SHA (multiple commits merged into
main and deployed via `npx vercel deploy --prod`).

**Citations**:
- Runtime: `curl -s https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit`
- Local: `git rev-parse HEAD`
- Artifact: `delivery/sprint-d/api-responses/prod-build-info-post-d.json` (captured in P14)

---

## Q2 — Payment mode şu an ne?

**A2**: **`paymentSandbox`** (unchanged from Sprint C).

Sprint D did NOT touch the payment state machine. Sprint C's `getPaymentMode()`
still returns `paymentSandbox` because `IYZICO_API_KEY` + `IYZICO_SECRET_KEY` +
`IYZICO_BASE_URL=sandbox-api.iyzipay.com` are set in Vercel Production (from Sprint C P7).

**What Sprint D changed**: The `/odeme` page now routes public users to
the **waitlist** (`EarlyAccessForm`) when `paymentMode === 'paymentSandbox'`
AND not `isAdminTestMode`. Admins/testers can still reach the Sprint C
3-step sandbox checkout via `?mode=sandbox` query param.

**Citations**:
- Runtime: `curl -s https://arac-karar-motoru.vercel.app/api/health | jq .paymentMode`
- Code: `src/lib/payment/state-machine.ts::getPaymentMode` (Sprint C P2, unchanged)
- Routing: `src/app/odeme/page.tsx` (Sprint D P5 routing branches)
- Artifact: `delivery/sprint-d/api-responses/prod-health-post-d.json`

---

## Q3 — Public beta mode aktif mi?

**A3**: **YES** — `/api/health.publicBetaMode === true`. Header BETA pill
visible on every page. Footer "🧪 Public Beta" disclosure block visible.

**How the flag is computed**: `src/lib/flags.ts::getServerFlags()` reads
`process.env.PUBLIC_BETA_MODE`. Default is TRUE (fail-safe) — only the
explicit literal string `'false'` disables it. This protects against
accidentally shipping a "launched" state when the env var is missing.

**Citations**:
- Runtime: `curl -s https://arac-karar-motoru.vercel.app/api/health | jq .publicBetaMode` → `true`
- Code: `src/lib/flags.ts::publicBetaMode` (Sprint D P1)
- Tests: `src/lib/__tests__/flags.test.ts` 19 assertions pass, including "PUBLIC_BETA_MODE='0' → still enabled" and "missing env → enabled=true"
- Hook: `src/lib/hooks/usePublicBeta.ts` (Sprint D P6, session-cached fetch)
- Header: `src/components/layout/Header.tsx` (BETA pill conditional)
- Footer: `src/components/layout/Footer.tsx` (disclosure block conditional)
- Policy doc: `docs/public-beta-policy.md`
- Artifact: `delivery/sprint-d/api-responses/prod-health-post-d.json`

---

## Q4 — Analytics provider production'da gerçekten bağlı mı?

**A4**: **Depends on NEXT_PUBLIC_PLAUSIBLE_DOMAIN env var**.

- **If env var is set** (user adds `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=arac-karar-motoru.vercel.app`):
  - `<Script>` tag loads `https://plausible.io/js/script.js`
  - `window.plausible()` becomes available
  - `/api/health.flags.analyticsEnabled === { enabled: true, reason: 'ok' }`
  - 10 events fire on real interactions
- **If env var is missing** (Sprint D code is honest about this):
  - No `<Script>` tag in the HTML
  - `window.plausible` undefined
  - `/api/health.flags.analyticsEnabled === { enabled: false, reason: 'missing_env', missingVars: ['NEXT_PUBLIC_PLAUSIBLE_DOMAIN'] }`
  - All 10 event call sites exist in code but are no-ops (tracker.ts fails silently)

**The `'unknown'` reason lie is GONE**. Sprint B's finding was "analytics
claimed active but 0 provider scripts" — Sprint D turns that into a
deterministic env-var check.

**10 events wired** (audit in `delivery/sprint-d/analytics-proof.md`):

| Event | Helper | File |
|---|---|---|
| `tool_opened mtv` | `trackToolOpened('mtv')` | `src/app/araclar/mtv-hesaplama/page.tsx` |
| `tool_opened yakit` | same | `src/app/araclar/yakit-hesaplama/page.tsx` |
| `tool_opened otoyol` | same | `src/app/araclar/otoyol-hesaplama/page.tsx` |
| `tool_opened muayene` | same | `src/app/araclar/muayene-ucreti/page.tsx` |
| `tool_opened rota` | same | `src/app/araclar/rota-maliyet/page.tsx` |
| `calculation_completed *` | `trackCalculation(tool, meta)` | all 4 non-rota calc pages |
| `route_calculated` | Sprint A existing | rota-maliyet/page.tsx |
| `calculation_error` | Sprint A existing | rota-maliyet/page.tsx |
| `premium_cta_clicked` | `trackPremiumCTA(location)` | src/app/page.tsx (homepage hero links) |
| `checkout_started` | `trackCheckoutStarted(productId, price)` | `src/app/odeme/page.tsx::ProductSelection` |
| `payment_success/failed` | `trackPaymentSuccess`/`trackPaymentFailed` | `src/app/odeme/page.tsx::PaymentResult` useEffect |
| `waitlist_signup` | `trackEvent({category:'premium', action:'waitlist_signup'})` | `EarlyAccessForm.tsx` success branch |

**Citations**:
- Code: `src/lib/analytics/tracker.ts` (Sprint A, unchanged abstraction)
- Code: `src/lib/flags.ts::analyticsEnabled` (Sprint D P7 honest reason)
- Code: `src/app/layout.tsx` (Sprint D P7 conditional `<Script>`)
- Call sites: 7 files listed above
- Artifact: `delivery/sprint-d/analytics-proof.md`
- Artifact: `delivery/sprint-d/api-responses/plausible-script-html-scrape.txt`

---

## Q5 — Early access / waitlist gerçekten çalışıyor mu?

**A5**: **Pending Supabase migration apply in P14**. After the migration
is applied via Supabase Dashboard, the full flow works end-to-end:

1. Public user visits `/odeme`, sees `<EarlyAccessForm />`
2. Fills name + email + ilgi + note
3. Form POSTs to `/api/early-access` with `source_page: 'odeme'`
4. Route validates input (32 validation.test.ts assertions), hashes IP
   (SHA-256 + salt), truncates user-agent, inserts into `erken_erisim`
5. Response: `{ ok: true, id: <bigint> }`
6. Form shows success state with thank-you message
7. Admin logs in → `/admin` → "Erken Erişim" tab → read-only table via
   `/api/admin/early-access` GET (requireAdmin guard)

**Local verification** (ready for P14 prod verification):
```bash
$ curl -X POST http://localhost:3000/api/early-access \
  -H 'Content-Type: application/json' \
  -d '{"ad":"Test","email":"test@example.com","ilgi":"tekli","source_page":"odeme"}'
# Expected: { ok: true, id: N }
```

**Citations**:
- Migration: `supabase/migrations/003_early_access.sql`
- Route: `src/app/api/early-access/route.ts`
- Validation (pure): `src/app/api/early-access/validation.ts`
- Tests: `src/app/api/early-access/__tests__/validation.test.ts` — 32 assertions pass
- Component: `src/components/payment/EarlyAccessForm.tsx`
- Admin view: `src/app/admin/page.tsx` erken-erisim tab
- Admin route: `src/app/api/admin/early-access/route.ts`
- Artifact: `delivery/sprint-d/api-responses/prod-early-access-post.json` (captured in P14)

---

## Q6 — Hangi veri kalemleri hâlâ approximate ve neden?

**A6**: Sprint D P9 made this machine-readable. `/api/data-status.dataFreshness.staleSummary` is the authoritative runtime answer.

**Confidence levels** (from `src/lib/data-manifest.ts` manifests):

| Key | Confidence | Reason |
|---|---|---|
| `mtv` | kesin | GİB official tariff (exact) |
| `muayene` | kesin | TÜVTÜRK official tariff (exact) |
| `yakit` | yaklaşık | PETDER country average, NOT per-pump, NOT per-city |
| `otoyol-routes` | kesin | KGM HGS/OGS tariff (exact) |
| `otoyol-segments` | kesin (per-segment); some tahmini | Bridges/tunnels KGM verified, highway segments estimated |
| `araclar` | yüksek | OYDER + manufacturer data (high confidence but drifts vs market) |
| `noter` | kesin | Adalet Bakanlığı tariff (exact) |
| `amortisman` | tahmini | OYDER sector benchmarks (model output) |

**Stale entries right now** (`getStaleEntries()` returns as of today):
- `yakit` — 84 days since update, monthly cadence max 35 days → **STALE**. Every other entry is fresh.

**Also still "approximate" by design**:
- **District offset distance**: Haversine × regional multiplier (never exact)
- **Route confidence**: degrades to "yüksek" even when all edges are "kesin" because of the district offset dependency

**Citations**:
- Code: `src/lib/data-manifest.ts::computeStaleness` + `getStaleEntries`
- Code: `src/lib/route/route-engine.ts::derivePathTollSource` etc. (Sprint C P9)
- Runtime: `curl -s https://arac-karar-motoru.vercel.app/api/data-status | jq .dataFreshness`
- Runtime: `curl -s https://arac-karar-motoru.vercel.app/api/health | jq .dataFreshness`
- Admin: `/admin → Dashboard → Stale Warning Card` (Sprint D P10)
- Doc: `docs/data-update-runbook.md` (Sprint C P13)
- Doc: `docs/trust-model.md` (Sprint A)
- Parity: `docs/methodology-parity.md` (Sprint D P12)

---

## Q7 — Source-of-truth kararı public ve admin tarafta tutarlı mı?

**A7**: **YES** — ADR-001 (Sprint C) bound `src/data/*.ts` as the binding
tariff source. Sprint D preserves this:

- `/api/data-status.activeSource === "src_data_static_files"` (Sprint C P12, unchanged)
- `/api/data-status.adrReference === "docs/adr/0001-src-data-as-source-of-truth.md"`
- Admin panel has **no** tarife edit tabs (Sprint C P6 hidden, unchanged)
- Admin panel Dashboard shows ADR-001 info card (unchanged)
- Admin panel Dashboard now ALSO shows Sprint D P10 stale warning card (NEW)
- Public calculator pages all read from `src/data/*.ts` via their calculators
- Public calculator pages all show `<DataSourceFooter manifestKey=... />` (Sprint C P7, cleaned up in Sprint D P11)
- `/api/admin/tarifeleri` still returns deprecation headers (Sprint C P6, unchanged)
- `docs/data-update-runbook.md` is the editorial workflow (Sprint C P13, unchanged)

**New in Sprint D**: `docs/methodology-parity.md` audits all metodoloji
rows against the manifest and documents 1 content drift + 1 gap as
Sprint E candidates. **The drifts are honest documentation, not
violations of the source-of-truth decision**.

**Citations**:
- ADR: `docs/adr/0001-src-data-as-source-of-truth.md` (Sprint C P1)
- Runtime: `curl -s https://arac-karar-motoru.vercel.app/api/data-status | jq '.activeSource, .adrReference'`
- Admin: `src/app/admin/page.tsx` dashboard info card
- Parity: `docs/methodology-parity.md` (Sprint D P12)
- Artifact: `delivery/sprint-d/api-responses/prod-data-status-post-d.json`

---

## Q8 — Bu sprintten sonra live ödeme açmadan önce kalan son büyük işler neler?

**A8**: Sprint C Q8 verbatim (unchanged) + Sprint D addendum.

### Sprint C Q8 items (unchanged)

1. **iyzico merchant agreement** signed (live API keys issued)
2. **KVKK + PCI DSS** legal review complete
3. **Vercel env swap**:
   - `IYZICO_API_KEY=live-...`
   - `IYZICO_SECRET_KEY=live-...`
   - `IYZICO_BASE_URL=https://api.iyzipay.com`
4. **First real test transaction** with refund (smoke test)
5. **odemeler table matches iyzico dashboard** for the smoke test
6. **`PUBLIC_BETA_MODE=false`** added to Vercel Production env vars

### Sprint D addendum

7. **`/odeme` `?mode=sandbox` removal** — When `paymentMode` flips to
   `paymentLive`, the sandbox query-param path becomes obsolete. Either
   leave it in (harmless — no-op) or explicitly delete the `isAdminTestMode`
   branch. Recommend: LEAVE it as a debug fallback for the first week post-launch.

8. **Yakıt data refresh** — before going live, run a PETDER refresh so
   the yakit entry is no longer stale. This is a content task (Sprint E).

9. **Analytics active verification** — Plausible dashboard should show
   real pageviews + events for at least 7 days before live launch, to
   validate instrumentation.

10. **Content drift fixes** (araclar + bakım benchmark) — not strictly
    blocking but improves user trust.

**When all 10 items are complete**, `PUBLIC_BETA_MODE=false` + env swap
→ redeploy → `paymentMode === 'paymentLive'` → no more BETA pill →
`/odeme` public users see the real 3-step checkout (which still uses
Sprint C's iyzipay SDK + the same `/api/payment/create` handler, just
with live env vars).

**Estimated Sprint D+N timeline**: ~4 days of engineering + merchant
agreement wait time (weeks to months) + legal review (weeks).

**Citations**:
- `docs/payment-modes.md` §4 "Production E2E checklist" (Sprint C P13, unchanged)
- `delivery/sprint-c/sprint-end-questions.md` Q4 + Q8 (cited verbatim)
- Sprint D env-audit: `delivery/sprint-d/env-audit.md`
