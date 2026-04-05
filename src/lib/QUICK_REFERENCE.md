# Araç Karar Motoru - Hızlı Başlangıç Kılavuzu

## En Sık Kullanılan Fonksiyonlar

### 1. TCO Hesapla (Ana Fonksiyon)
```typescript
import { calculateTCO } from '@/lib';

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

// Sonuçlar:
console.log(tco.toplamMaliyet);          // ₺ Toplam
console.log(tco.ortalamAylikMaliyet);    // ₺ Aylık ort.
console.log(tco.kmBasiMaliyet);          // ₺/km
console.log(tco.breakdown);              // Detaylı dökümü
```

### 2. Karar Tavsiyesi Oluştur
```typescript
import { generateKararOzeti } from '@/lib';

const karar = generateKararOzeti(tco, aracFiyati, kiralikFiyat);

// Çıktı:
console.log(karar.tavsiye);    // "AL" | "KIRALA" | "BEKLE"
console.log(karar.puanlar);    // { al: 65, kirala: 20, bekle: 15 }
console.log(karar.nedenler);   // string[]
console.log(karar.risikler);   // string[]
console.log(karar.firsatlar);  // string[]
```

### 3. Araçları Karşılaştır
```typescript
import { karsilastir } from '@/lib';

const araclar = [arac1, arac2, arac3]; // En fazla 3 araç
const karsilastirma = karsilastir(araclar);

console.log(karsilastirma.enUcuzSonuc);           // TCOResult
console.log(karsilastirma.enDusukkKmBasiMaliyet); // TCOResult
console.log(karsilastirma.tavsiyelensinSirasi);   // TCOResult[]
```

### 4. Para Biçimlendirme
```typescript
import { formatTL, formatKmBasiMaliyet, formatAylikMaliyet } from '@/lib';

formatTL(850000);           // "₺850.000,00"
formatShortTL(850000);      // "850K₺"
formatAylikMaliyet(5500);   // "₺5.500,00/ay"
formatKmBasiMaliyet(1.25);  // "₺1,25/km"
```

## TCOParams Objesi

```typescript
interface TCOParams {
  // Araç özellikleri
  aracFiyati: number;           // ₺
  motorHacmi: number;           // cc (1000, 1200, 1600 vb)
  aracYasi: number;             // yıl (0 = yeni)
  yapiYili: number;             // 2024, 2023 vb
  segment: 'kompakt' | 'sedan' | 'suv' | 'minivan' | 'kargo';
  marka: string;                // "Toyota", "Honda" vb
  yakitTupu: 'benzin' | 'dizel' | 'lpg' | 'hibritleri' | 'elektrik';

  // Kullanım bilgileri
  tahminiYakitTuketimi: number; // L/100km (5.5, 6.5, 7.0 vb)
  yillikKm: number;             // 12000, 15000, 20000 vb

  // Finansman
  pesinOdeme: boolean;          // true = peşin, false = kredi
  krediFaizi?: number;          // % yıllık (8, 9.5, 12 vb)
  krediVadesi?: number;         // ay (36, 48, 60 vb)
  ilkOdeme?: number;            // ₺ (down payment)

  // Yakıt fiyatı
  yakitFiyati: number;          // ₺/L (30.5, 28.5, 15 vb)

  // Sigortacılık (opsiyonel, tahmin edilebilir)
  kaskoTahmini?: number;        // ₺ yıllık
  trafikSigortasiTahmini?: number; // ₺ yıllık

  // Analiz periyodu
  periyot: '12ay' | '36ay' | '60ay';
}
```

## TCOResult Yapısı

```typescript
interface TCOResult {
  aracBilgisi: AracBilgisi;      // Araç detayları
  parameters: TCOParams;         // Kullanılan parametreler
  breakdown: TCOBreakdown;       // Detaylı maliyet dökümü

  // Özet rakamlar
  toplamMaliyet: number;         // Toplam ₺
  ortalamAylikMaliyet: number;   // Aylık ort. ₺
  kmBasiMaliyet: number;         // ₺/km
  periyot: string;               // "12ay", "36ay" vb
}
```

## Breakdown Yapısı

```typescript
// breakdown.mtv
{
  aylikTutarlar: number[];  // Her ayın MTV'si
  toplam: number;           // Toplam MTV
}

// breakdown.yakit
{
  aylikHarcama: number;     // Aylık yakıt ₺
  toplam: number;           // Toplam yakıt ₺
}

// breakdown.sigorta
{
  kasko: number;            // Yıllık kasko ₺
  trafik: number;           // Yıllık trafik ₺
  toplam: number;           // Toplam sigorta ₺
}

// breakdown.krediMaliyeti
{
  anapara: number;          // Kredi tutarı
  aylikTaksit: number;      // Aylık taksit
  toplamOdeme: number;      // Toplam ödenecek
  toplamFaiz: number;       // Toplam faiz
  faizOrani: number;        // Faiz % (aylık)
  vade: number;             // Aylar
}

// breakdown.amortisman
{
  yillikDegerKaybi: number; // Yıllık değer kaybı
  kalanDeger: number;       // Periyot sonrası kalan değer
  toplamDegerKaybi: number; // Toplam değer kaybı
}

// breakdown.bakim
{
  aylikTahmini: number;     // Aylık bakım tahmin
  toplam: number;           // Toplam bakım
}

// breakdown.muayene
{
  maliyeti: number;         // Bir muayenenin maliyeti
  periyodu: number;         // Kaçayda bir (ay)
  kaçKez: number;           // Kaç kez olacak
  toplam: number;           // Toplam muayene
}
```

## Eksik/Opsiyonel Parametreleri Ayarlama

### Kasko Sigortası
Eğer `kaskoTahmini` sağlanmazsa otomatik olarak hesaplanır:
```typescript
// Formül: Araç Fiyatı × %1.5 (ortalama)
// Yaş arttıkça oran azalır
```

### Trafik Sigortası
```typescript
// Standart Türkiye tarifesi: ₺300-800 arası
// Araç fiyatına göre ayarlanır
```

### Kredi Parametreleri
```typescript
// pesinOdeme = true ise krediyle ilgili parametreler yok sayılır
// pesinOdeme = false ise krediFaizi ve krediVadesi zorunlu
```

## Sık Yapılan Hatalar

❌ **Hatalı:**
```typescript
krediFaizi: 8.5  // Yanlış - bu %8.5'i temsil eder
```

✓ **Doğru:**
```typescript
krediFaizi: 8.5  // %8.5 yıllık faiz (aylık 0.708% olur)
```

---

❌ **Hatalı:**
```typescript
tahminiYakitTuketimi: 100  // Hata - litre miktarı çok yüksek
```

✓ **Doğru:**
```typescript
tahminiYakitTuketimi: 6.5  // 6.5 L/100km
```

---

❌ **Hatalı:**
```typescript
karsilastir([arac1, arac2, arac3, arac4])  // 4 araç = hata
```

✓ **Doğru:**
```typescript
karsilastir([arac1, arac2, arac3])  // Max 3 araç
```

## Tipik Yakıt Tüketim Değerleri

| Segment | Benzin | Dizel | Hibrit |
|---------|--------|-------|--------|
| Kompakt | 5.5-6.5 | 4.5-5.5 | 4.5-5.0 |
| Sedan | 6.5-7.5 | 5.0-6.0 | 5.0-5.5 |
| SUV | 7.5-9.0 | 6.0-7.0 | 6.0-7.0 |
| Minivan | 8.0-10.0 | 6.5-7.5 | 6.5-7.5 |

## Tipik Segment Örnekleri

- **Kompakt**: Hyundai i20, Ford Fiesta, Renault Clio
- **Sedan**: Toyota Corolla, Honda Civic, Volkswagen Passat
- **SUV**: Toyota RAV4, Hyundai Tucson, Renault Captur
- **Minivan**: VW Transporter, Mercedes V-Class
- **Kargo**: Ford Transit, Renault Master

## Debug İpuçları

```typescript
// Detaylı maliyet dökümü görmek
console.table(tco.breakdown);

// İndividual maliyetleri kontrol etmek
console.log('MTV:', tco.breakdown.mtv.toplam);
console.log('Yakıt:', tco.breakdown.yakit.toplam);
console.log('Sigorta:', tco.breakdown.sigorta.toplam);
console.log('Bakım:', tco.breakdown.bakim.toplam);
console.log('Amortisman:', tco.breakdown.amortisman.toplamDegerKaybi);

// Kredi detayları
if (tco.breakdown.krediMaliyeti.vade > 0) {
  console.log('Aylık taksit:', tco.breakdown.krediMaliyeti.aylikTaksit);
  console.log('Toplam faiz:', tco.breakdown.krediMaliyeti.toplamFaiz);
}
```

## Daha Fazla Bilgi

Detaylı dökümentasyon için `README.md` dosyasını okuyun.
