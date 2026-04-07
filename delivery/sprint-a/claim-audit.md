# Claim Audit — Sprint A

Bu dokümanda Sprint A öncesi mevcut olan **kullanıcıya gösterilen iddialar** ile Sprint A sonrası gerçek durum karşılaştırılmıştır.

---

## 1. /araclar/muayene-ucreti — KRİTİK

### Önce (yanlış)

| Satır | İddia | Gerçek |
|-------|-------|--------|
| Otomobil periyodik (1-3 yaş) | 125 TL | **3.288 TL** |
| Otomobil periyodik (4+ yaş) | 150 TL | **3.288 TL** |
| Otomobil ilk muayene | 175 TL | **3.288 TL** |
| Egzoz emisyon (benzin) | 50 TL | **460 TL** |
| Egzoz emisyon (dizel) | 60 TL | **460 TL** |
| Otobüs periyodik (4+ yaş) | 240 TL | **4.446 TL** |
| Kamyon periyodik (4+ yaş) | 260 TL | **4.446 TL** |
| Motosiklet periyodik (4+ yaş) | 75 TL | **1.674 TL** |
| Confidence badge | "Kesin" (yeşil) | "Kesin" (artık gerçekten doğru) |
| Kaynak metni | "TÜVTÜRK 2026 Tarifesi" | Aynı (artık doğru) |

**Sapma:** Otomobil için **%96 yanlış**. Kullanıcı 175 TL bekleyip TÜVTÜRK'e gittiğinde 3.748 TL fatura görüyordu.

### Calculator Bug

Calculator string'leri Türkçe karakter olmadan yazılmıştı:
```typescript
"Periyodik Muayene (1-3 yas)"  // ❌ "yaş" değil "yas"
```
Veri dosyasındaki string ise:
```typescript
'Periyodik Muayene (1-3 yaş)'  // ✓ doğru
```

`Array.find()` her zaman `undefined` dönüyor → fallback `150` kullanılıyordu. Yani kullanıcı sayfada hangi araç tipini seçerse seçsin, sonuç hep 150 TL idi.

**Düzeltme:** Tüm string'ler birebir eşleştirildi, fallback 150 TL kaldırıldı.

### Sonra (doğru)

UI'da artık 5 yaş benzinli otomobil için **3.748 TL** (3.288 + 460 egzoz) gösteriyor — gerçek TÜVTÜRK 2026 tarifesi.

---

## 2. /araclar/mtv-hesaplama — MEDIUM

### Önce

| Element | İddia |
|---------|-------|
| Confidence badge | Hardcoded "Kesin" (yeşil) — tüm yakıt tipleri için |
| Bilgi kutusu | "Kaynak: GİB 2026 MTV Tebliği" |
| Uyarı | YOK |

**Sorun:** Kod 1-1300cc 1-3 yaş benzinli için **3.950 TL** diyor. 2026'daki gerçek GİB değeri **5.750 TL minimum** (Hürriyet/Bigpara doğrulaması). Kullanıcı "Kesin" badge'i görüp 3.950 TL'ye güveniyordu.

### Sonra

| Element | İddia |
|---------|-------|
| Confidence badge | Dinamik: Elektrik = "Kesin", diğerleri = "Yaklaşık" (sarı) |
| Bilgi kutusu | "GİB MTV tarife yapısı (2026 başlangıç snapshot)" + GİB linki |
| Sarı uyarı kutusu | "⚠️ Yaklaşık değer: Bu tutar GİB tarife yapısına göre hesaplanmıştır. Yıl içi güncellemeler için kesin tutarı GİB MTV Hesaplama aracından doğrulayın." |

Kullanıcı artık 3.950 TL'ye "kesin" sanıp güvenmiyor — yanında uyarı ve resmi GİB linki var.

---

## 3. /metodoloji — MEDIUM

### Önce

```
| Bileşen        | Kaynak                              | Güven |
| Rota Hesaplama | KGM Tarifeleri + İl/İlçe Koridor   | Kesin |
```

Tek satır, "Kesin" iddiası. Ama kod incelendiğinde:
- Köprü/tünel: kesin ✓
- Otoyol segment: tahmini
- District offset (Haversine): yaklaşık

Yani çoğu rota tahmini içeriyor ama tablo "Kesin" diyordu.

### Sonra

```
| Bileşen                          | Kaynak                          | Güven    |
| Rota — Köprü/Tünel Ücretleri     | KGM 2026 Resmi Tarifesi         | Kesin    |
| Rota — Otoyol Segment Ücretleri  | KGM tarife yapısı (segment)     | Tahmini  |
| Rota — İl/İlçe Mesafeleri        | Karayolu graf + Haversine offset | Yaklaşık |
```

Kullanıcı artık rota güvenirliğinin alt parçalarını görüyor.

---

## 4. /odeme — Production vs Local Parity

### Önce

- **Local (.env.local)**: iyzico sandbox keys mevcut → kod gerçek checkout flow çalıştırıyor
- **Vercel production**: iyzico env vars yok → /odeme "Ödeme Sistemi Hazırlanıyor" gösteriyor
- **status-p1.md**: "iyzico sandbox entegrasyonu — Tamamlandı" ✗ YALAN
- **entegrasyon-servisleri.txt** (eski masa üstü dosya): "iyzico SANDBOX ✅ AKTİF" ✗ YALAN

### Sonra

- **status-p1.md**: "Kod tamamlandı, deployment env vars bekliyor (production'da henüz aktif değil)"
- **runtime-status.md** (yeni): Production vs Local parity tablosu açıkça gösteriyor
- **/odeme sayfası**: Hâlâ "Hazırlanıyor" gösteriyor — **bu artık yalan değil çünkü doğru**

| Ortam | iyzico Env | /odeme Sayfası | Sandbox Çalışır mı? |
|-------|-----------|---------------|---------------------|
| Local | ✅ Var | Gerçek checkout flow | ✅ Evet |
| Vercel Production | ❌ Yok | "Hazırlanıyor" banner | ❌ Hayır |

---

## 5. Rota Engine `determineConfidence()` — LOW

### Önce

```typescript
if (allExact) return 'kesin';
```

Tüm edge'ler kesin → rota "kesin". **Ama district offset her zaman Haversine tahmini** — bu mantıkla "kesin" döndürmek yanlıştı.

### Sonra

```typescript
// Tüm edge kesin olsa bile district offset tahmini içerir
if (allExact) return 'yüksek';
```

Maksimum güven artık "yüksek". Hiçbir rota "kesin" iddiasında bulunmuyor.

---

## Kaldırılan Yanıltıcı Etiketler

| Sayfa | Önce | Sonra |
|-------|------|-------|
| MTV result card | "Kesin" (yeşil) | "Yaklaşık" (sarı) — elektrik haricinde |
| MTV bilgi kutusu | "GİB 2026 MTV Tebliği" | "GİB MTV tarife yapısı (2026 başlangıç snapshot)" |
| Metodoloji rota | "Kesin" (tek satır) | 3 alt satır (kesin/tahmini/yaklaşık) |
| status-p1.md | "Tamamlandı" | "Kod hazır, env bekliyor" |
| Rota engine output | Bazı rotalar "kesin" | Maksimum "yüksek" |

## Korunan Doğru Etiketler (sprint dışı, zaten doğruydu)

- Köprü/tünel ücretleri: "Kesin" (KGM 2026, doğrulanmış)
- Yakıt fiyatı: "Yaklaşık" (PETDER snapshot)
- Sigorta/Bakım: "Tahmini" (OYDER benchmark)
- Amortisman: "Tahmini" (OYDER sektör)
- Footer "Veriler periyodik olarak güncellenir": Doğru
- Ana sayfa "30 gün para iade": Önceki sprintlerde zaten kaldırılmış
