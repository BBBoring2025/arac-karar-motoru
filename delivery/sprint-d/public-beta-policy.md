# Public Beta Policy — Araç Karar Motoru

**Sprint D P1 deliverable.** Bu dosya, Araç Karar Motoru'nun public beta
döneminde kullanıcılara ve admin'lere neyi garanti ettiğini ve etmediğini
belirler.

Runtime referansı: `/api/health.publicBetaMode === true`
Flag kaynağı: `src/lib/flags.ts::publicBetaMode`
Related: `docs/adr/0001-src-data-as-source-of-truth.md`, `docs/runtime-status.md`

---

## Public Beta nedir?

**Public Beta**: ürünün, sınırlı bir kullanıcı grubuna açık olarak ancak
"finished commerce" olmayan, kendine güvenli (honest) bir işlem hacmi ile
yayınlandığı dönemdir.

Public beta sırasında:

- ✅ Ücretsiz araçlar (MTV, muayene, yakıt, otoyol, rota) **çalışır** ve
  gerçek hesaplamalar yapar
- ✅ Metodoloji sayfası herkese açık
- ✅ Data manifest + source footer'lar veri kaynaklarını açıkça gösterir
- ❌ Ödeme sistemi **live değil** — sandbox modunda
- ❌ "Satın al" butonları sandbox tokenı ve test kartı gerektiriyor (gerçek
  para akmaz)
- ❌ Public kullanıcı `/odeme` sayfasında ödeme formu yerine **waitlist**
  (early access) formu görür
- ⚠️ Bazı veriler "yaklaşık" ya da "bayat" olabilir — `stale` field'ı
  `/api/data-status.dataFreshness` ile surface edilir
- ⚠️ SLA yok — downtime olursa bekleme süresi tanımlı değil

---

## Public Beta'dan çıkış koşulları

Ürün aşağıdakilerin tamamı gerçekleşmeden "launched" / "production" kabul
edilmez:

1. **iyzico live merchant agreement** imzalanmış olmalı
2. **KVKK + PCI DSS** hukuksal inceleme tamamlanmış olmalı
3. **Live env var'lar** Vercel Production'a eklenmiş olmalı:
   - `IYZICO_API_KEY=live-...`
   - `IYZICO_SECRET_KEY=live-...`
   - `IYZICO_BASE_URL=https://api.iyzipay.com`
4. **Real test transaction** ile smoke test (small amount + refund)
5. **odemeler** tablosu iyzico dashboard ile cross-check edilmiş olmalı
6. **`PUBLIC_BETA_MODE=false`** Vercel Production'a eklenmiş olmalı —
   publicBetaMode'u explicit olarak kapatır
7. **Analytics provider** (Plausible) gerçekten event topluyor olmalı
8. **Stale data** warning temizlenmiş olmalı (yakit'in monthly refresh'i
   yapılmış olmalı)

Bu liste Sprint D'nin tamamlanma kriterlerinden bağımsızdır. Sprint D
sadece **beta'yı doğru kurma** sprintidir; live launch başka bir sprint.

---

## Public Beta'da kullanıcı neyi görür?

### Header
- Logo yanında `BETA` pill (turuncu, küçük)
- Nav linkleri çalışır
- "Rapor Al" CTA **waitlist** sayfasına gider (`/odeme` sandbox+public modunda)

### Footer
- Orange-tinted "🧪 Public Beta" disclosure block
- Ana açıklama: "Ödeme sistemi sandbox modunda, gerçek tahsilat yapılmıyor"
- Bu policy sayfasına link

### /odeme
- Public default: `<EarlyAccessForm />` + amber disclosure
- Test/admin: `?mode=sandbox` query ile Sprint C 3-step checkout (sessionStorage
  ile callback flow preserved)

### Calculator sayfaları
- `<DataSourceFooter />` tek source (Sprint C P7)
- `<ConfidenceBadge />` per-calculation güven seviyesi
- Stale data warning yakit'te görünür (Sprint D P9)

### Admin panel
- 4 tab (dashboard + data-manifest + araclar + erken-erisim)
- Stale warning card dashboard'da
- Sprint C P6 ADR-001 info card preserved

---

## Known limitations (Public Beta sırasında bilinen kısıtlar)

1. **Live ödeme yok** — sadece sandbox iyzico
2. **SLA yok** — downtime beklentisi yok ama garanti de yok
3. **Data staleness** — yakit verisi aylık refresh cadence'tan geri
   kalabilir (~83 gün bayat şu an, `/api/data-status.dataFreshness` ile
   görülür)
4. **`araclar.ts` confidence drift** — manifest `yüksek`, metodoloji
   `Tahmini` diyor (docs/methodology-parity.md'de documented gap)
5. **Next.js 16 `middleware → proxy` deprecation** — build warning,
   dedicated sprint'e deferred
6. **6 Supabase tablosunda RLS disabled** (hesaplama_loglari vb.) —
   Sprint B baseline'da rapor edildi, RLS fix sprint'i beklenir
7. **Bakım benchmark tablosu boş** — src/data'da yok, manifest'te yok
   (Sprint E content fix candidate)

Bu kısıtlar her zaman `/api/health`, `/api/data-status`, ve
`docs/runtime-status.md` ile surface edilir — gizlenmez.

---

## KVKK compliance notu

Public beta sırasında Araç Karar Motoru:

- **Cookie kullanmaz**: Plausible analytics cookie-free (verified via
  Plausible docs)
- **IP cleartext saklamaz**: Early access form SHA-256 hash IP kaydeder
  (migration 003)
- **Kredi kartı bilgisi görmez**: iyzico checkoutFormContent içinde
  kullanıcı kartını iyzico'ya girer, app kredi kartı değerine hiçbir
  zaman erişmez
- **E-mail ve ad**: Early access formunda toplanır, sadece manuel
  outreach için kullanılır, üçüncü taraflara aktarılmaz
- **Admin audit**: Tüm admin write'ları `updated_by` column'a loglanır

---

## İletişim

Sorular: info@arackararmotoru.com
Bug reports: GitHub issues
Live launch interest: `/odeme` waitlist formu

---

## Runtime citations

- `/api/health.publicBetaMode` — Sprint D P1 top-level boolean
- `/api/health.flags.publicBetaMode` — {enabled, reason}
- `src/lib/flags.ts::publicBetaMode` — server-side env-var detection
- `src/lib/hooks/usePublicBeta.ts` — client-side shared hook
- `src/components/layout/Header.tsx` — BETA pill conditional render
- `src/components/layout/Footer.tsx` — disclosure block conditional render

---

**Status**: ✅ Sprint D'de yazıldı, public beta state olarak kabul
edildi. Sprint D fazı boyunca bu policy referans olarak kullanılır.
