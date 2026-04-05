# Araç Karar Motoru - Tüm Fonksiyonlar Listesi

## Hesaplama Fonksiyonları (calculations.ts)

### MTV Hesaplama
```typescript
calculateMTV(motorHacmi: number, aracYasi: number, yapiYili: number): number
```
Motor hacmi ve araç yaşına göre Motorlu Taşıt Vergisi (MTV) hesaplar.

**Parametreler:**
- `motorHacmi`: Motor hacmi (cc)
- `aracYasi`: Araç yaşı (yıl)
- `yapiYili`: Yapı yılı

**Dönüş:** Aylık MTV tutarı (₺)

**Örnek:**
```typescript
const mtv = calculateMTV(1200, 0, 2024); // ₺ aylık
```

---

### Yakıt Maliyeti
```typescript
calculateYakitMaliyeti(tuketim: number, yillikKm: number, yakitFiyati: number): number
```
Yıllık yakıt harcamasını hesaplar.

**Parametreler:**
- `tuketim`: L/100km cinsinden tüketim
- `yillikKm`: Yıllık kilometre
- `yakitFiyati`: Yakıt fiyatı (₺/L)

**Dönüş:** Yıllık yakıt maliyeti (₺)

**Örnek:**
```typescript
const yakit = calculateYakitMaliyeti(6.5, 15000, 30.5); // ₺ yıllık
```

---

### Amortisman Hesaplama
```typescript
calculateAmortisman(aracFiyati: number, yil: number, segment: string): AmortismanBilgisi
```
Araç değer kaybını hesaplar.

**Parametreler:**
- `aracFiyati`: Araç satın alma fiyatı (₺)
- `yil`: Yıl sayısı
- `segment`: Araç segmenti ('kompakt', 'sedan', 'suv', 'minivan', 'kargo')

**Dönüş:**
```typescript
{
  yillikDegerKaybi: number;  // ₺/yıl
  kalanDeger: number;        // ₺
  yuzde: number;            // %
}
```

**Örnek:**
```typescript
const amort = calculateAmortisman(850000, 3, 'sedan');
console.log(amort.kalanDeger); // 3. yıl sonrası kalan değer
```

---

### Kredi Maliyeti
```typescript
calculateKrediMaliyeti(anapara: number, faizOrani: number, vade: number): KrediBilgisi
```
Kredi hesaplaması ve amortisman tablosu oluşturur.

**Parametreler:**
- `anapara`: Kredi tutarı (₺)
- `faizOrani`: Aylık faiz oranı (%)
- `vade`: Vade (ay)

**Dönüş:**
```typescript
{
  anapara: number;
  faizOrani: number;
  vade: number;
  aylikTaksit: number;
  toplamOdeme: number;
  toplamFaiz: number;
  amortisman: AmortismanDetay[];
}
```

**Örnek:**
```typescript
const kredi = calculateKrediMaliyeti(680000, 0.708, 36); // 36 ay, %8.5 yıllık
console.log(kredi.aylikTaksit); // Aylık taksit
console.log(kredi.amortisman);  // Ay-ay detay
```

---

### Sigorta Maliyeti
```typescript
calculateSigortaMaliyeti(aracFiyati: number, aracYasi: number, segment: string): SigortaBilgisi
```
Kasko ve trafik sigortası tahmini yapar.

**Parametreler:**
- `aracFiyati`: Araç fiyatı (₺)
- `aracYasi`: Araç yaşı (yıl)
- `segment`: Araç segmenti

**Dönüş:**
```typescript
{
  kaskoTahmini: number;     // ₺ yıllık
  trafikSigortasi: number;  // ₺ yıllık
  toplam: number;           // ₺ yıllık
}
```

---

### Bakım Maliyeti
```typescript
calculateBakimMaliyeti(marka: string, yillikKm: number, aracYasi: number): number
```
Marka ve kullanıma göre bakım maliyeti tahmini.

**Parametreler:**
- `marka`: Araç markası ('Toyota', 'Honda', vb)
- `yillikKm`: Yıllık kilometre
- `aracYasi`: Araç yaşı

**Dönüş:** Yıllık bakım maliyeti tahmini (₺)

---

### Muayene Maliyeti
```typescript
calculateMuayeneMaliyeti(aracTipi: string): number
```
Araç tipi göre muayene ücretini döner.

**Parametreler:**
- `aracTipi`: 'kisisel', 'ticari', 'kamyon', 'otobüs'

**Dönüş:** Muayene ücretı (₺)

---

### TCO - Toplam Sahip Olma Maliyeti (ANA FONKSİYON)
```typescript
calculateTCO(params: TCOParams): TCOResult
```
Tüm maliyetleri hesaplayarak detaylı TCO analizi yapır.

**Parametreler:** Bkz. `TCOParams` tipi

**Dönüş:** `TCOResult` objesi (tüm detaylar dahil)

**Örnek:**
```typescript
const tco = calculateTCO({
  aracFiyati: 850000,
  motorHacmi: 1200,
  aracYasi: 0,
  yapiYili: 2024,
  segment: 'sedan',
  marka: 'Toyota',
  yakitTupu: 'benzin',
  tahminiYakitTuketimi: 6.5,
  yillikKm: 15000,
  pesinOdeme: true,
  yakitFiyati: 30.5,
  periyot: '36ay'
});
```

---

### KM Başına Maliyet
```typescript
calculateKmBasiMaliyet(tco: number, km: number): number
```
Toplam maliyeti km'ye bölerek birim maliyeti hesaplar.

**Parametreler:**
- `tco`: Toplam maliyet (₺)
- `km`: Toplam kilometre

**Dönüş:** KM başına maliyet (₺/km)

---

### Aylık Taksit
```typescript
calculateMonthlPayment(anapara: number, faizOrani: number, vade: number): number
```
Kırıldığında aylık sabit taksiti hesaplar.

**Dönüş:** Aylık taksit tutarı (₺)

---

## Karşılaştırma Fonksiyonları (comparisons.ts)

### Alternatif Araçlar Bul
```typescript
findAlternatifler(arac: AracBilgisi, budget: number): AlterbatifArac[]
```
Benzer özellikli 3 alternatif araç önerir.

**Parametreler:**
- `arac`: Referans araç
- `budget`: Bütçe sınırı (₺)

**Dönüş:** En uygun 3 araç (uyumluluk puanı ile)

---

### Araçları Karşılaştır
```typescript
karsilastir(araclar: AracBilgisi[]): KarsilastirmaResult
```
1-3 arasında araçı karşılaştırır ve sıralar.

**Parametreler:**
- `araclar`: Araç listesi (1-3 adet)

**Dönüş:**
```typescript
{
  araclar: TCOResult[];           // Tüm araçlar
  enUcuzSonuc: TCOResult;         // En ucuz
  enKomforluSonuc: TCOResult;     // En konforlu
  enDusukkKmBasiMaliyet: TCOResult; // En ekonomik
  tavsiyelensinSirasi: TCOResult[]; // Tavsiye sırası
}
```

---

### Karar Özeti Oluştur
```typescript
generateKararOzeti(tco: TCOResult, aracFiyati: number, kiralikFiyat?: number): KararOzeti
```
AL/KIRALA/BEKLE tavsiyesi verir.

**Parametreler:**
- `tco`: TCO analiz sonucu
- `aracFiyati`: Araç fiyatı
- `kiralikFiyat`: Kiralama aylık fiyatı (opsiyonel)

**Dönüş:**
```typescript
{
  tavsiye: 'AL' | 'KIRALA' | 'BEKLE';
  puanlar: { al: number; kirala: number; bekle: number; };
  nedenler: string[];
  risikler: string[];
  firsatlar: string[];
  beklentiler: { iyiSenaryo: string; kotiSenaryo: string; };
}
```

---

## Biçimlendirme Fonksiyonları (formatters.ts)

### Para Biçimlendirme
```typescript
formatTL(amount: number, showSymbol?: boolean): string
// "₺850.000,00"

formatShortTL(amount: number): string
// "850K₺" veya "1,2M₺"

formatAylikMaliyet(aylikMaliyet: number): string
// "₺5.500,00/ay"

formatMontlyPayment(aylikTaksit: number): string
// "₺1.234,56/ay"
```

---

### Sayı Biçimlendirme
```typescript
formatNumber(number: number, decimals?: number): string
// "1.234.567,89"

formatPercent(value: number, decimals?: number): string
// "25,5%"

formatKm(km: number): string
// "15.000 km"

formatKmBasiMaliyet(kmBasiMaliyet: number): string
// "₺1,23/km"
```

---

### Metin Biçimlendirme
```typescript
formatSegment(segment: string): string
// "Kompakt", "Sedan", "SUV" vb

formatYakitTupu(yakitTupu: string): string
// "Benzin", "Dizel", "LPG" vb

formatAracYasi(yil: number): string
// "Yeni", "1 yıl", "2 yıl" vb

formatYakitTuketimi(tuketim: number): string
// "6,5 L/100km"

formatMotorHacmi(motorHacmi: number): string
// "1,2L" (1200 cc)

formatPeriod(periyot: string): string
// "1 Yıl", "3 Yıl", "5 Yıl"

formatTavsiye(tavsiye: string): string
// "Satın Al", "Kirala", "Bekle"
```

---

### Tarih Biçimlendirme
```typescript
formatTarih(date: Date): string
// "5 Nisan 2026"

formatSaat(date: Date): string
// "14:30:45"
```

---

### Slug Oluşturma (SEO)
```typescript
createSlug(text: string): string
// "toyota-corolla"

createAracSlug(marka: string, model: string, yil: number): string
// "toyota-corolla-2023"
```

---

### Fark Analizi
```typescript
formatFark(değer1: number, değer2: number, biçim?: 'tutar' | 'yuzde' | 'km'): string
// "+₺100.000 (+12,5%)"
// "-₺50.000 (-6,8%)"
// "+5.000 km (+33,3%)"

formatDurum(deger: number, yi: number, koti: number): { durum: string; renkSinifi: string; }
// { durum: 'Iyi', renkSinifi: 'text-green-600 bg-green-50' }
```

---

### Özet Biçimlendirme
```typescript
formatOzet(baslik: string, deger: string | number): string
// "Aylık Maliyet: ₺5.500,00"

formatKrediOzet(aylikTaksit: number, vade: number, toplamFaiz: number): string
// "₺1.234,56/ay x 36 ay (3,0 yıl), toplam faiz: ₺50.000,00"

formatFaizOrani(faizOrani: number): string
// "%8,50 yıllık"
```

---

## Type Exports (types.ts)

### Ana Tipler
- `AracBilgisi` - Araç bilgisi
- `TCOParams` - TCO parametreleri
- `TCOResult` - TCO sonucu
- `TCOBreakdown` - TCO dökümü
- `KarsilastirmaResult` - Karşılaştırma sonucu
- `KararOzeti` - Karar tavsiyesi
- `AlterbatifArac` - Alternatif araç

### Alt Tipler
- `MtvBilgisi`
- `KrediBilgisi`
- `AmortismanDetay`
- `SigortaBilgisi`
- `BakimBilgisi`
- `AmortismanBilgisi`
- `YakitMaliyetiBilgisi`

---

## Index (index.ts)

Tüm fonksiyon ve tipleri merkezi olarak export eder:

```typescript
import {
  calculateTCO,
  generateKararOzeti,
  karsilastir,
  findAlternatifler,
  formatTL,
  formatKm,
  // ... ve tüm diğerleri
} from '@/lib';
```

---

## Fonksiyon Sayısı Özeti

- **Hesaplama**: 10 fonksiyon
- **Karşılaştırma**: 3 fonksiyon
- **Biçimlendirme**: 24 fonksiyon
- **Yardımcı**: 7 fonksiyon

**Toplam: 44+ fonksiyon ve 12+ type tanımı**

---

## Hızlı Referans

| Görev | Fonksiyon |
|-------|-----------|
| MTV hesapla | `calculateMTV()` |
| Yakıt maliyeti | `calculateYakitMaliyeti()` |
| Kredi hesapla | `calculateKrediMaliyeti()` |
| Tüm maliyetler | `calculateTCO()` ← **ANA** |
| Karşılaştır | `karsilastir()` |
| Tavsiye | `generateKararOzeti()` |
| Para biçimlendir | `formatTL()` |
| Slug yap | `createSlug()` |
| Tarih biçimlendir | `formatTarih()` |

---

Detaylı bilgi için `README.md` ve `QUICK_REFERENCE.md` dosyalarını okuyun.
