# Sprint B — Manual QA Checklist

**Use this to independently verify what Sprint B claims.**

Each test is a manual step you can run without any scripting. If any test
fails, do not mark Sprint B as "done" until the root cause is explained.

Total time: ~20 minutes.

Expected results are from the Sprint B verification pass on 2026-04-08.
Production commit then: `0be9b8e7612bd2b365a5418922d22981981c7f37`.

---

## Test 1 — Build Parity (2 min)

**Goal**: Prove that production is running the current git HEAD.

```bash
# Terminal 1
cd /Users/optimusprime22/Desktop/arackararmotoru/arac-karar-motoru
git rev-parse HEAD

# Terminal 2
curl -s https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit
```

- [ ] Both outputs are identical.
- [ ] If not identical: a new deploy is in flight or the main branch moved
      after the last deploy. Wait for Vercel to catch up, or deploy.

Expected: `0be9b8e7612bd2b365a5418922d22981981c7f37` on both sides.

---

## Test 2 — Health Endpoint & Flags (3 min)

**Goal**: Prove that feature flags reflect the real production env state.

```bash
curl -s https://arac-karar-motoru.vercel.app/api/health | jq .
```

Check each field:

- [ ] `status === "ok"`
- [ ] `flags.paymentEnabled.enabled === true` (proves IYZICO_* set)
- [ ] `flags.adminWriteEnabled.enabled === true` (proves
      SUPABASE_SERVICE_ROLE_KEY set)
- [ ] `flags.analyticsEnabled.enabled === false` (honest; no provider)
- [ ] `flags.routeV3Enabled.enabled === true`
- [ ] `flags.pdfEnabled.enabled === true`
- [ ] `services.supabase.reachable === true`
- [ ] `services.supabase.latencyMs < 5000`
- [ ] `services.iyzico.mode === "sandbox"` (or "production" if you switched)
- [ ] `timestamp` is within the last few minutes

---

## Test 3 — Data Status & Misalignment Warning (2 min)

**Goal**: Verify the `src/data` vs Supabase fork is surfaced.

```bash
curl -s https://arac-karar-motoru.vercel.app/api/data-status | jq .
```

- [ ] `calculationSource === "src_data_static_files"`
- [ ] `adminCrudTarget === "supabase_tables"`
- [ ] `alignmentWarning` is a non-empty string containing "NOT read by the
      public calculators"
- [ ] `srcDataFiles.mtv.populated === true`, `itemCount === 32`
- [ ] `srcDataFiles.araclar.populated === true`, `itemCount === 161`
- [ ] `supabase.reachable === true`
- [ ] `supabase.tables[0].rowCount === 0` (most tables should be empty
      unless you ran a seed script)

Then open `docs/data-source-truth.md` and read it end-to-end. The warning
should match the documentation.

---

## Test 4 — iyzico Sandbox E2E (⚠️ known caveat) (6 min)

**Goal**: Verify that the full iyzico flow works end-to-end against the
sandbox API with a test card.

**Current Sprint B state**: Local PASS, production BLOCKED on suspected
missing `NEXT_PUBLIC_SITE_URL` env var. Read `payment-runtime-check.md`.

### Step 4a — Local

```bash
cd /Users/optimusprime22/Desktop/arackararmotoru/arac-karar-motoru
npm run dev  # starts on port 3000

# In another terminal
curl -s -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"productId":"tekli","customer":{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+905555555555"}}' \
  | jq 'keys'
```

- [ ] Response contains `checkoutFormContent`, `token`, `orderId`
- [ ] HTTP 200
- [ ] Open a browser at `http://localhost:3000/odeme`, click checkout,
      enter sandbox card `5528790000000008`, expiry `12/30`, CVC `123`.
- [ ] After form submission, browser is redirected to
      `http://localhost:3000/odeme?status=success&payment=...`
- [ ] `odemeler` table (via Supabase Dashboard → Table editor) has a new
      row with `durum='basarili'` and matching `iyzico_conversation_id`.

### Step 4b — Production

**Expected: CURRENTLY FAILS.** This is the known Sprint B caveat.

```bash
curl -s -X POST https://arac-karar-motoru.vercel.app/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"productId":"tekli","customer":{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"+905555555555"}}'
```

- [ ] Returns `{"error":"Odeme baslatilamadi"}` (known state)
- [ ] Fix (Sprint B+1): Add `NEXT_PUBLIC_SITE_URL=https://arac-karar-motoru.vercel.app`
      to Vercel env vars, redeploy, re-run.

---

## Test 5 — Admin Auth Guard (3 min)

**Goal**: Verify the admin API requires authentication (it should NOT be
publicly readable).

```bash
curl -sv https://arac-karar-motoru.vercel.app/api/admin/dashboard 2>&1 | head -20
```

- [ ] HTTP status: 401
- [ ] Response body contains `"Yetkilendirme gerekli"` or similar
- [ ] Sprint B seed: admin user exists in `kullanicilar` with
      `auth_id=d3cfcc76-58c0-4be2-a344-deb715c5bd9d`, `email=senalpserkan@gmail.com`,
      `rol='admin'` (verified via `scripts/sprint-b-admin-seed.mjs`).

Browser-based login E2E is deferred — Chrome extension MCP was down during
Sprint B. Re-test with browser when possible.

---

## Test 6 — No Secret Leakage (3 min)

**Goal**: Verify that the 3 new health endpoints don't leak any secrets.

```bash
for EP in health build-info data-status; do
  echo "--- /api/$EP ---"
  curl -s https://arac-karar-motoru.vercel.app/api/$EP \
    | grep -Ec "(sb_secret_|sb_publishable_|sandbox-[a-zA-Z0-9]{20,}|IYZICO_SECRET|SERVICE_ROLE|eyJ[a-zA-Z0-9]{30,})"
done
```

- [ ] All three greps return `0`
- [ ] Artifact: `delivery/sprint-b/api-responses/secret-leak-check-post-env.txt`

---

## Test 7 — Analytics Honestly Inactive (1 min)

```bash
curl -s https://arac-karar-motoru.vercel.app/ | \
  grep -Ec 'gtag|googletagmanager|plausible|posthog|umami|mixpanel'
```

- [ ] Result: `0`
- [ ] `/api/health.flags.analyticsEnabled.enabled === false`

If you see any hit here after Sprint B, something has been added and the
docs in `docs/runtime-status.md` need to be updated.

---

## Pass / Fail

Sprint B is "delivered" if tests 1, 2, 3, 5, 6, 7 all pass and test 4 is
still on the known caveat (local PASS). If you want to close the caveat:

1. Add `NEXT_PUBLIC_SITE_URL` to Vercel Production
2. Redeploy
3. Re-run Test 4b — it should now return 200 with checkoutFormContent
4. Re-run the full sandbox card E2E

Close the Sprint B caveat only after re-running Test 4b and getting 200.
