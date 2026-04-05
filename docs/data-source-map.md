# Veri Kaynak Haritası — Araç Karar Motoru

Her modülün hangi veriden beslendiğini, kaynağını, güncelleme tarihini ve güven seviyesini gösterir.

## Kaynak Tablosu

| Modül | Veri Dosyası | Kaynak | URL | Tarife Tarihi | Güncelleme | Güven |
|-------|-------------|--------|-----|---------------|------------|-------|
| MTV | `src/data/mtv.ts` | GİB | gib.gov.tr | 2026-01-01 | 2026-01-01 | Kesin |
| Muayene | `src/data/muayene.ts` | TÜVTÜRK | tuvturk.com.tr | 2026-01-01 | 2026-01-01 | Kesin |
| Köprü/Tünel | `src/data/routes/toll-segments.ts` | KGM | kgm.gov.tr | 2026-01-01 | 2026-04-05 | Kesin |
| Otoyol segment | `src/data/routes/toll-segments.ts` | KGM (tahmin) | kgm.gov.tr | 2026-01-01 | 2026-04-05 | Tahmini |
| Otoyol (eski) | `src/data/otoyol.ts` | KGM | kgm.gov.tr | 2026-01-01 | 2026-04-05 | Kesin |
| Yakıt fiyatları | `src/data/yakit.ts` | PETDER | petder.org.tr | 2026-01-15 | 2026-01-15 | Yaklaşık |
| Amortisman | `src/data/amortisman.ts` | OYDER | oyder.org.tr | 2026-01-15 | 2026-01-15 | Tahmini |
| Araç DB | `src/data/araclar.ts` | OYDER/Üretici | oyder.org.tr | 2026-04-05 | 2026-04-05 | Yüksek |
| Noter | `src/data/noter.ts` | Adalet Bakanlığı | noterlerbirligi.org.tr | 2026-01-01 | 2026-01-01 | Kesin |
| İl/İlçe koordinat | `src/data/locations/` | Coğrafi veri | — | — | 2026-04-05 | Kesin |
| Rota grafı | `src/data/routes/graph.ts` | Harita verileri | — | — | 2026-04-05 | Yüksek |

## Hesaplama Modülleri

| Modül | Hesap Dosyası | Girdi | Çıktı | Güven |
|-------|--------------|-------|-------|-------|
| MTV | `src/lib/mtv/calculator.ts` | motor hacmi, yaş, yakıt | yıllık TL | Kesin |
| Muayene | `src/lib/muayene/calculator.ts` | araç tipi, yaş, yakıt | yıllık TL | Kesin |
| Rota | `src/lib/route/route-engine.ts` | ilçe A, ilçe B, araç | km, TL, süre | Yüksek/Tahmini |
| TCO | `src/lib/calculations.ts` | araç, km, yakıt, kredi | toplam TL | Karma |
| Rapor | `src/lib/report/generator.ts` | TCO sonucu | etiketli rapor | — |

## Güncelleme Akışı

1. Resmi kurum yeni tarife yayınlar (GİB, TÜVTÜRK, KGM)
2. İlgili data dosyası güncellenir (`src/data/*.ts`)
3. `effectiveDate` ve `lastUpdated` alanları yenilenir
4. Golden testler çalıştırılır — değerler kontrol edilir
5. UI'da tarihler otomatik güncellenir (veri dosyasından dinamik okunur)
6. `src/data/reference/*/changelog.md`'ye güncelleme notu eklenir

## Veri Sınıfları

| Sınıf | Kod | Açıklama |
|-------|-----|----------|
| Resmi Sabit | `official_fixed` | Yılda 1 kez değişen tarife (MTV, muayene) |
| Resmi Periyodik | `official_periodic` | Düzenli güncellenen resmi veri (köprü ücretleri) |
| Benchmark | `benchmark` | Sektör ortalaması (OYDER, PETDER) |
| Kullanıcı Girdisi | `user_input` | Kullanıcının girdiği değer (km, yakıt fiyatı) |
| Model Çıktısı | `derived_model` | Hesaplama modeli sonucu (amortisman tahmini) |
