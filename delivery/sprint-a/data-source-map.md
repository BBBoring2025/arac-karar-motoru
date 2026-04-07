# Data Source Map — Sprint A (Post Truth Alignment)

Her hesaplama modülü için: kod dosyası → veri dosyası → resmi kaynak → güven seviyesi → doğrulama durumu.

---

## Hesaplama Modülleri

| Modül | Hesap Dosyası | Veri Dosyası | Resmi Kaynak | Güven | Doğrulama |
|-------|--------------|-------------|-------------|-------|-----------|
| **Muayene** | `src/lib/muayene/calculator.ts` | `src/data/muayene.ts` | TÜVTÜRK 2026 (3.288 / 4.446 / 1.674 TL + 460 TL egzoz) | Kesin | ✅ **Sprint A'da Sözcü/Hürriyet/TÜVTÜRK official ile doğrulandı** |
| **MTV** | `src/lib/mtv/calculator.ts` | `src/data/mtv.ts` | GİB tarife yapısı (snapshot) | Elektrik: Kesin / Diğer: **Yaklaşık** | ⚠️ Snapshot — 2026 zamları sonrası gerçek değerler farklı, kullanıcıya GİB linki gösteriliyor |
| **Köprü/Tünel** | `src/lib/route/toll-calculator.ts` | `src/data/routes/toll-segments.ts` | KGM 2026 (Osmangazi 995, Avrasya 280, 15 Temmuz 59 vb.) | Kesin | ✅ Önceki sprintlerde KGM resmi sayfalarıyla doğrulandı |
| **Otoyol Segment** | `src/lib/route/toll-calculator.ts` | `src/data/routes/toll-segments.ts` | KGM tarife yapısı (segment bazlı tahmin) | Tahmini | ⚠️ Gerçek gişe-gişe verisi yok |
| **Rota** | `src/lib/route/route-engine.ts` | `src/data/routes/graph.ts` + offsets | Karayolu graf + Haversine offset | Yüksek (max) / Tahmini | ⚠️ District offset her zaman tahmini |
| **Yakıt** | `src/lib/calculations.ts` (yakıt bölümü) | `src/data/yakit.ts` | PETDER snapshot | Yaklaşık | ⚠️ Snapshot, pompa fiyatları değişir |
| **Amortisman** | `src/lib/calculations.ts` | `src/data/amortisman.ts` | OYDER sektör verileri | Tahmini | ⚠️ Sektör ortalama |
| **Sigorta** | `src/lib/calculations.ts` | `src/data/araclar.ts` | OYDER benchmark | Tahmini | ⚠️ Benchmark, kişiye değişir |
| **Bakım** | `src/lib/calculations.ts` | `src/data/araclar.ts` | OYDER benchmark | Tahmini | ⚠️ Benchmark, marka/model değişir |
| **Noter** | `src/lib/calculations.ts` | `src/data/noter.ts` | Adalet Bakanlığı tarifesi | Kesin | ⚠️ Sprint A'da yeniden doğrulanmadı |
| **Araç DB** | — | `src/data/araclar.ts` | OYDER + üretici (161 model) | Yüksek | ⚠️ Liste fiyatı, bayii değişir |

---

## Veri Sınıfları (DataSource enum)

| Sınıf | Anlamı | Örnek |
|-------|--------|-------|
| `official_fixed` | Yılda 1 değişen resmi tarife | MTV, muayene |
| `official_periodic` | Düzenli güncellenen resmi veri | KGM köprü |
| `benchmark` | Sektör ortalaması | OYDER, PETDER |
| `user_input` | Kullanıcı girdisi | Yıllık km, kendi yakıt fiyatı |
| `derived_model` | Hesaplama modeli çıktısı | Amortisman tahmin curve |

---

## Kaynak URL'leri (Doğrulanabilir)

| Modül | Kaynak Label | URL |
|-------|--------------|-----|
| MTV | GİB 2026 MTV Tebliği | https://www.gib.gov.tr |
| MTV (kullanıcı için) | GİB MTV Hesaplama | https://dijital.gib.gov.tr/hesaplamalar/MTVHesaplama |
| Muayene | TÜVTÜRK 2026 Fiyat Listesi | https://www.tuvturk.com.tr/arac-muayene-fiyat-listesi.aspx |
| Köprü/tünel | KGM Tarifeleri | https://www.kgm.gov.tr |
| Yakıt | PETDER | https://www.petder.org.tr |
| Amortisman | OYDER | https://www.oyder.org.tr |
| Noter | Noterler Birliği | https://www.noterlerbirligi.org.tr |
| Araçlar | OYDER + üretici | https://www.oyder.org.tr |

---

## Sprint A'da Eklenen Metadata Alanları (MTVResult)

```typescript
interface MTVResult {
  yillikTutar: number;
  aylikTutar: number;
  tabloAdi: string;
  yasGrubu: string;
  motorHacmiBandi: string;
  confidence: DataConfidence;     // Yeni: dinamik (önceden sabit "kesin")
  kaynak: string;
  sourceUrl: string;
  effectiveDate: string;
  uyari?: string;                 // Yeni: yaklaşık değerler için uyarı
}
```

## Sprint A'da Eklenen Metadata Alanları (MuayeneResult)

```typescript
interface MuayeneResult {
  tekMuayeneUcreti: number;       // Sprint A'da gerçek 2026 değerine güncellendi
  periyotAy: number;
  yillikMaliyet: number;
  muafMi: boolean;
  muafNedeni?: string;
  confidence: 'kesin';            // Artık gerçekten kesin
  kaynak: string;
  sourceUrl: string;
  effectiveDate: string;
}
```
