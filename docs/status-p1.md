# P1 Sprint Status — Gerçek Altyapı ve Ödeme

**Tarih**: Nisan 2026
**Durum**: Kod tamamlandı, deployment env vars bekliyor (production'da henüz aktif değil)

## Yapılanlar

### 1. iyzico Sandbox Entegrasyonu — KOD HAZIR
- `iyzipay` npm paketi kuruldu (v2.0.67)
- `src/lib/payment/processor.ts` — iyzico Checkout Form API
- PCI DSS uyumlu: kart bilgisi sunucuya gelmez
- `initializeCheckoutForm()` — checkout form token oluştur
- `retrieveCheckoutForm()` — ödeme sonucu sorgula
- `serverExternalPackages: ['iyzipay']` — Turbopack uyumluluğu

**⚠️ Production durumu**: Vercel environment variables'a `IYZICO_API_KEY` ve `IYZICO_SECRET_KEY` eklenmediği için canlı `/odeme` sayfası "Ödeme Sistemi Hazırlanıyor" göstermeye devam ediyor. Anahtarlar Vercel dashboard'a eklendiği an kod otomatik olarak gerçek sandbox akışına geçer.

### 2. Payment API Routes
- `POST /api/payment/create` — ödeme başlat, DB'ye kaydet, iyzico form döndür
- `POST /api/payment/callback` — iyzico callback handler, DB güncelle, redirect

### 3. Ödeme Sayfası
- 3-step flow: Ürün seç → Bilgi gir → iyzico form
- iyzico env yoksa "coming soon" banner otomatik gösterilir
- Callback sonucu: başarı/hata sayfası

### 4. Admin CRUD
- `GET/PUT /api/admin/tarifeleri` — 7 tablo desteği (mtv, muayene, otoyol, yakıt, araçlar, amortisman, bakım)
- `updated_by` kolonu tüm tarife tablolarına eklendi (Supabase migration)
- Auth: gerçek Supabase Auth + admin rol kontrolü

### 5. Analytics Provider Abstraction
- GA4 desteği: `window.gtag` varsa otomatik gönderir
- Plausible desteği: `window.plausible` varsa otomatik gönderir
- Provider yoksa crash etmez (try/catch safety)
- Yeni event'ler: `checkout_started`, `payment_success`, `payment_failed`

### 6. ENV Güvenliği
- `.env.local.example` güncellendi
- Public/private ayrımı dokümante edildi
- `SUPABASE_SERVICE_ROLE_KEY` sadece server-side
- `IYZICO_*` anahtarları sadece server-side

## Doğrulama

- TypeScript: 0 hata
- Lint: 0 hata
- Build: Başarılı
- Route testleri: 27/27
- MTV golden: 30/30
- Muayene golden: 17/17

## Kalan

- **Vercel env vars eklenmesi**: Sandbox anahtarları local'de var, Vercel dashboard'da yok
- iyzico production'a geçiş (sandbox → production URL değişikliği)
- Premium rapor PDF üretimi (ödeme sonrası)
- GA4/Plausible script'inin layout'a eklenmesi (hesap açılınca)

## Production vs Local Parity Notu

| Ortam | iyzico Env | /odeme Sayfası | Sandbox Çalışır mı? |
|-------|-----------|---------------|---------------------|
| Local (.env.local) | ✅ Var | Gerçek checkout flow | ✅ Evet |
| Vercel Production | ❌ Yok | "Hazırlanıyor" banner | ❌ Hayır |

**Kod davranışı doğru**: `isPaymentEnabled()` env yokluğunu algılayıp güvenli "coming soon" gösteriyor.
