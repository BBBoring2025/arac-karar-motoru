# Screenshots — Sprint A Evidence

Bu klasör, Sprint A sonrası canlı production sitesinin sayfa snapshot'larını içerir.

**Snapshot Tarihi:** Sprint A deploy sonrası (commit `3c4d723`)
**Production URL:** https://arac-karar-motoru.vercel.app

---

## Dosyalar

| Dosya | Sayfa | Doğrulanan |
|-------|-------|-----------|
| `homepage.html` | / | Ana sayfa, footer, navigation |
| `muayene-ucreti.html` | /araclar/muayene-ucreti | **3.288 TL otomobil** (gerçek 2026) |
| `mtv-hesaplama.html` | /araclar/mtv-hesaplama | **"Yaklaşık" badge + GİB MTV Hesaplama linki** |
| `metodoloji.html` | /metodoloji | **Rota 3 alt satır** (köprü kesin, segment tahmini, offset yaklaşık) |
| `rota-maliyet.html` | /araclar/rota-maliyet | Rota motoru sayfası |
| `yakit-hesaplama.html` | /araclar/yakit-hesaplama | Yakıt hesaplama |
| `otoyol-hesaplama.html` | /araclar/otoyol-hesaplama | Otoyol hesaplama |
| `odeme.html` | /odeme | Ödeme sayfası (CSR — JS çalıştığında "Hazırlanıyor" gösterir) |

---

## Doğrulama Komutları

```bash
# Muayene 3.288 TL var mı?
grep "3.288\|3288" muayene-ucreti.html
# Beklenen: 3.288 görünmeli

# MTV "Yaklaşık" badge var mı?
grep "Yaklaşık" mtv-hesaplama.html
# Beklenen: 1+ hit

# MTV GİB Hesaplama linki var mı?
grep "MTVHesaplama" mtv-hesaplama.html
# Beklenen: 1 hit (https://dijital.gib.gov.tr/hesaplamalar/MTVHesaplama)

# Metodoloji 3 rota satırı var mı?
grep "Rota — " metodoloji.html
# Beklenen: 3 hit (Köprü/Tünel, Otoyol Segment, İl/İlçe Mesafeleri)
```

---

## Önemli Notlar

### 1. odeme.html — Client-Side Rendering
`/odeme` sayfası `useSearchParams` Suspense boundary kullandığı için **client-side rendered** olur. curl ile çekildiğinde JS çalıştırılmaz, bu yüzden statik HTML'de "Ödeme Sistemi Hazırlanıyor" yazısı görünmez. Sayfa doğru çalışıyor — bir tarayıcıda açıldığında JS çalışıp banner'ı render eder.

**Vercel'de iyzico env vars yok** → `isPaymentEnabled()` false döner → sayfa "Ödeme Sistemi Hazırlanıyor" gösterir (kasıtlı ve doğru).

### 2. Bu Dosyalar HTML Snapshot
Bunlar gerçek PNG screenshot değil, HTML kaynak dosyaları. ChatGPT Pro veya başka bir reviewer:
- Bir tarayıcıda açabilir (`open homepage.html`)
- Kaynak kodu inceleyebilir
- grep ile içerik doğrulayabilir

### 3. Sprint A Öncesi vs Sonrası
İlk çekimde (Sprint A push edilmiş ama Vercel deploy edilmemişken) sayfalar hâlâ **125 TL** ve **"Kesin"** gösteriyordu. Vercel deploy sonrası tekrar çekildiğinde gerçek değerler göründü.

Yani bu dosyalar, sprint başarısının canlı kanıtıdır.

---

## Tarayıcıda Görsel Olarak Görmek İçin

```bash
cd delivery/sprint-a/screenshots
open muayene-ucreti.html
open mtv-hesaplama.html
open metodoloji.html
```

Veya direkt canlı siteyi ziyaret et: https://arac-karar-motoru.vercel.app
