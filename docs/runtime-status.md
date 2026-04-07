# Runtime Status — Araç Karar Motoru

**Tek doğruluk kaynağı.** Hangi servisin gerçekten çalıştığını, hangisinin sadece kod hazır olduğunu burada tutuyoruz.

**Son güncelleme:** Nisan 2026

---

## Production Durumu (https://arac-karar-motoru.vercel.app)

| Servis | Durum | Açıklama |
|--------|-------|----------|
| **Ücretsiz hesaplama araçları** | ✅ AKTİF | MTV, muayene, otoyol, yakıt, rota — tümü çalışıyor |
| **Rota motoru** | ✅ AKTİF | 81 il, 969 ilçe, Dijkstra, KGM köprü/tünel ücretleri |
| **PDF rapor üretimi** | ✅ AKTİF | jspdf ile client-side PDF |
| **Karşılaştırma motoru** | ✅ AKTİF | 161 araç gerçek veritabanı |
| **Supabase auth** | ⚠️ KOD HAZIR | Vercel env vars eklendiyse aktif, değilse admin login çalışmaz |
| **Supabase tabloları (DB)** | ✅ AKTİF | 15 tablo + RLS, migrationlar uygulanmış |
| **Admin paneli (CRUD)** | ⚠️ KOD HAZIR | Supabase env vars Vercel'de yoksa READ-ONLY |
| **iyzico ödeme (sandbox)** | ❌ DEVRE DIŞI | Vercel env vars yok → /odeme "Hazırlanıyor" gösterir |
| **Analytics (GA4/Plausible)** | ❌ DEVRE DIŞI | Provider script eklenmedi → event'ler kaybolur (crash etmez) |

---

## Local Development (.env.local)

Geliştirme ortamında ek olarak:

| Servis | Durum |
|--------|-------|
| iyzico sandbox | ✅ Anahtarlar yüklü, gerçek checkout flow çalışır |
| Supabase service role key | ✅ Yüklü |

⚠️ Local'de çalışan iyzico **production'da çalışmıyor** çünkü Vercel dashboard'a env vars eklenmedi.

---

## Production'a Tam Aktif Etmek İçin

### 1. iyzico Sandbox'ı Production'a Aç
Vercel Dashboard → Settings → Environment Variables → şunları ekle:
```
IYZICO_API_KEY=sandbox-...
IYZICO_SECRET_KEY=sandbox-...
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```
Sonra yeniden deploy. /odeme sayfası otomatik olarak gerçek checkout flow'a geçer.

### 2. Supabase Service Role'ü Production'a Aç
Vercel Dashboard → Settings → Environment Variables → şunu ekle:
```
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```
Bu eklendiğinde admin paneli CRUD yapabilir.

### 3. Analytics
Bir GA4 veya Plausible hesabı aç, layout.tsx'e provider script ekle.

---

## Build / Test Sağlığı

| Kontrol | Durum |
|---------|-------|
| TypeScript | 0 hata |
| Lint | 0 hata |
| Build | Başarılı |
| Route testleri | 34/34 |
| MTV golden | 35/35 |
| Muayene golden | 21/21 (gerçek 2026 değerleri) |
| Edge cases | 16/16 |
| Graf connectivity | 3240/3240 |

## Veri Doğruluğu

| Modül | Gerçek 2026 ile uyumlu mu? | Confidence |
|-------|----------------------------|------------|
| **Muayene** (TÜVTÜRK) | ✅ Doğrulanmış (3.288 TL otomobil) | Kesin |
| **Köprü/Tünel** (KGM) | ✅ Doğrulanmış | Kesin |
| **Otoyol segment** (KGM) | ⚠️ Snapshot, değişebilir | Tahmini |
| **MTV** (GİB) | ⚠️ Tarife yapısı snapshot, kesin tutar GİB hesap aracında | Yaklaşık (elektrik: Kesin) |
| **Rota** (Dijkstra + offset) | ⚠️ İlçe offset tahmini içerir | Yüksek/Tahmini |
| **Yakıt fiyatı** (PETDER) | ⚠️ Snapshot, pompa fiyatları değişir | Yaklaşık |
| **Sigorta/Bakım** (OYDER) | ⚠️ Sektör ortalaması | Tahmini |
| **Araç DB** (161 model) | ✅ OYDER+üretici | Yüksek |
