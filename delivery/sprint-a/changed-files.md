# Changed Files — Sprint A

**Commit:** `3c4d723`
**Toplam:** 12 dosya değişti, 529 ekleme, 115 silme

---

## Git Diff Stats

```
 docs/runtime-status.md                    |  85 ++++++++ (YENİ)
 docs/status-p1.md                         |  18 +++-
 docs/status-truth-alignment.md            | 146 ++++++++++++++ (YENİ)
 src/app/araclar/mtv-hesaplama/page.tsx    |  38 +++++++-
 src/app/metodoloji/page.tsx               |  17 +++-
 src/data/muayene.ts                       | 118 +++++++++++-------
 src/lib/mtv/__tests__/mtv.test.ts         |  55 ++++++++---
 src/lib/mtv/calculator.ts                 |  39 +++++---
 src/lib/mtv/types.ts                      |  25 +++--
 src/lib/muayene/__tests__/muayene.test.ts |  61 ++++++++++---
 src/lib/muayene/calculator.ts             |  29 +++---
 src/lib/route/route-engine.ts             |  13 ++-
```

---

## Dosya Bazlı Açıklama

### Yeni Dosyalar (2)

#### `docs/runtime-status.md` (85 satır)
**Amaç:** Tek doğruluk kaynağı — production vs local parity
**İçerik:**
- Production durumu tablosu (her servis için)
- Local development durumu
- Production'a tam aktif etmek için adımlar
- Build/test sağlığı
- Veri doğruluğu durumu

#### `docs/status-truth-alignment.md` (146 satır)
**Amaç:** Sprint A'da düzeltilen tüm iddiaların listesi
**İçerik:**
- Önce/sonra tabloları (muayene 95% sapma, MTV confidence vb.)
- String mismatch bug detayı
- Yeni test kapsamı
- Kalan sorumluluklar (Vercel env vars)

---

### Veri Dosyaları (1)

#### `src/data/muayene.ts` (+90 satır, -49 satır)
**Değişiklik:**
- Header comment güncellendi (TÜVTÜRK 2026 doğrulama kaynakları)
- Tüm 8 araç tipi gerçek 2026 değerlerine güncellendi:
  - Otomobil/Minibüs/Kamyonet/Elektrik: 175→**3.288**, 125→**3.288**, 150→**3.288**, 100→**1.644**
  - Otobüs/Kamyon/Tırlar: 220-260→**4.446**, tekrar→**2.223**
  - Motosiklet: 60-75→**1.674**, tekrar→**837**
  - Egzoz emisyon: 50-60→**460**
- `additionalFees` güncellendi: yola elverişlilik ücretleri eklendi (822 / 1.111,50)

---

### Lib Files (5)

#### `src/lib/muayene/calculator.ts` (+18, -11)
**Bug Fix:** String mismatch
- `"Periyodik Muayene (1-3 yas)"` → `"Periyodik Muayene (1-3 yaş)"` (Türkçe karakter)
- `"Egzoz Emisyon Olcum"` → `"Egzoz Emisyon Ölçüm"` (Türkçe karakter)
- Fallback `150` kaldırıldı, yerine `console.warn` + `0` döner
- 2 yerde fallback `150` → `0` (uydurma değer yok)

#### `src/lib/mtv/types.ts` (+15, -10)
**Tip Değişikliği:**
- `confidence: "kesin"` → `confidence: DataConfidence` (dinamik)
- `uyari?: string` field eklendi
- Header comment confidence politikası açıkladı
- `import { DataConfidence } from "@/lib/types"` eklendi

#### `src/lib/mtv/calculator.ts` (+25, -14)
**Confidence Politikası:**
- `GIB_DOGRULAMA_UYARISI` constant eklendi (GİB MTV Hesaplama linki)
- Elektrik return → `confidence: "kesin"` (her zaman 0)
- Hibrit return (her 2 path) → `confidence: "yaklaşık"` + uyari
- Benzin/dizel/lpg return (her 2 path) → `confidence: "yaklaşık"` + uyari
- Header comment güncellendi (snapshot vs gerçek tarife açıklaması)

#### `src/lib/route/route-engine.ts` (+10, -3)
**Confidence Mantığı:**
- `determineConfidence()` artık `allExact → 'yüksek'` döner (önceden `'kesin'`)
- Yorum eklendi: "district offset her zaman tahmini"
- Maksimum güven artık "yüksek"

---

### App / Page Files (2)

#### `src/app/araclar/mtv-hesaplama/page.tsx` (+33, -5)
**UI Değişiklikleri:**
- ConfidenceBadge dinamik: `level={selectedFuel === 'Elektrik' ? 'kesin' : 'yaklaşık'}`
- Sarı uyarı kutusu eklendi (elektrik haricinde):
  - "⚠️ Yaklaşık değer" başlığı
  - GİB MTV Hesaplama linki (target="_blank")
- Bilgilendirme metni güncellendi:
  - "GİB 2026 MTV Tebliği" → "GİB MTV tarife yapısı (2026 başlangıç snapshot)"
  - 2026 zamlarının yansımayabileceği uyarısı
  - Yeni paragraf: GİB hesap aracını kullanma talimatı

#### `src/app/metodoloji/page.tsx` (+12, -5)
**Veri Sources Tablosu:**
- "Rota Hesaplama" tek satırı kaldırıldı
- 3 yeni satır eklendi:
  - "Rota — Köprü/Tünel Ücretleri" → Kesin
  - "Rota — Otoyol Segment Ücretleri" → Tahmini
  - "Rota — İl/İlçe Mesafeleri" → Yaklaşık

---

### Test Files (2)

#### `src/lib/muayene/__tests__/muayene.test.ts` (+47, -14)
**Locked Value Conversions:**
- Test 2: `> 0` → `=== 3748` (3.288 + 460)
- Test 3: `> 0` → `=== 3748` + yıllık `=== 3748`
- Test 4: `<= benzin` → `elektrik === 3288 && benzin === 3748 && fark === 460`
- **Yeni Test 5b:** `otobüs === 4446`
- **Yeni Test 5c:** `motosiklet === 1674`
- Test 6 (metadata) korundu

Toplam: 17 → **21 assertion** (+4)

#### `src/lib/mtv/__tests__/mtv.test.ts` (+39, -16)
**Confidence Beklentileri Güncellendi:**
- Header comment: "yaklaşık beklentisi yok" → "snapshot iç tutarlılığı"
- Test 5: `confidence === 'kesin'` → `confidence === 'yaklaşık'` + `uyari` mevcut
- Test 5b (elektrikli): `confidence === 'kesin'` korundu + `uyari === undefined` eklendi
- **Yeni Test 5c:** Hibrit confidence === 'yaklaşık' + uyari mevcut

Toplam: 30 → **35 assertion** (+5)

---

### Doc Files (1)

#### `docs/status-p1.md` (+13, -5)
**Güncellemeler:**
- "Durum: Tamamlandı" → "Durum: Kod tamamlandı, deployment env vars bekliyor"
- "1. iyzico Sandbox Entegrasyonu" → "1. iyzico Sandbox Entegrasyonu — KOD HAZIR"
- Yeni paragraf: "⚠️ Production durumu" — Vercel env vars açıklaması
- Yeni bölüm: "Production vs Local Parity Notu" tablosuyla

---

## Commit Mesajı (özet)

```
fix: Production Truth Alignment — gerçek 2026 değerleri + dürüst confidence

KRİTİK DÜZELTMELER:
1. Muayene verisi (95% sapma giderildi) — 125 → 3.288 TL
2. Muayene calculator string mismatch BUG FIX
3. MTV confidence dürüst hale getirildi (yakl./kesin)
4. Metodoloji "Rota: Kesin" → 3 alt satır
5. Rota engine confidence düzeltildi (max yüksek)
6. Payment dokümantasyonu hizalandı

YENİ DOKÜMANTASYON:
- docs/runtime-status.md
- docs/status-truth-alignment.md
```
