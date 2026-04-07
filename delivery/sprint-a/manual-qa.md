# Manual QA Checklist — Sprint A

Sprint A'nın canlı production'da doğrulanması için adım adım manuel test listesi.

**Production URL:** https://arac-karar-motoru.vercel.app
**Commit:** `3c4d723`

---

## 1. /araclar/muayene-ucreti — KRİTİK

### Test 1.1: Otomobil 5 yaş benzin
- [ ] Sayfaya git
- [ ] Araç tipi: "Otomobil" seç
- [ ] Yapım yılı: 2021 seç (5 yaşında)
- [ ] Yakıt tipi: "Benzin"
- [ ] Beklenen sonuç: **3.748 TL** (3.288 muayene + 460 egzoz)
- [ ] Confidence badge: "Kesin" (yeşil)
- [ ] Kaynak: "TÜVTÜRK 2026 Muayene Ücret Tarifesi"
- [ ] **NOT 175 TL veya 150 TL göründüyse: ESKİ DEPLOYMENT**

### Test 1.2: Elektrikli araç
- [ ] Yakıt tipi: "Elektrik" seç
- [ ] Beklenen sonuç: **3.288 TL** (egzoz yok)
- [ ] Confidence: Kesin

### Test 1.3: Otobüs
- [ ] Araç tipi: "Otobüs"
- [ ] Beklenen sonuç: **4.446 TL**

### Test 1.4: Motosiklet
- [ ] Araç tipi: "Motosiklet"
- [ ] Beklenen sonuç: **1.674 TL**

---

## 2. /araclar/mtv-hesaplama — MEDIUM

### Test 2.1: Benzinli — Yaklaşık badge
- [ ] Motor hacmi: 1601-1800cc
- [ ] Yapım yılı: 2024
- [ ] Yakıt tipi: Benzin
- [ ] Confidence badge: **"Yaklaşık" (sarı)** — daha önce "Kesin" idi
- [ ] Sayfa altında **sarı uyarı kutusu** görünüyor mu?
  - "⚠️ Yaklaşık değer: ... GİB MTV Hesaplama aracından doğrulayın"
- [ ] GİB linki tıklanabilir mi? (https://dijital.gib.gov.tr/hesaplamalar/MTVHesaplama)

### Test 2.2: Elektrikli — Kesin badge korundu
- [ ] Yakıt tipi: Elektrik
- [ ] Sonuç: 0 TL
- [ ] Confidence badge: **"Kesin" (yeşil)** — elektrik için doğru
- [ ] **Sarı uyarı kutusu YOK** (kesin tutarda uyarı gerekmez)

### Test 2.3: Bilgilendirme metni
- [ ] Mavi info kutusunda yazan: "GİB MTV tarife yapısı (2026 başlangıç snapshot)"
- [ ] **Eski "GİB 2026 MTV Tebliği" yazıyorsa: ESKİ DEPLOYMENT**

---

## 3. /metodoloji — MEDIUM

### Test 3.1: Veri Sources tablosu
- [ ] Sayfayı bul: "Veri Kaynakları" tablosu
- [ ] **Eskiden tek "Rota Hesaplama" satırı vardı**
- [ ] Şimdi 3 satır olmalı:
  - [ ] "Rota — Köprü/Tünel Ücretleri" → Kesin
  - [ ] "Rota — Otoyol Segment Ücretleri" → Tahmini
  - [ ] "Rota — İl/İlçe Mesafeleri" → Yaklaşık
- [ ] Eski "Rota Hesaplama: Kesin" tek satırı YOK

### Test 3.2: Genel
- [ ] "Yetkili Servislerin Ortalama Ücret Listesi" → "OYDER Sektör Benchmark Verileri"
- [ ] "Günlük Güncelleme" → "Periyodik Güncelleme"

---

## 4. /odeme — Production State Check

### Test 4.1: Production'da hâlâ "hazırlanıyor"
- [ ] Sayfaya git
- [ ] Beklenen başlık: "Premium Raporlar"
- [ ] Beklenen ana mesaj: **"Ödeme Sistemi Hazırlanıyor"** (turuncu kutu)
- [ ] **NOT:** Bu kasıtlı — Vercel'de iyzico env vars yok
- [ ] Planlanan paketler 2 kart olarak gösterilmeli (Tekli + Karşılaştırma)
- [ ] "Ücretsiz Araçlara Git" butonu çalışmalı

### Test 4.2: Local sandbox (eğer test edilecekse)
- [ ] `.env.local` dosyasında IYZICO_API_KEY var mı?
- [ ] `npm run dev` ile lokal başlat
- [ ] /odeme sayfasında "hazırlanıyor" YERİNE 3-step flow görmen lazım
- [ ] Step 1: Ürün seç
- [ ] Step 2: Bilgi gir
- [ ] Step 3: iyzico checkout form (iframe)

---

## 5. /araclar/rota-maliyet — MEDIUM

### Test 5.1: Confidence — "Kesin" yok
- [ ] İstanbul Kadıköy → İstanbul Kadıköy (aynı ilçe)
  - Beklenen: ~0 km, confidence "yüksek"
- [ ] İstanbul Kadıköy → Bursa Osmangazi
  - Beklenen: ~155 km, **Osmangazi Köprüsü tollBreakdown'da**
  - Confidence: muhtemelen "tahmini" (mixed edges)
- [ ] **Hiçbir rota "Kesin" badge'i göstermemeli**

### Test 5.2: Toll breakdown
- [ ] Köprü segmentleri: Kesin (yeşil)
- [ ] Otoyol segmentleri: Tahmini (turuncu)

---

## 6. Veri Doğruluk Spot-Check (TÜVTÜRK Resmi Site)

Bu adım sprintin başarısının test edilmesi için.

- [ ] https://www.tuvturk.com.tr/arac-muayene-fiyat-listesi.aspx adresine git
- [ ] Otomobil periyodik muayene fiyatını oku
- [ ] Bizim sayfamızdaki 5 yaş otomobil sonucu (3.748 TL = 3.288 + 460) ile **eşleşmeli**

---

## 7. Hızlı Tarama Kontrolleri

### grep tabanlı:

```bash
# Yanlış muayene fiyatları kalmış mı?
grep -rn "amount: 125\|amount: 150\|amount: 175" src/data/muayene.ts
# Beklenen: 0 hit (gerçek değerler 1644+ veya 3288+)

# Hardcoded "5 Nisan 2026" kalmış mı?
grep -rn "5 Nisan 2026" src/app/
# Beklenen: 0 hit

# String mismatch tekrar oluşmuş mu?
grep -rn "Muayene (1-3 yas)\|Olcum (Benzin)" src/lib/muayene/
# Beklenen: 0 hit (Türkçe karakterli olmalı)

# MTV "kesin" hardcode'u kalmış mı?
grep -rn "confidence: \"kesin\"" src/lib/mtv/calculator.ts | grep -v elektrik
# Beklenen: Sadece elektrik path'lerinde kesin, diğerleri "yaklaşık"
```

---

## 8. Build / Test Sağlığı

```bash
cd /Users/optimusprime22/Desktop/arackararmotoru/arac-karar-motoru
export PATH="/usr/local/bin:$PATH"

# TypeScript
node node_modules/.bin/tsc --noEmit
# Beklenen: 0 hata

# Lint
npm run lint
# Beklenen: 0 hata

# Build
npm run build
# Beklenen: Başarılı

# Tüm testler
npx tsx src/lib/route/__tests__/route-engine.test.ts  # 34/34
npx tsx src/lib/route/__tests__/edge-cases.test.ts    # 16/16
npx tsx src/lib/mtv/__tests__/mtv.test.ts             # 35/35
npx tsx src/lib/muayene/__tests__/muayene.test.ts     # 21/21
npx tsx src/lib/route/__tests__/graph-connectivity.test.ts  # 3240 çift
```

---

## 9. Doc Tutarlılık Kontrolleri

- [ ] `docs/runtime-status.md` mevcut
- [ ] `docs/status-truth-alignment.md` mevcut
- [ ] `docs/status-p1.md` "Tamamlandı" yazmıyor, "Kod hazır, env bekliyor" yazıyor

---

## Kabul Kriterleri

| Kriter | Pass / Fail |
|--------|-------------|
| /araclar/muayene-ucreti otomobil 5 yaş benzin = 3.748 TL | [ ] |
| /araclar/mtv-hesaplama benzin için "Yaklaşık" badge | [ ] |
| /araclar/mtv-hesaplama elektrik için "Kesin" badge | [ ] |
| Sarı uyarı kutusu MTV'de görünüyor (elektrik haricinde) | [ ] |
| /metodoloji sayfasında 3 ayrı rota satırı | [ ] |
| /odeme "Ödeme Sistemi Hazırlanıyor" gösteriyor | [ ] |
| TypeScript / Lint / Build / Tüm testler temiz | [ ] |
| docs/runtime-status.md mevcut | [ ] |
