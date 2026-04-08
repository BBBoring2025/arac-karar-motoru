# Runtime Status — Araç Karar Motoru

**Single source of truth for what is actually running in production.**

Last verified: 2026-04-08 (Sprint B runtime verification pass)
Production deployment: `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa`
Production commit: `0be9b8e7612bd2b365a5418922d22981981c7f37`
Live URL: https://arac-karar-motoru.vercel.app

**Previous versions**: `docs/archive/runtime-status-sprint-a.md`

---

## TL;DR

Sprint B introduced the **4-proof rule**: no service is marked "live" unless
it is verified at the (1) code, (2) runtime, (3) deploy, and (4) env layer.

Most things are live. **Three known caveats** sit at the bottom:
1. `/api/payment/create` returns 500 in production (local PASS) — suspected
   missing `NEXT_PUBLIC_SITE_URL` env var in Vercel.
2. Admin CRUD writes to Supabase but the user-facing calculators read from
   hardcoded `src/data/*.ts` files. See `docs/data-source-truth.md`.
3. Next.js 16 emits `middleware → proxy` deprecation warning on build.
   Not fixed in Sprint B.

---

## 4-Proof Table

| Service | Code | Runtime | Deploy | Env | Status |
|---|---|---|---|---|---|
| MTV calculator            | `src/lib/mtv/calculator.ts`, reads `src/data/mtv.ts` | `/araclar/mtv-hesaplama` returns 200 + numeric result | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | N/A (static data) | ✅ **LIVE** |
| Muayene calculator        | `src/lib/muayene/*`            | `/araclar/muayene-hesaplama` returns 200                                         | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | N/A             | ✅ **LIVE** |
| Yakit calculator          | `src/lib/yakit/*`              | `/araclar/yakit-hesaplama` returns 200                                           | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | N/A             | ✅ **LIVE** |
| Route engine              | `src/lib/route/*`              | 3240 graph edges + 16 edge cases pass                                            | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | N/A             | ✅ **LIVE** |
| Report PDF                | `src/lib/report/*`             | `/api/rapor/pdf` endpoint present (not Sprint B tested)                          | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | N/A             | ✅ code ready   |
| `/api/health`             | `src/app/api/health/route.ts`  | Returns 200 + flags + supabase probe                                             | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | Supabase keys set | ✅ **LIVE NEW** |
| `/api/build-info`         | `src/app/api/build-info/route.ts` | Returns 200 + commit + deploymentId                                           | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | Vercel auto env   | ✅ **LIVE NEW** |
| `/api/data-status`        | `src/app/api/data-status/route.ts` | Returns 200 + alignment warning + table probe                                | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | Supabase keys set | ✅ **LIVE NEW** |
| Feature flags (centralized) | `src/lib/flags.ts`           | `/api/health.flags` reflects env state                                          | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | All read         | ✅ **LIVE NEW** |
| Payment state machine     | `src/lib/payment/state-machine.ts`, `src/app/odeme/page.tsx` | `/odeme` renders state-correct UI            | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | Derives from /api/health | ✅ **LIVE NEW** |
| Supabase admin write      | `src/lib/supabase.ts::createAdminClient` | Sprint B P8 Test 3: INSERT → UPDATE → DELETE cycle PASSED with `updated_by` audit | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | `SUPABASE_SERVICE_ROLE_KEY` set (P7) | ✅ **LIVE NEW** |
| Admin user `senalpserkan@gmail.com` | Seeded via `scripts/sprint-b-admin-seed.mjs` | `kullanicilar` row id=`ee1a3d33-a8a5-4721-8c4e-b2067fe64443`, `rol=admin` | Database state (not deployed artifact) | Auth user created in Supabase Dashboard | ✅ **LIVE NEW** |
| Admin dashboard `/admin/*` | `src/app/admin/**`            | `/api/admin/dashboard` returns 401 without cookie (auth guard verified)          | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | Supabase auth set | ⚠️ AUTH GUARD VERIFIED, full browser login E2E DEFERRED |
| iyzico `initializeCheckoutForm` | `src/lib/payment/processor.ts` | **LOCAL**: 200 + sandbox token + checkoutFormContent. **PROD**: 500 (outer catch) | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | `IYZICO_*` set | ⚠️ **LOCAL PASS, PROD BLOCKED** |
| iyzico `retrieveCheckoutForm` (callback) | `src/lib/payment/processor.ts` | `/api/payment/callback` with fake token reaches iyzipay SDK and rejects correctly | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | `IYZICO_*` set | ✅ iyzipay **loads** in prod |
| Analytics                 | `src/lib/analytics/tracker.ts` | `/api/health.flags.analyticsEnabled.enabled=false`, HTML has 0 provider scripts | `dpl_8naZeBtVC6L5ofGfqUbJ8uhxStMa` | No provider env | ⚠️ **CODE READY, NO PROVIDER** (honest) |

---

## 5 Core Questions — Answered

### 1. Production commit hash?

`0be9b8e7612bd2b365a5418922d22981981c7f37`

Source: `GET https://arac-karar-motoru.vercel.app/api/build-info` → `.commit`
field. Cross-checked against `git rev-parse HEAD`. Full proof in
`delivery/sprint-b/build-parity.md`.

### 2. Deploy parity with local HEAD?

**YES.** `/api/build-info.commit === git rev-parse HEAD` at every check
after P5 (Sprint B deploy run #1). Sprint A's gap (prod was at `3c4d723`,
HEAD at `dd408ef`) is closed.

### 3. Supabase CRUD real?

**YES — but zero user effect on calculators.**

Sprint B P8 Test 3 proved the full INSERT → UPDATE → DELETE cycle against
`mtv_tarifeleri` with audit path (`updated_by = senalpserkan@gmail.com`).
Production `/api/data-status` reflected writes in real time (rowCount 0 → 1
→ 0).

**BUT**: user-facing calculators read from `src/data/*.ts`, not from
Supabase. See `docs/data-source-truth.md`. Admin tarife edits have **zero**
user-visible effect today. This is known tech debt tracked for Sprint B+1
(Path C: hide admin tarife tabs) and Sprint B+2 (Path B: refactor
calculators to read from Supabase).

### 4. iyzico active?

**Partially.**

- ✅ Env vars set in Vercel Production (`IYZICO_API_KEY`, `IYZICO_SECRET_KEY`,
  `IYZICO_BASE_URL=https://sandbox-api.iyzipay.com`)
- ✅ `/api/health.services.iyzico.mode = "sandbox"`
- ✅ `/api/health.flags.paymentEnabled.enabled = true`
- ✅ `iyzipay` module loads in Vercel Node.js runtime (proven via
  `/api/payment/callback` reaching the SDK)
- ✅ **Local** `/api/payment/create` returns 200 with full checkoutFormContent
  and sandbox token
- ⚠️ **Production** `/api/payment/create` returns 500 with `"Odeme
  baslatilamadi"` — outer catch, root cause undiagnosable without Vercel
  runtime logs (Vercel MCP was offline during Sprint B verification)
- Most likely cause: `NEXT_PUBLIC_SITE_URL` is not set in Vercel Production,
  so callbackUrl defaults to `http://localhost:3000/api/payment/callback`
  which iyzico sandbox rejects.

See `delivery/sprint-b/payment-runtime-check.md` for full diagnostic trail.

### 5. Analytics connected?

**NO — honestly inactive.**

- `/api/health.flags.analyticsEnabled.enabled = false`
- Production homepage HTML has 0 provider scripts (gtag, googletagmanager,
  plausible, posthog, umami, mixpanel, segment all absent)
- Client tracker (`src/lib/analytics/tracker.ts`) delegates to
  `getClientFlags({gtag, plausible})` which returns `false` when neither
  global is present

See `delivery/sprint-b/analytics-runtime-check.md`.

---

## Data Alignment

**Critical: read `docs/data-source-truth.md`.**

TL;DR: admin writes to Supabase tables, but calculators read from
`src/data/*.ts`. These are two separate stores. Editing one does not affect
the other. Documented in Sprint B, remediation deferred to Sprint B+1/+2.

---

## Known Caveats

### Caveat 1 — `/api/payment/create` 500 in production

**Symptom**: `POST /api/payment/create` with valid payload → HTTP 500 `{"error":"Odeme baslatilamadi"}`.
**Local behavior**: HTTP 200, full checkoutFormContent, sandbox token. Proves code is correct.
**Diagnostic blockers**: Vercel logs MCP was offline; could not read function stdout.
**Most likely cause**: `NEXT_PUBLIC_SITE_URL` missing in Vercel Production env → callback URL defaults to `http://localhost:3000`, iyzico sandbox rejects, throws synchronously in the iyzipay SDK.
**Fix (out of Sprint B scope)**: Add `NEXT_PUBLIC_SITE_URL=https://arac-karar-motoru.vercel.app` (or the custom domain) in Vercel env vars, redeploy, re-run test matrix.

### Caveat 2 — `src/data` vs Supabase fork

See `docs/data-source-truth.md`. Three remediation paths documented.

### Caveat 3 — Next.js 16 `middleware` deprecation

Build emits: `The 'middleware' file convention is deprecated. Please use 'proxy' instead.`

**Action**: Not fixed in Sprint B (intentionally out of scope). Track for a
dedicated Next.js 16 compatibility sprint.

### Caveat 4 — 6 Supabase tables with RLS disabled

From Sprint B P0 baseline: `hesaplama_loglari`, `bakim_benchmark`,
`amortisman_oranlari`, `noter_ucretleri`, `b2b_musteriler`,
`sayfa_goruntulumeleri` have `rowsecurity=false`.

**Action**: Not fixed in Sprint B. Track for a dedicated Supabase security
sprint. Migration `003_enable_missing_rls.sql` is the recommended fix.

### Caveat 5 — MTV tarife snapshot accuracy

`src/data/mtv.ts` confidence: "yaklaşık" (approximate) for GİB 2026. Not
verified against the actual Tebliğ PDF in Sprint B. Track for a data-audit
sprint.

---

## How to Flip Analytics On

From `docs/feature-flags.md`:

1. Add a provider script to `src/app/layout.tsx`:
   ```tsx
   <Script src="https://plausible.io/js/plausible.js" data-domain="arac-karar-motoru.vercel.app" strategy="afterInteractive" />
   ```
2. Ensure it populates `window.plausible` (Plausible does).
3. Deploy. The client tracker automatically flips `analyticsEnabled.enabled`
   to `true` without any code change because it reads from the window
   globals.
4. Verify via `/api/health.flags.analyticsEnabled` (server-side flag will
   still be `unknown` because the server can't see window globals; this is
   expected).
5. Verify via browser DevTools: `window.plausible` defined.

---

## Sprint B Artifacts

All Sprint B proofs are under `delivery/sprint-b/`:

```
delivery/sprint-b/
├── build-log.txt                  (P4 local build + tests)
├── build-parity.md                (P8 Test 1)
├── payment-runtime-check.md       (P8 Test 5/6/7 + local-vs-prod)
├── analytics-runtime-check.md     (P8 Test 8)
├── data-source-truth.md           (copy of docs/data-source-truth.md)
├── admin-crud-verification.md     (P8 Test 3 — to write)
├── runtime-status.md              (copy of this file)
├── manual-qa.md                   (P11 — to write)
├── sprint-end-questions.md        (P13 — to write)
└── api-responses/
    ├── local-{health,build-info,data-status}.json
    ├── prod-{health,build-info,data-status}-{pre,post}-env.json
    ├── secret-leak-check{,-post-env}.txt
    ├── admin-crud-run.json
    ├── admin-crud-prod-sync.json
    ├── iyzico-create-local.json
    ├── iyzico-local-vs-prod.txt
    ├── odemeler-after-iyzico-local-test.json
    ├── data-status-misalignment-proof.json
    └── analytics-html-scan.txt
```

---

## Sprint B Verification Timeline

- **2026-04-07 (P0–P5)**: Baseline capture, feature flags, health endpoints,
  payment state machine, local verification, first deploy.
- **2026-04-08 early (P6)**: Admin user seeded via direct REST script
  (Supabase MCP was down).
- **2026-04-08 mid (P7)**: User added `SUPABASE_SERVICE_ROLE_KEY` and
  `IYZICO_*` env vars to Vercel Production, triggered redeploy.
- **2026-04-08 mid (P8)**: 10 runtime tests executed, documented pass/fail
  with artifacts.
- **2026-04-08 late (P9–P13)**: Sprint B docs, manual QA, delivery package
  assembled.

---

## What Sprint B Did NOT Do (by design)

- Did not add new user-facing features.
- Did not fix the `src/data` vs Supabase fork.
- Did not fix the Next.js 16 middleware deprecation.
- Did not enable RLS on the 6 tables with disabled RLS.
- Did not wire up an analytics provider.
- Did not audit MTV tarife accuracy against the GİB Tebliğ PDF.
- Did not run the iyzico sandbox card E2E via browser (Chrome extension
  down; API-level proof captured locally instead).

**Each of these is tracked as Sprint B+1 / B+2 / separate sprints.**
