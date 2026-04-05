# Araç Karar Motoru - UI Bileşenleri Rehberi

## Oluşturulan Bileşenler

Tüm bileşenler **Tailwind CSS** ile stil alınmış, **TypeScript** ile yazılmış ve **lucide-react** iconlarını kullanmaktadır.

### Layout Bileşenleri (`components/layout/`)

#### 1. **Header.tsx**
Ana navigasyon başlığı, logo ve menü.

**Özellikler:**
- Logo: "Araç Karar Motoru" metin + Calculator ikonu
- Masaüstü navigasyon (Anasayfa, Ücretsiz Araçlar dropdown, Karar Raporu, Metodoloji)
- "Rapor Al →" CTA butonu (orange accent)
- Mobil hamburger menü
- Yapışkan (sticky) header blur backdrop ile

**Kullanım:**
```tsx
import Header from "@/components/layout/Header";

// Header otomatik olarak Layout wrapper içinde yer alır
```

#### 2. **Footer.tsx**
Alt kısım bileşeni, şirket bilgisi ve linkler.

**Özellikler:**
- Şirket açıklaması
- Hızlı linkler (Hakkımızda, Metodoloji, SSS, İletişim, Gizlilik, KVKK)
- İletişim bilgileri (email, telefon)
- "Son güncelleme: Nisan 2026" badge
- Copyright bildirimi

**Kullanım:**
```tsx
import Footer from "@/components/layout/Footer";

// Footer otomatik olarak Layout wrapper içinde yer alır
```

#### 3. **Layout.tsx**
Tüm sayfaları sarmalayan ana layout bileşeni.

**Özellikler:**
- Header + Main Content + Footer yapısı
- Flexbox ile en az ekran yüksekliği (full height layout)

**Kullanım:**
```tsx
import Layout from "@/components/layout/Layout";

// app/layout.tsx içinde kullanılır
<Layout>{children}</Layout>
```

---

### UI Bileşenleri (`components/ui/`)

#### 4. **Button.tsx**
Yeniden kullanılabilir buton bileşeni.

**Props:**
- `variant`: "primary" | "secondary" | "outline" | "ghost"
- `size`: "sm" | "md" | "lg"
- `children`: React.ReactNode

**Kullanım:**
```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md">
  Rapor Al →
</Button>

<Button variant="secondary" size="lg">
  Detaylı Bilgi
</Button>

<Button variant="outline" size="sm">
  İptal
</Button>

<Button variant="ghost">
  Daha Fazla
</Button>
```

**Renkler:**
- Primary: Orange (#F97316)
- Secondary: Dark Blue (#1B2A4A)
- Outline: Gray border
- Ghost: Transparent

---

#### 5. **Input.tsx**
Stil alınmış input alanı, label, helper text ve error state desteği.

**Props:**
- `label`: Etiket metni
- `helperText`: Yardımcı metin
- `error`: Boolean - hata durumu
- `errorMessage`: Hata mesajı
- `turkishNumberFormat`: Boolean - Türkçe sayı formatı (#.###)
- Tüm standart HTML input özellikleri

**Kullanım:**
```tsx
import { Input } from "@/components/ui";

<Input
  label="Araç Fiyatı"
  placeholder="500.000"
  type="number"
  turkishNumberFormat={true}
/>

<Input
  label="E-posta"
  type="email"
  error={true}
  errorMessage="Geçersiz e-posta"
/>

<Input
  label="Adınız"
  helperText="Tam adınızı giriniz"
/>
```

---

#### 6. **Select.tsx**
Stil alınmış dropdown select bileşeni.

**Props:**
- `label`: Etiket metni
- `options`: SelectOption[] (value, label)
- `placeholder`: Placeholder metni
- `helperText`: Yardımcı metin
- `error`: Boolean
- `errorMessage`: Hata mesajı

**Kullanım:**
```tsx
import { Select } from "@/components/ui";

<Select
  label="Araç Türü"
  placeholder="Seçiniz..."
  options={[
    { value: "sedan", label: "Sedan" },
    { value: "suv", label: "SUV" },
    { value: "coupe", label: "Coupe" },
  ]}
/>
```

---

#### 7. **Card.tsx**
Yeniden kullanılabilir kart bileşeni, üç varyant ile.

**Props:**
- `variant`: "default" | "highlighted" | "premium"
- `children`: React.ReactNode

**Kullanım:**
```tsx
import { Card } from "@/components/ui";

<Card variant="default">
  <h3>Standart Kart</h3>
  <p>İçerik buraya gelir.</p>
</Card>

<Card variant="highlighted">
  <h3>Vurgulanan Kart</h3>
  <p>Orange gradyan arka plan.</p>
</Card>

<Card variant="premium">
  <h3>Premium Kart</h3>
  <p>Dark blue arka plan, white text.</p>
</Card>
```

---

#### 8. **PriceTag.tsx**
Türkçe formatlanmış fiyat gösterimi.

**Props:**
- `amount`: number - Tutarı (₺)
- `period`: "yearly" | "monthly" | "none"
- `showCurrency`: Boolean - ₺ simgesini göster (default: true)
- `className`: Custom CSS classes

**Kullanım:**
```tsx
import { PriceTag } from "@/components/ui";

<PriceTag amount={47300} period="yearly" />
// Output: ₺47.300/yıl

<PriceTag amount={3941} period="monthly" />
// Output: ₺3.941/ay

<PriceTag amount={500000} />
// Output: ₺500.000
```

---

#### 9. **ConfidenceBadge.tsx**
Veri güven seviyesi badge'ı.

**Props:**
- `level`: "kesin" | "yaklaşık" | "tahmini"
- `className`: Custom CSS classes

**Görünüm:**
- Kesin: Yeşil checkmark (✅)
- Yaklaşık: Sarı uyarı (⚠)
- Tahmini: Orange uyarı (⚠)

**Kullanım:**
```tsx
import { ConfidenceBadge } from "@/components/ui";

<ConfidenceBadge level="kesin" />
// ✅ Kesin

<ConfidenceBadge level="yaklaşık" />
// ⚠ Yaklaşık

<ConfidenceBadge level="tahmini" />
// ⚠ Tahmini
```

---

#### 10. **ResultCard.tsx**
Hesaplama sonuçlarını görüntülemek için özel kart.

**Props:**
- `icon`: LucideIcon - lucide-react ikonu
- `label`: string - Başlık (örn: "MTV Hesaplama")
- `value`: number - Tutarı
- `period`: "yearly" | "monthly" | "none"
- `confidence`: "kesin" | "yaklaşık" | "tahmini"
- `description`: string (opsiyonel)
- `className`: Custom CSS classes

**Kullanım:**
```tsx
import { ResultCard } from "@/components/ui";
import { DollarSign } from "lucide-react";

<ResultCard
  icon={DollarSign}
  label="MTV Hesaplama"
  value={8500}
  period="yearly"
  confidence="kesin"
  description="Yıllık Motor Vergisi"
/>
```

---

#### 11. **CTABanner.tsx**
Call-to-action banner bileşeni, gradient ve blur arka plan ile.

**Props:**
- `title`: string
- `description`: string
- `buttonText`: string
- `onButtonClick`: () => void (opsiyonel)
- `showBlurPreview`: Boolean (default: true)
- `className`: Custom CSS classes

**Kullanım:**
```tsx
import { CTABanner } from "@/components/ui";

<CTABanner
  title="Detaylı Rapor İçin"
  description="Araç satın alma kararınızı desteklemek için kapsamlı bir rapor oluşturun."
  buttonText="Rapor Al →"
  onButtonClick={() => console.log("CTA clicked")}
/>
```

---

### Renk Şeması

Tüm bileşenler aşağıdaki renk paletini kullanmaktadır:

```css
/* Primary Colors */
--color-primary-dark: #1B2A4A;      /* Dark Blue */
--color-primary-light: #ffffff;     /* White */
--color-accent-orange: #F97316;     /* Orange */
--color-accent-orange-hover: #EA580C;

/* Semantic Colors */
--color-success: #10B981;           /* Green */
--color-warning: #FBBF24;           /* Yellow */
--color-danger: #EF4444;            /* Red */
--color-info: #3B82F6;              /* Blue */

/* Grays */
--color-gray-50 to --color-gray-900
```

---

### İçe Aktarma (Imports)

Tüm UI bileşenleri `components/ui/index.ts` dosyasından kolayca içe aktarılabilir:

```tsx
// Bireysel import
import { Button, Card, Input } from "@/components/ui";

// Tür import
import type { ButtonProps, CardProps } from "@/components/ui";
```

---

### Responsive Tasarım

Tüm bileşenler responsive tasarlandı:
- **Mobil**: Tam genişlik, dikey düzen
- **Tablet**: Grid düzeni, optimize edilmiş aralık
- **Masaüstü**: Full layout, multi-kolon

Tailwind breakpoints kullanılmıştır:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

---

### TypeScript Desteği

Tüm bileşenler tam TypeScript desteğine sahiptir:

```tsx
import { Button, type ButtonProps } from "@/components/ui";

const CustomButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

---

## Proje Yapısı

```
src/
├── app/
│   ├── globals.css          # Tailwind + CSS değişkenleri
│   ├── layout.tsx           # Root layout + metadata
│   └── page.tsx             # Anasayfa (bileşen showcase)
├── components/
│   ├── layout/
│   │   ├── Header.tsx       # Navigasyon başlığı
│   │   ├── Footer.tsx       # Alt bilgi
│   │   └── Layout.tsx       # Wrapper layout
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Card.tsx
│       ├── PriceTag.tsx
│       ├── ConfidenceBadge.tsx
│       ├── ResultCard.tsx
│       ├── CTABanner.tsx
│       └── index.ts         # Tüm bileşenlerin exports
└── lib/
    ├── calculations.ts      # TCO hesaplama motoru
    ├── types.ts             # TypeScript types
    └── ...
```

---

## Geliştirme Notları

1. **Türkçe İçerik**: Tüm etiketler ve açıklamalar Türkçedir
2. **Erişilebilirlik**: ARIA labels ve semantic HTML kullanılmıştır
3. **Performans**: Server Components kullanılmış, Client Components sadece interaktif öğeler için
4. **Stil Sistemı**: CSS değişkenler + Tailwind utility classes kombinasyonu
5. **İkonlar**: Lucide-react library'si kullanılmıştır

---

## Hızlı Başlama

Anasayfada (`src/app/page.tsx`) tüm bileşenlerin kullanım örnekleri mevcuttur:

```bash
npm run dev
# http://localhost:3000 açılır
```

---

## Build

```bash
npm run build
# Production build oluşturur
```

---

## Lisans

Araç Karar Motoru © 2026
