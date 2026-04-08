# Sprint C — Manual QA Checklist

**Use this to independently verify what Sprint C claims.**

8 tests. ~25 minutes total. Each test cites the artifact that contains
the expected result.

⚠️ **Pre-requisite**: Sprint C must be deployed to production
(commit `ba97d3eaa904b481aaae49911da80ef8f6b89a19`). If `/api/build-info.commit`
still returns `0be9b8e7612bd2b365a5418922d22981981c7f37`, trigger a
redeploy from the Vercel Dashboard first.

---

## Test 1 — Build parity & deploy verification (2 min)

**Goal**: Verify Sprint C is deployed to production.

```bash
cd /Users/optimusprime22/Desktop/arackararmotoru/arac-karar-motoru
git rev-parse HEAD
curl -s https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit
```

- [ ] Both outputs are identical (`ba97d3eaa904b481aaae49911da80ef8f6b89a19`)
- [ ] If not: trigger Vercel redeploy and re-run

Expected (post-deploy): `ba97d3eaa904b481aaae49911da80ef8f6b89a19`.

---

## Test 2 — paymentMode field present & correct (2 min)

**Goal**: Verify Sprint C P12 added the `paymentMode` field to /api/health.

```bash
curl -s https://arac-karar-motoru.vercel.app/api/health | jq .paymentMode
```

- [ ] Returns `"paymentSandbox"` (not the old missing field)
- [ ] Also check: `jq '.flags.paymentEnabled.enabled'` → `true`
- [ ] Also check: `jq '.services.iyzico.mode'` → `"sandbox"`

If `paymentMode` returns `null` or the field is missing, the deploy is
not Sprint C yet. Re-run Test 1.

Artifact for comparison: `delivery/sprint-c/api-responses/local-health-post-p12.json`

---

## Test 3 — data-status activeSource + adrReference + manifest (3 min)

**Goal**: Verify Sprint C P12 added ADR-001 binding fields to /api/data-status.

```bash
curl -s https://arac-karar-motoru.vercel.app/api/data-status | \
  jq '{ activeSource, adrReference, manifestCount: (.manifest|length), warningPreview: (.alignmentWarning[:80]) }'
```

- [ ] `activeSource === "src_data_static_files"`
- [ ] `adrReference === "docs/adr/0001-src-data-as-source-of-truth.md"`
- [ ] `manifestCount === 8`
- [ ] `warningPreview` starts with `"ADR-001 (accepted Sprint C, 2026-04-08): src/data/*.ts is the binding ..."`

Artifact: `delivery/sprint-c/api-responses/local-data-status-post-p12.json`

---

## Test 4 — iyzico create returns HTTP 200 in production (3 min)

**Goal**: Sprint B caveat closure verification.

```bash
curl -s -X POST https://arac-karar-motoru.vercel.app/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"productId":"tekli","customer":{"firstName":"T","lastName":"U","email":"a@b.com","phone":"+905551234567"}}' \
  -w "\nHTTP:%{http_code}\n" | head -3
```

- [ ] HTTP 200 (was 500 in Sprint B)
- [ ] Response contains `checkoutFormContent`, `token`, `orderId`
- [ ] Response includes `sandbox-static.iyzipay.com` substring

If HTTP 500 with `code: "MISSING_CALLBACK_BASE_URL"`:
- Add `NEXT_PUBLIC_SITE_URL=https://arac-karar-motoru.vercel.app` to
  Vercel Production env vars
- Redeploy
- Re-run

If HTTP 500 with old `"Odeme baslatilamadi"`:
- Sprint C deploy didn't happen yet (re-run Test 1)

Artifact: `delivery/sprint-c/payment-runtime-check.md`

---

## Test 5 — Admin tabs hidden + data-manifest tab visible (3 min)

**Goal**: Verify Sprint C P6 admin UI changes.

1. Open https://arac-karar-motoru.vercel.app/admin in your browser
2. Sign in as `senalpserkan@gmail.com` (Sprint B seeded admin)
3. Verify the tab navigation:
   - [ ] **3 tabs visible**: Dashboard, Veri Manifestosu, Araç Veritabanı
   - [ ] **MTV Tarifeleri tab is GONE** (was visible in Sprint B)
   - [ ] **Muayene Ücretleri tab is GONE**
   - [ ] **Otoyol Tarifeleri tab is GONE**
4. Click "Dashboard" tab
   - [ ] Amber info card visible: "Tarife düzenleme dosya bazında yapılır (Sprint C / ADR-001)"
   - [ ] Two link buttons: docs/data-update-runbook.md and docs/adr/0001-…
5. Click "Veri Manifestosu" tab
   - [ ] Table with 8 rows (mtv, muayene, yakit, otoyol-routes, otoyol-segments, araclar, noter, amortisman)
   - [ ] Each row shows label, source link, effective date, last updated, confidence badge, item count, file path
6. Click "Araç Veritabanı" tab
   - [ ] Read-only table of all vehicles still works (Sprint C did NOT touch this)

---

## Test 6 — Public footer on calculator pages (2 min)

**Goal**: Verify Sprint C P7 DataSourceFooter on 5 calculator pages.

For each URL below, scroll to the bottom and verify the footer card is present:

| URL | Manifest key | Expected source label |
|---|---|---|
| https://arac-karar-motoru.vercel.app/araclar/mtv-hesaplama | `mtv` | "GİB ... 2026 MTV Tebliği" |
| https://arac-karar-motoru.vercel.app/araclar/muayene-ucreti | `muayene` | "TÜVTÜRK ... 2026" |
| https://arac-karar-motoru.vercel.app/araclar/yakit-hesaplama | `yakit` | "PETDER ..." |
| https://arac-karar-motoru.vercel.app/araclar/otoyol-hesaplama | `otoyol-segments` | "KGM 2026 ..." |
| https://arac-karar-motoru.vercel.app/araclar/rota-maliyet | `otoyol-segments` + `yakit` | Both side by side |

For each:
- [ ] "Kaynak: ..." line with clickable source link (opens in new tab)
- [ ] "Yürürlük: YYYY-MM-DD · Son güncelleme: YYYY-MM-DD" line
- [ ] Confidence badge (green/blue/yellow/orange) on the right

---

## Test 7 — Route source tracking visible (3 min)

**Goal**: Verify Sprint C P9/P10 route engine source tracking.

1. Open https://arac-karar-motoru.vercel.app/araclar/rota-maliyet
2. Pick a route: İstanbul Kadıköy → Ankara Çankaya
3. Pick a vehicle (any sedan)
4. Click "Hesapla"
5. Scroll to the result section
6. Find the **TollBreakdownCard** (Geçiş Ücretleri)
   - [ ] Each toll line shows a small confidence badge (green for "kesin", orange for "tahmini")
   - [ ] Bridge/tunnel names link to KGM source URL (open in new tab)
7. Find the **FuelCostCard** (Yakıt Maliyeti)
   - [ ] "Birim Fiyat" box has a subtitle: "Referans (PETDER ortalaması)"
   - [ ] If you go back to the form, change the fuel price, and recalculate, the subtitle changes to "Sizin fiyatınız" (orange)
8. Find the **RouteConfidenceNote** ("Bu hesaplama hakkında")
   - [ ] 3 source provenance lines visible:
     - "Mesafe kaynağı: graf + ilçe-merkez tahmini (Haversine ×{multiplier})"
     - "Geçiş ücretleri: KGM resmi / Tahmini / Karma"
     - "Yakıt fiyatı: Sizin girişiniz / Referans (PETDER)"

---

## Test 8 — Sandbox card E2E (browser, 6 min)

**Goal**: Sprint C iyzico full flow in production with sandbox cards.

1. Open https://arac-karar-motoru.vercel.app/odeme
2. Verify the **amber banner** above the StepIndicator:
   - [ ] Text: "Bu test/sandbox işlemdir, gerçek para çekilmez."
   - [ ] Test card cheatsheet visible in the banner
3. Click "Tekli" product → Step 2 (customer form)
4. Fill in the form: any name, email, phone (e.g., `+905551234567`)
5. Click "Ödemeye Geç" → Step 3 (checkout)
6. Wait for the iyzico form to load (loaded from `sandbox-static.iyzipay.com`)
7. **Success path**: Enter card `5528790000000008`, expiry `12/30`, CVC `123`
   - [ ] Browser redirects to `https://arac-karar-motoru.vercel.app/odeme?status=success&paymentId=...`
   - [ ] Page shows green checkmark + "Ödeme Başarılı!"
   - [ ] In Supabase Dashboard → Table editor → odemeler, find the new row with matching `iyzico_conversation_id`
   - [ ] Row's `durum === 'basarili'`
8. **Failure path**: Repeat steps 1–6 with card `4111111111111129`
   - [ ] Browser redirects to `https://arac-karar-motoru.vercel.app/odeme?status=error&message=...`
   - [ ] Page shows red X + decoded error message
   - [ ] In Supabase, the new row's `durum === 'basarisiz'`
9. Cleanup (optional): delete the test rows from `odemeler`

If any of these steps fail, capture the failing screen and check
`payment-runtime-check.md` for diagnostic guidance.

---

## Pass / Fail

Sprint C is "verified live" if Tests 1–8 all pass after the user
triggers the Vercel redeploy.

If Test 1 fails (production still on Sprint B commit), only the deploy
trigger is missing — the code is correct.

If Test 4 fails with `MISSING_CALLBACK_BASE_URL`, add the env var.

If Test 8 fails on the browser redirect, capture the error message and
check Vercel runtime logs (if Vercel MCP is back online).
