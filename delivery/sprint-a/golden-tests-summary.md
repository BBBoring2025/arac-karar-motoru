# Golden Tests Summary — Sprint A

Tüm test suite'leri, kaç assertion içerdiği, ne test ettiği ve hangi değerlere kilitli olduğu.

---

## Toplam Test Sayıları

| Suite | Dosya | Assertion | Locked Value | Durum |
|-------|-------|-----------|--------------|-------|
| Route engine | `src/lib/route/__tests__/route-engine.test.ts` | 34 | Kısmi | ✅ |
| Edge cases | `src/lib/route/__tests__/edge-cases.test.ts` | 16 | Loose | ✅ |
| MTV golden | `src/lib/mtv/__tests__/mtv.test.ts` | 35 | Snapshot value | ✅ |
| **Muayene golden** | `src/lib/muayene/__tests__/muayene.test.ts` | **21** | **Gerçek 2026 değer** | ✅ |
| Graf connectivity | `src/lib/route/__tests__/graph-connectivity.test.ts` | 3240 çift | — | ✅ |
| **TOPLAM** | — | **106 + 3240** | — | **Hepsi geçti** |

---

## Muayene Golden Tests (21 assertion) — TAMAMEN GERÇEK 2026 DEĞERİNE KİLİTLİ

Bu testler en kritik olanı. Her assertion gerçek TÜVTÜRK 2026 tarifesini doğrular.

### Test 1: Sıfır km araç (3 assertion)
- 0 yaş muaf
- Yıllık maliyet = 0 TL
- Periyot = 0 ay

### Test 2: 5 yaş otomobil benzin (4 assertion)
- Muaf değil
- Periyot 24 ay (2 yılda bir)
- **Tek ücret = 3.748 TL** (3.288 + 460 egzoz) ← **gerçek değer**
- Confidence = kesin

### Test 3: 10 yaş otomobil dizel (4 assertion)
- Muaf değil
- Periyot 12 ay (her yıl)
- **Tek ücret = 3.748 TL** ← **gerçek değer**
- **Yıllık = 3.748 TL**

### Test 4: Elektrikli araç egzoz farkı (3 assertion)
- **Elektrikli = 3.288 TL** (egzoz yok)
- **Benzinli = 3.748 TL** (egzoz dahil)
- **Fark = 460 TL** ← gerçek egzoz emisyon ücreti

### Test 5: Geriye uyumluluk (1 assertion)
- `calculateMuayeneMaliyeti()` ↔ `calculateMuayeneDetailed()` aynı değer

### Test 5b: Otobüs ağır vasıta (1 assertion)
- **Otobüs = 4.446 TL** ← **gerçek değer**

### Test 5c: Motosiklet (1 assertion)
- **Motosiklet = 1.674 TL** ← **gerçek değer**

### Test 6: Metadata (4 assertion)
- Confidence = kesin
- Kaynak TÜVTÜRK içeriyor
- sourceUrl dolu
- effectiveDate dolu

**Önemli**: Bu 21 assertion **gerçek 2026 değerlerine kilitli**. Gelecekte veri dosyası yanlış değerle güncellense **testler kırılır** — yani regresyondan koruma.

---

## MTV Golden Tests (35 assertion)

### Test 1-2: Benzin tarifesi snapshot (8 assertion)
- 1-1300cc: 3.950, 5.200, 7.100, 10.200, 15.800
- 1301-1600cc: 6.900, 9.100, 27.600

⚠️ Bu değerler **kod snapshot'ı**. Gerçek 2026 GİB değerleri yüksek. Test bu yüzden snapshot'ın iç tutarlılığını doğrular, gerçek tarifeleri DEĞİL.

### Test 3: Elektrikli araç (3 assertion)
- Her yaşta 0 TL ← **kesin** (2026 muafiyeti)

### Test 4: Hibrit (2 assertion)
- Tutar > 0
- Hibrit < Benzin (50% indirim)

### Test 5: Detaylı sonuç + confidence (8 assertion)
- yillikTutar = 3.950 (snapshot)
- aylikTutar > 0
- **confidence = 'yaklaşık'** ← Sprint A'da değişti
- yasGrubu = '1-3'
- tabloAdi dolu
- Kaynak GİB içeriyor
- sourceUrl dolu
- effectiveDate dolu
- **uyari mevcut + GİB içeriyor** ← Sprint A'da eklendi

### Test 5b: Elektrikli metadata (5 assertion)
- yillikTutar = 0
- **confidence = 'kesin'** ← elektrik için kesin kalır
- sourceUrl mevcut
- effectiveDate mevcut
- **uyari undefined** ← elektrik uyarı içermez (kesin)

### Test 5c: Hibrit confidence (3 assertion)
- Tutar > 0
- **confidence = 'yaklaşık'**
- uyari mevcut

### Test 6: Validasyon (5 assertion)
- Geçerli input
- motorHacmi=0 (elektrik değil) → hata
- Elektrikli motorHacmi=0 → geçerli
- Negatif yaş → hata
- Geçersiz yakıt → hata

---

## Route Engine Tests (34 assertion)

### Test 1-12: Çeşitli rotalar
- İstanbul → Bursa (Osmangazi köprüsü)
- Ankara → Konya
- İstanbul → Ankara (O-4)
- Bursa içi (Nilüfer → Osmangazi)
- İzmit → Kaş (771 km, 12 node) ← Sprint P2
- Toll breakdown segment tipi (köprü vs otoyol)

Assertion'lar `assertRange()` kullanıyor — sıkı değer kilitlemesi yerine plausible range kontrolü. Bu çoğu rota için doğru çünkü tam yol değişebilir.

---

## Edge Case Tests (16 assertion)

- Aynı ilçe seçimi
- Geçersiz ilçe ID
- Yakıt tüketimi 0
- Yakıt fiyatı 0
- Kısa mesafe (komşu ilçeler)
- Yüksek tüketim (25 L/100km)
- Vehicle class differences
- Round trip consistency

---

## Graf Connectivity (3240 çift)

81 il merkezi arası tüm 81×80/2 = 3240 çift için Dijkstra çalıştırıp rota bulunduğunu doğrular. Tüm il çiftleri erişilebilir.

---

## Sprint A'da Eklenmiş/Değişmiş Test Beklentileri

| Test | Önce | Sonra |
|------|------|-------|
| Muayene Test 2 | `tekMuayeneUcreti > 0` (loose) | `=== 3748` (locked) |
| Muayene Test 3 | `tekMuayeneUcreti > 0` (loose) | `=== 3748` + `yillikMaliyet === 3748` |
| Muayene Test 4 | `elektrik <= benzin` (loose) | `elektrik === 3288 && benzin === 3748 && fark === 460` (locked) |
| Muayene Test 5b (yeni) | YOK | `otobüs === 4446` |
| Muayene Test 5c (yeni) | YOK | `motosiklet === 1674` |
| MTV Test 5 | `confidence === 'kesin'` | `confidence === 'yaklaşık'` + `uyari mevcut` |
| MTV Test 5b (elektrikli) | `confidence === 'kesin'` | Kesin kalır + `uyari === undefined` |
| MTV Test 5c (yeni hibrit) | YOK | `confidence === 'yaklaşık'` + `uyari mevcut` |
