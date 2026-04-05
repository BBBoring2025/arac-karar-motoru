# Araç Karar Motoru - Hesaplama Motoru

Bu klasör, Araç Karar Motoru'nun çekirdek hesaplama motorunu içerir. TCO (Toplam Sahip Olma Maliyeti) hesaplamaları, araç karşılaştırmaları ve karar verme analizi yapar.

## Dosya Yapısı

### 1. **types.ts** - Tür Tanımları
Tüm TypeScript arayüzleri ve tipleri tanımlar:

- **AracBilgisi**: Araç hakkında temel bilgiler
- **TCOParams**: TCO hesaplama parametreleri
- **TCOResult**: TCO hesaplama sonucu
- **TCOBreakdown**: Detaylı maliyet dökümü
- **KarsilastirmaResult**: Araç karşılaştırma sonucu
- **KararOzeti**: Al/Kirala/Bekle tavsiyesi

### 2. **calculations.ts** - Hesaplama Motoru
Ana hesaplama fonksiyonları:

#### MTV (Motorlu Taşıt Vergisi)
```typescript
calculateMTV(motorHacmi: number, aracYasi: number, yapiYili: number): number
```
- Motor hacmi ve araç yaşına göre MTV hesaplar
- 2024 tarife esas alınır
- Yaş faktörü (%100 → %20 arasında değişir)

#### Yakıt Maliyeti
```typescript
calculateYakitMaliyeti(tuketim: number, yillikKm: number, yakitFiyati: number): number
```
- Yıllık yakıt harcaması hesaplar
- L/100km tüketim ve ₺/L fiyat esas alınır

#### Amortisman (Değer Kaybı)
```typescript
calculateAmortisman(aracFiyati: number, yil: number, segment: string): AmortismanBilgisi
```
- Segment bazlı değer kaybı tahmin eder
- İlk 5 yıl değişken oran, sonrası sabit %8 yıllık

#### Kredi Maliyeti
```typescript
calculateKrediMaliyeti(anapara: number, faizOrani: number, vade: number): KrediBilgisi
```
- Amortisman hesabı ile aylık taksiti hesaplar
- Toplam faiz ve ödeme detaylarını döner
- Ay-ay amortisman tablosu oluşturur

#### Sigorta Maliyeti
```typescript
calculateSigortaMaliyeti(aracFiyati: number, aracYasi: number, segment: string): SigortaBilgisi
```
- Kasko tahmini: %0.8 - %3 arası (yaş ve segment bazlı)
- Trafik sigortası: ₺300 - ₺800 arası

#### Bakım Maliyeti
```typescript
calculateBakimMaliyeti(marka: string, yillikKm: number, aracYasi: number): number
```
- Markaya özel bakım maliyeti tahminleri
- Yaş arttıkça artan bakım maliyeti

#### Muayene Maliyeti
```typescript
calculateMuayeneMaliyeti(aracTipi: string): number
```
- Araç türüne göre muayene ücretleri
- Standart muayene: ₺45

#### Ana Fonksiyon: TCO Hesapla
```typescript
calculateTCO(params: TCOParams): TCOResult
```
- Tüm maliyetleri koordine eder
- Detaylı dökümü döner
- 12, 36, 60 ay periyodları destekler

### 3. **comparisons.ts** - Karşılaştırma ve Tavsiye Motoru

#### Alternatif Araçlar Bul
```typescript
findAlternatifler(arac: AracBilgisi, budget: number): AlterbatifArac[]
```
- Segment ve motor hacmı bazlı alternatifler
- Uyumluluk puanı hesaplar (0-100)
- En uygun 3 araç döner

#### Araçları Karşılaştır
```typescript
karsilastir(araclar: AracBilgisi[]): KarsilastirmaResult
```
- En fazla 3 araç karşılaştırır
- En ucuz, en komforlu, en ekonomik seçenekleri bulur
- Tavsiye sırası döner

#### Karar Özeti Oluştur
```typescript
generateKararOzeti(tco: TCOResult, aracFiyati: number, kiralikFiyat?: number): KararOzeti
```
- AL/KIRALA/BEKLE tavsiyesi verir
- Puanlama sistemi: 0-100 puan arası
- Nedenler, riskler, fırsatlar ve beklentiler ekler

### 4. **formatters.ts** - Biçimlendirme Yardımcıları

#### Para Biçimlendirme
```typescript
formatTL(amount: number): string           // ₺1.234,56
formatShortTL(amount: number): string      // 1,2M₺ veya 500K₺
formatAylikMaliyet(amount: number): string // ₺5.678,90/ay
```

#### Sayı Biçimlendirme
```typescript
formatNumber(number: number, decimals?: number)  // 1.234.567,89
formatPercent(value: number): string             // 25,5%
formatKm(km: number): string                     // 15.000 km
formatKmBasiMaliyet(km: number): string          // ₺1,23/km
```

#### Metin Biçimlendirme
```typescript
formatSegment(segment: string): string  // "Sedan"
formatYakitTupu(type: string): string   // "Dizel"
formatAracYasi(yil: number): string     // "2 yıl" veya "Yeni"
formatPeriod(period: string): string    // "3 Yıl"
```

#### SEO Slug Oluşturma
```typescript
createSlug(text: string): string                          // "toyota-corolla"
createAracSlug(marka: string, model: string, yil: number) // "toyota-corolla-2023"
```

## Kullanım Örnekleri

### Basit TCO Hesaplama
```typescript
import { calculateTCO } from '@/lib';

const result = calculateTCO({
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

console.log(result.toplamMaliyet);     // Toplam maliyet
console.log(result.kmBasiMaliyet);     // KM başına maliyet
console.log(result.ortalamAylikMaliyet); // Aylık ortalama
```

### Araçları Karşılaştırma
```typescript
import { karsilastir } from '@/lib';

const araclar = [
  { marka: 'Toyota', model: 'Corolla', ... },
  { marka: 'Honda', model: 'Civic', ... },
  { marka: 'Hyundai', model: 'i20', ... }
];

const sonuc = karsilastir(araclar);
console.log(sonuc.tavsiyelensinSirasi); // Tavsiye sırası
console.log(sonuc.enUcuzSonuc);         // En ucuz seçenek
```

### Karar Tavsiyesi
```typescript
import { generateKararOzeti, formatTL } from '@/lib';

const tavsiye = generateKararOzeti(tcoResult, aracFiyati);
console.log(tavsiye.tavsiye);    // "AL" | "KIRALA" | "BEKLE"
console.log(tavsiye.puanlar);    // { al: 65, kirala: 25, bekle: 10 }
console.log(tavsiye.nedenler);   // Neden bu tavsiye?
```

### Biçimlendirme
```typescript
import { formatTL, formatKm, formatPercent } from '@/lib';

console.log(formatTL(850000));      // "₺850.000,00"
console.log(formatKm(15000));       // "15.000 km"
console.log(formatPercent(0.35));   // "%35,0"
```

## Veritabanı İntegrasyonu

Şu anda `comparisons.ts` içinde simüle edilmiş bir araç veritabanı bulunur. Üretime geçmek için:

1. `/src/data/` klasöründe gerçek araç listesi (`vehicles.ts`) oluşturun
2. `generateAracDatabase()` fonksiyonunu güncelleyin
3. Veritabanından dinamik olarak çekin

## Hesaplama Mantığı

### MTV Tarifesi (2024)
- 0-1500cc: %3
- 1500-2000cc: %4
- 2000-3000cc: %5
- 3000cc+: %6.5

### Amortisman Oranları (Segment Bazlı)
- **Kompakt**: 15%, 12%, 10%, 8%, 8%
- **Sedan**: 14%, 12%, 10%, 8%, 8%
- **SUV**: 13%, 11%, 9%, 8%, 8%
- **Minivan**: 15%, 13%, 11%, 9%, 9%
- **Kargo**: 12%, 10%, 8%, 7%, 7%

### Bakım Maliyeti
- Toyota/Honda: ₺120/1000km
- Hyundai/Kia: ₺90/1000km
- Volkswagen: ₺140/1000km
- Yaş faktörü: +10% her yıl (3. yıldan sonra)

## Performans Notları

- Tüm hesaplamalar senkron ve hızlıdır (< 10ms)
- Edge case handling (sıfır değerler, negatif sayılar vb)
- Rounding: Para işlemleri 2 ondalık, yüzdelerde 1 ondalık

## İyileştirme Alanları

- [ ] Gerçek araç veritabanı entegrasyonu
- [ ] Regionlara göre farklı tarifeler (MTV, sigortacılık)
- [ ] Elektrik araç hesaplamaları iyileştirilmesi
- [ ] Kullanıcı geri bildirimi ile amortisman oranı güncellemesi
- [ ] Finansman seçenekleri çeşitlendirilmesi (taksit sayısı vb)

## Lisans

Bu kodlar Araç Karar Motoru projesi için geliştirilmiştir.
