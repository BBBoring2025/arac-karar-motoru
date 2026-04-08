# Sprint D — Manual QA Checklist

9 reproducible tests. ~30 minutes. Each cites the expected output.

⚠️ **Pre-requisite**: Sprint D deployed via Vercel CLI (P14), migration
003 applied via Supabase Dashboard, optional env var added.

---

## Test 1 — Build parity

```bash
cd /Users/optimusprime22/Desktop/arackararmotoru/arac-karar-motoru
git rev-parse HEAD
curl -s https://arac-karar-motoru.vercel.app/api/build-info | jq -r .commit
```

- [ ] Both return the same SHA (Sprint D final commit)

---

## Test 2 — publicBetaMode flag + UI badges

```bash
curl -s https://arac-karar-motoru.vercel.app/api/health | jq '{publicBetaMode, "flags.publicBetaMode": .flags.publicBetaMode}'
```

- [ ] `publicBetaMode: true`
- [ ] `flags.publicBetaMode.enabled: true`, `reason: "ok"`
- [ ] Visit `/` in browser — BETA pill visible next to logo in Header
- [ ] Scroll to bottom — orange "🧪 Public Beta" disclosure block visible in Footer

Artifact: `delivery/sprint-d/api-responses/prod-health-post-d.json`

---

## Test 3 — dataFreshness summary (health + data-status)

```bash
curl -s https://arac-karar-motoru.vercel.app/api/health | jq .dataFreshness
curl -s https://arac-karar-motoru.vercel.app/api/data-status | jq .dataFreshness.staleSummary
```

- [ ] `health.dataFreshness.staleCount >= 1`
- [ ] `health.dataFreshness.oldestStaleKey === "yakit"`
- [ ] `data-status.dataFreshness.staleKeys` contains `"yakit"`
- [ ] `staleSummary[0].cadence === "monthly"`
- [ ] `staleSummary[0].daysSinceUpdate >= 35`

Artifact: `delivery/sprint-d/api-responses/prod-data-status-post-d.json`

---

## Test 4 — /odeme public default = waitlist

1. Open an incognito browser window
2. Visit https://arac-karar-motoru.vercel.app/odeme (no query params)

- [ ] Amber banner: "🧪 Public Beta — Ödeme henüz aktif değil"
- [ ] Form with fields: Ad Soyad, E-posta, İlgilendiğiniz ürün (select), Not (textarea)
- [ ] Submit button: "Listeye Katıl"
- [ ] **NO** 3-step StepIndicator visible
- [ ] **NO** "test kartı" amber Sprint C banner visible
- [ ] **NO** ProductSelection grid visible

---

## Test 5 — /odeme admin sandbox path (Sprint C preserved)

1. Visit https://arac-karar-motoru.vercel.app/odeme?mode=sandbox

- [ ] Sprint C's amber "Bu test/sandbox işlemdir" banner visible
- [ ] Sprint C's 3-step StepIndicator visible (Paket Seçimi → Bilgileriniz → Ödeme)
- [ ] ProductSelection grid with 3 tiers (tekli/karşılaştırma/ticari) visible
- [ ] Clicking a product advances to customer form
- [ ] Form submission triggers iyzico checkoutFormContent (Sprint C fix still works)
- [ ] sessionStorage now has `odeme_mode: "sandbox"` (check DevTools)

---

## Test 6 — iyzico callback regression (CRITICAL — preserve Sprint C flow)

1. Visit https://arac-karar-motoru.vercel.app/odeme?status=success&paymentId=test
2. Visit https://arac-karar-motoru.vercel.app/odeme?status=error&message=test_failure

- [ ] Test 1: Green checkmark + "Ödeme Başarılı!" + "Raporlara Git" button
- [ ] Test 2: Red X + "Ödeme Başarısız" + "Tekrar Dene" button
- [ ] **NOT** the waitlist form (callback state takes priority over routing)

This is the Sprint C 6-state callback flow regression check. If this
fails, Sprint D broke Sprint C's payment result rendering and needs
immediate rollback.

---

## Test 7 — Early access POST + admin read

```bash
curl -X POST https://arac-karar-motoru.vercel.app/api/early-access \
  -H 'Content-Type: application/json' \
  -d '{
    "ad":"Sprint D Manual QA",
    "email":"sprint-d-qa@example.com",
    "ilgi":"tekli",
    "not_metni":"Manual QA Test 7",
    "source_page":"manual-qa"
  }' \
  -w "\nHTTP:%{http_code}\n"
```

- [ ] HTTP 200
- [ ] Response body: `{"ok": true, "id": <number>}`

Then log in as admin (`senalpserkan@gmail.com`) at
https://arac-karar-motoru.vercel.app/admin:

- [ ] "Erken Erişim" tab visible (4th tab)
- [ ] Table shows the test row with matching email
- [ ] `source_page` shows `manual-qa`
- [ ] IP hash is masked (ends with `…`)
- [ ] Admin can click email to open mailto link

Cleanup: delete the test row via Supabase Dashboard OR leave it for audit.

---

## Test 8 — Plausible script + first event

**If `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set in Vercel**:

```bash
curl -s https://arac-karar-motoru.vercel.app/ | grep -c "plausible.io"
```

- [ ] Count ≥ 1 (`plausible.io` appears in the HTML source)

```bash
curl -s https://arac-karar-motoru.vercel.app/api/health | jq .flags.analyticsEnabled
```

- [ ] `enabled: true`, `reason: "ok"`

Visit any calculator page (e.g. `/araclar/mtv-hesaplama`), then check
Plausible dashboard within 5 minutes:

- [ ] Pageview recorded
- [ ] `tool_opened` custom event visible (after calculator interaction)

**If env var NOT set**:
```bash
curl -s https://arac-karar-motoru.vercel.app/api/health | jq .flags.analyticsEnabled
```

- [ ] `enabled: false`, `reason: "missing_env"` (honest — not `"unknown"`)

Either path is acceptable. Sprint D is honest about both.

---

## Test 9 — Stale warning card visible in admin

Log in as admin at https://arac-karar-motoru.vercel.app/admin → Dashboard tab:

- [ ] Yellow/amber "⚠️ Bayat Veri Uyarısı (N)" card at the top
- [ ] Lists `Yakıt Fiyatları` with days since update + cadence
- [ ] Clickable "runbook" link to GitHub `docs/data-update-runbook.md#yakit`
- [ ] (If all entries fresh) green "✅ Tüm veri kaynakları güncel" card instead

---

## Pass / Fail

Sprint D is "delivered live" if Tests 1, 2, 3, 4, 5, 6, 9 all pass.

Test 7 depends on migration apply — if it fails with DB error, the user needs to apply `supabase/migrations/003_early_access.sql` via Dashboard.

Test 8 is conditional — if Plausible env var is missing, accept the honest disabled state and schedule the env var addition for a follow-up redeploy.
