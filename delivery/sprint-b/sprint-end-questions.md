# Sprint B — Sprint-End Questions

Seven questions. Seven honest answers. Every answer cites a file, URL, or
commit.

---

## Q1 — Production commit hash?

**A1**: `0be9b8e7612bd2b365a5418922d22981981c7f37` (short: `0be9b8e`)

**Citation**:
- Runtime: `curl -s https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit`
- Deploy: Vercel `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa`, region `iad1`
- Branch: `main`
- Built at: `2026-04-08T13:50:07.884Z`
- Artifact: `delivery/sprint-b/api-responses/prod-build-info-post-env.json`

---

## Q2 — Deploy parity with local HEAD?

**A2**: YES.

**Citation**:
- `git rev-parse HEAD` on the Sprint B verification machine at the time of
  the last /api/build-info probe: `0be9b8e7612bd2b365a5418922d22981981c7f37`
- `/api/build-info.commit`: `0be9b8e7612bd2b365a5418922d22981981c7f37`
- Full proof: `delivery/sprint-b/build-parity.md`
- Resolves Sprint A's gap (prod was at `3c4d723`, HEAD at `dd408ef`).

---

## Q3 — Supabase CRUD real?

**A3**: YES — the write path is real, production reads reflect it in real
time. **BUT** this CRUD has **zero user-visible effect** on the public
calculators because the calculators read from hardcoded `src/data/*.ts`.

**Citation**:
- Positive proof: `delivery/sprint-b/admin-crud-verification.md`,
  `delivery/sprint-b/api-responses/admin-crud-run.json`,
  `delivery/sprint-b/api-responses/admin-crud-prod-sync.json`
- Timeline proof: before_seed.rowCount=0 → after_seed.rowCount=1 →
  after_cleanup.rowCount=0, all observed via production
  `/api/data-status` within a ~2-second window.
- Audit proof: `updated_by = senalpserkan@gmail.com` populated on INSERT
  and UPDATE.
- Negative proof (misalignment): `docs/data-source-truth.md`,
  `delivery/sprint-b/api-responses/data-status-misalignment-proof.json`

---

## Q4 — iyzico active?

**A4**: Partially. Sandbox env is set in Vercel Production, iyzipay
module loads (proven via `/api/payment/callback`), but
`/api/payment/create` returns 500 in production.

**Citation**:
- Local PASS: `delivery/sprint-b/api-responses/iyzico-create-local.json`
  (HTTP 200, token `59e47e3c-eef3-49bc-8d75-008f594bc53e`, orderId=4,
  checkoutFormContent 2860 chars, isSandbox=true)
- Prod FAIL: `delivery/sprint-b/api-responses/iyzico-local-vs-prod.txt`
  (HTTP 500, `{"error":"Odeme baslatilamadi"}`)
- iyzipay loads in prod: `curl -sL -X POST
  https://arac-karar-motoru.vercel.app/api/payment/callback -d
  'token=invalid_test'` → redirect to `/odeme?status=error&message=server_error`
  (proves iyzipay SDK was reached)
- Flag proof: `/api/health.flags.paymentEnabled.enabled=true`,
  `/api/health.services.iyzico.mode="sandbox"`
- Suspected root cause: missing `NEXT_PUBLIC_SITE_URL` in Vercel Production
  (see `delivery/sprint-b/payment-runtime-check.md`)
- Sandbox card E2E deferred (Chrome extension MCP down).

---

## Q5 — Analytics connected?

**A5**: NO. Honestly inactive.

**Citation**:
- `/api/health.flags.analyticsEnabled.enabled = false`
- Production homepage HTML has 0 provider scripts (gtag,
  googletagmanager, plausible, posthog, umami, mixpanel, segment all
  absent).
- Artifacts: `delivery/sprint-b/api-responses/analytics-html-scan.txt`,
  `delivery/sprint-b/analytics-runtime-check.md`
- Client tracker (`src/lib/analytics/tracker.ts::isEnabled`) delegates to
  `getClientFlags({gtag, plausible})` which returns false when globals
  are absent.

How to enable: `docs/runtime-status.md` § "How to Flip Analytics On".

---

## Q6 — What is shown to users but is NOT fully active?

**A6**: Three things.

1. **Analytics UI surface**: `src/lib/analytics/tracker.ts` is imported by
   various components; its `track()` calls are no-ops because `isEnabled()`
   returns false. Users see the same UI they always see; no hidden
   tracking happens. Honest state, documented.

2. **Admin CRUD for MTV/muayene/otoyol tarifes**: Admin UI exists, PUT
   requests succeed against Supabase, the `updated_by` column records the
   admin email — but the user-facing calculators ignore Supabase and read
   from `src/data/*.ts`. Admin "edits" therefore have zero user-visible
   effect. See `docs/data-source-truth.md`.

3. **MTV snapshot values**: `src/data/mtv.ts` is tagged with confidence
   "yaklaşık" (approximate) — it's a 2026 snapshot from the GİB Tebliği
   (yaklaşık, not verified against the official PDF in Sprint B). Users
   see concrete numeric results with no disclaimer in the UI.

---

## Q7 — Top 3 things blocking a "production-ready" label?

**A7**:

1. **Data source fork** (`docs/data-source-truth.md`). Admin CRUD and user
   calculators read from different stores. Remediation: Sprint B+1 Path C
   (hide tarife tabs) + Sprint B+2 Path B (calculators read from Supabase
   with cache).

2. **iyzico `/api/payment/create` 500 in production**. Root cause
   suspected to be missing `NEXT_PUBLIC_SITE_URL`, not verified because
   Vercel logs MCP was offline during Sprint B verification. Fix: add the
   env var, redeploy, re-test. Sandbox card E2E also deferred due to
   Chrome extension MCP being down.

3. **MTV tarife snapshot accuracy**. `src/data/mtv.ts` confidence is
   "yaklaşık" for GİB 2026. Needs a data-audit pass against the official
   Tebliği PDF before users can trust the MTV numbers for real financial
   decisions.

Honorable mentions (not in top 3 but still tracked):
- Next.js 16 `middleware → proxy` deprecation warning on build.
- 6 Supabase tables with RLS disabled (see Sprint B baseline).
- No automated E2E test suite (only unit tests and route-engine regression).
