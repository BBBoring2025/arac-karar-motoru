# Referans Veri Katmanı

Bu dizin, Araç Karar Motoru'nun tüm referans verilerinin kaynağını, şemasını ve güncelleme geçmişini tanımlar.

## Yapı

Her veri kategorisi kendi klasörüne sahiptir:

```
reference/
├── mtv/           # GİB MTV tarifeleri (kesin)
├── muayene/       # TÜVTÜRK muayene ücretleri (kesin)
├── tolls/         # KGM köprü/tünel/otoyol ücretleri (kesin/tahmini)
├── fuel/          # PETDER yakıt fiyatları (yaklaşık)
├── vehicle-consumption/  # WLTP tüketim verileri (yüksek)
├── amortization/  # OYDER değer kaybı oranları (tahmini)
├── maintenance/   # OYDER bakım maliyetleri (tahmini)
├── insurance/     # OYDER sigorta benchmark (tahmini)
└── credit/        # Kredi faiz referansları (kullanıcı girdisi)
```

## Her Klasörde

- `schema.ts` — Veri yapısı ve doğrulama kuralları
- `changelog.md` — Güncelleme geçmişi (tarih, ne değişti, kaynak)

## Veri Sınıfları

| Sınıf | Açıklama | Güven |
|-------|----------|-------|
| `resmi` | Resmi kurum tarifesi (GİB, TÜVTÜRK, KGM) | Kesin |
| `benchmark` | Sektör ortalaması (OYDER, PETDER) | Yaklaşık/Tahmini |
| `kullanici_girdisi` | Kullanıcı tarafından girilen değer | — |
| `model_tahmini` | Hesaplama modeli çıktısı | Tahmini |

## Canonical Veri Dosyaları

Gerçek veri dosyaları `src/data/` altında yaşar. Bu referans dizini onların kaynağını ve şemasını tanımlar:

| Referans | Canonical Dosya |
|----------|----------------|
| mtv/ | `src/data/mtv.ts` |
| muayene/ | `src/data/muayene.ts` |
| tolls/ | `src/data/routes/toll-segments.ts`, `src/data/otoyol.ts` |
| fuel/ | `src/data/yakit.ts` |
| vehicle-consumption/ | `src/data/araclar.ts` |
| amortization/ | `src/data/amortisman.ts` |
| maintenance/ | `src/data/araclar.ts` (maintenanceCostYearly) |
| insurance/ | `src/data/araclar.ts` (insurancePriceRange) |
| credit/ | Kullanıcı girdisi (referans faiz oranı yok) |
