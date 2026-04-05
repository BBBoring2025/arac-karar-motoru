# Araç Karar Motoru

Araç sahipliği maliyetlerini hesaplayan, karşılaştıran ve karar vermeyi destekleyen bir web uygulaması. Türkiye pazarına özel resmi ve sektörel veri kaynaklarıyla çalışır.

## Ne Yapar?

### Ücretsiz Araçlar
- **MTV Hesaplama** — GİB resmi tarifesiyle motor hacmi ve yaşa göre sabit tutar (formül yok, doğrudan tablo)
- **Muayene Ücreti** — TÜVTÜRK resmi tarifesiyle araç tipine göre muayene ücreti
- **Otoyol/Köprü/Tünel** — KGM resmi tarifesiyle 6 köprü/tünel + 12 otoyol segmenti
- **Yakıt Hesaplama** — PETDER referans fiyatları + WLTP tüketim verileri
- **Rota Maliyet** — 81 il, 969 ilçe arası yakıt + geçiş ücreti (Dijkstra koridor grafı)

### Karar Raporu (henüz aktif değil)
- TCO (Toplam Sahip Olma Maliyeti) analizi: 12, 36, 60 ay
- KM başı maliyet hesaplama
- Al / Kirala / Bekle tavsiyesi
- Ödeme sistemi hazırlanmaktadır

## Veri Kaynakları ve Güven Seviyeleri

| Veri | Kaynak | Güven |
|------|--------|-------|
| MTV tarifeleri | GİB | Kesin |
| Muayene ücretleri | TÜVTÜRK | Kesin |
| Köprü/tünel ücretleri | KGM | Kesin |
| Otoyol segment ücretleri | KGM (tahmini) | Tahmini |
| Yakıt fiyatları | PETDER | Yaklaşık |
| Amortisman | OYDER sektör verileri | Tahmini |
| Sigorta | OYDER benchmark | Tahmini |
| Bakım maliyeti | OYDER benchmark | Tahmini |
| Noter ücretleri | Adalet Bakanlığı | Kesin |

**Kural**: "Kesin" diyorsak gerçekten kesin. Emin değilsek "tahmini" deriz. Veri yoksa sayı uydurmak yerine "veri eksik" gösteririz.

## Teknik Yapı

```
Next.js 16.2 (App Router) + TypeScript (strict) + Tailwind CSS 4
Supabase (auth + DB) + Vercel (deploy)
```

### Önemli Dizinler

```
src/
├── app/                    # Next.js sayfalar
│   ├── araclar/            # 5 ücretsiz hesaplama aracı
│   └── api/                # Admin API routes
├── components/
│   ├── route/              # Rota hesaplama UI (10 komponent)
│   ├── layout/             # Header, Footer
│   └── ui/                 # Button, Card, Input vb.
├── data/
│   ├── locations/          # 81 il, 969 ilçe, 104 anchor
│   ├── routes/             # Koridor grafı (139 edge), toll segmentleri
│   ├── mtv.ts              # GİB 2026 MTV tarife tablosu
│   ├── muayene.ts          # TÜVTÜRK muayene ücretleri
│   ├── yakit.ts            # PETDER yakıt fiyatları + tüketim
│   ├── otoyol.ts           # KGM otoyol/köprü ücretleri
│   ├── araclar.ts          # 161 araç, 35+ marka
│   ├── amortisman.ts       # Değer kaybı oranları
│   └── noter.ts            # Noter ücret tarifesi
└── lib/
    ├── route/              # Rota hesaplama motoru
    │   ├── route-engine.ts # Ana motor
    │   ├── graph-search.ts # Dijkstra
    │   ├── toll-calculator.ts
    │   └── __tests__/      # 3 test dosyası
    ├── calculations.ts     # TCO hesaplama motoru
    ├── comparisons.ts      # Araç karşılaştırma
    ├── formatters.ts       # TL, km, yüzde formatlama
    └── types.ts            # TypeScript tip tanımları
```

## Kurulum

```bash
npm install
cp .env.local.example .env.local
# .env.local dosyasını Supabase bilgilerinizle doldurun
npm run dev
```

### Gerekli Ortam Değişkenleri

```
NEXT_PUBLIC_SUPABASE_URL=       # Supabase proje URL'i
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=      # Supabase service role key (server-side)
NEXT_PUBLIC_SITE_URL=           # Site URL (production)
```

## Testler

```bash
# Route engine testleri (10 test, 27 assertion)
npx tsx src/lib/route/__tests__/route-engine.test.ts

# Graf bağlantı testi (81 il, 3240 çift)
npx tsx src/lib/route/__tests__/graph-connectivity.test.ts

# Edge case testleri (8 test)
npx tsx src/lib/route/__tests__/edge-cases.test.ts
```

## Mevcut Durum

- **Ücretsiz araçlar**: Aktif ve çalışıyor
- **Rota motoru**: 81 il, 969 ilçe, tam bağlantılı graf
- **Ödeme sistemi**: Henüz aktif değil (iyzico entegrasyonu bekliyor)
- **Premium rapor**: TCO hesaplaması çalışıyor, PDF çıktı ve karşılaştırma yakında
- **Admin paneli**: Supabase auth ile korumalı, CRUD tablolar Supabase migration sonrası aktif

## Lisans

Tüm hakları saklıdır.
