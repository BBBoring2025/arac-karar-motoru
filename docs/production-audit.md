# Production Audit Report — Araç Karar Motoru

**Tarih**: 5 Nisan 2026 (son güncelleme)
**Kapsam**: Tüm kullanıcı-facing sayfalar, veri katmanı, hesaplama motorları, modül mimarisi

## 1. Canlı Sitede Verilen Sözler vs Gerçeklik

### Doğru Sözler ✓
- 160+ araç modeli, 35+ marka → Doğru (161 araç, araclar.ts)
- 5 ücretsiz hesaplama aracı → Doğru (MTV, otoyol, yakıt, muayene, rota)
- 81 il, 969 ilçe rota hesaplama → Doğru (graf connectivity test: 3240/3240 çift)
- GİB MTV tarifeleri → Doğru (sabit lookup tablosu, formül YOK)
- KGM köprü/tünel ücretleri → Doğru (6 köprü/tünel, toll-segments.ts)
- PETDER yakıt referans fiyatları → Doğru (snapshot, periyodik güncelleme)

### Düzeltilen Sorunlar (Phase 1)

| Sorun | Durum | Çözüm |
|-------|-------|-------|
| Sahte telefon (+90 212 123 45 67) | ✅ Düzeltildi | Kaldırıldı |
| Mock ödeme akışı | ✅ Düzeltildi | "Yakında" sayfasına dönüştürüldü |
| Sahte premium içerik (hardcoded araçlar) | ✅ Düzeltildi | Kaldırıldı |
| Para iade garantisi (ödeme yok) | ✅ Düzeltildi | İddia kaldırıldı |
| B2B widget iddiası (yok) | ✅ Düzeltildi | FAQ'dan kaldırıldı |
| iyzico güvencesi iddiası (entegre değil) | ✅ Düzeltildi | Koşullu dile çevrildi |
| Sabit tarih ifadeleri | ✅ Düzeltildi | Dinamik referans + "periyodik güncelleme" |

## 2. Veri Güvenilirlik Matrisi

| Veri Kalemi | Kaynak | Güven | Son Güncelleme | sourceUrl | Metadata |
|-------------|--------|-------|----------------|-----------|----------|
| MTV tarifeleri | GİB | Kesin | 2026-01-01 | gib.gov.tr | ✅ |
| Muayene ücretleri | TÜVTÜRK | Kesin | 2026-01-01 | tuvturk.com.tr | ✅ |
| Köprü/tünel ücretleri | KGM | Kesin | 2026-01-01 | kgm.gov.tr | ✅ |
| Otoyol segment ücretleri | KGM tahmini | Tahmini | 2026-04-05 | kgm.gov.tr | ✅ |
| Yakıt fiyatları | PETDER | Yaklaşık | 2026-01-15 | petder.org.tr | ✅ |
| Amortisman oranları | OYDER | Tahmini | 2026-01-15 | oyder.org.tr | ✅ |
| Noter ücretleri | Adalet Bakanlığı | Kesin | 2026-01-01 | noterlerbirligi.org.tr | ✅ |
| Sigorta tahminleri | OYDER benchmark | Tahmini | — | — | ✅ (calculations.ts) |
| Bakım maliyetleri | OYDER benchmark | Tahmini | — | — | ✅ (calculations.ts) |
| Araç veritabanı | OYDER/üretici | Yüksek | 2026-04-05 | oyder.org.tr | ✅ |

**Not**: Tüm veri dosyalarında `sourceLabel`, `sourceUrl`, `effectiveDate`, `confidence` alanları mevcut.

## 3. Modül Mimarisi

| Modül | Dizin | Durum | Testler |
|-------|-------|-------|---------|
| MTV Hesaplama | `src/lib/mtv/` | ✅ Ayrı modül | 24 golden test |
| Muayene Hesaplama | `src/lib/muayene/` | ✅ Ayrı modül | 15 golden test |
| Rota Motoru | `src/lib/route/` | ✅ Tam | 27 route + 16 edge case + 3240 graf |
| Ödeme | `src/lib/payment/` | ✅ Stub hazır | — (iyzico bekleniyor) |
| Rapor Üretici | `src/lib/report/` | ✅ Generator hazır | — |
| Analytics | `src/lib/analytics/` | ✅ Layer hazır | — (provider bekleniyor) |
| Referans Veri Şemaları | `src/data/reference/` | ✅ 9 kategori | — |

## 4. Erişilebilirlik (A11y)

| Düzeltme | Durum |
|----------|-------|
| Skip navigation ("Ana içeriğe geç") | ✅ |
| SearchableCombobox unique ID (useId) | ✅ |
| aria-activedescendant | ✅ |
| Error messages role="alert" | ✅ |
| Results area aria-live="polite" | ✅ |
| Footer nav landmark | ✅ |
| Mobile menu aria-label + aria-expanded | ✅ |
| Form label/input association (htmlFor/id) | ✅ |

## 5. Kalan Bilinen Eksiklikler

### P1 (Orta öncelik)
- Ödeme sistemi henüz aktif değil (iyzico merchant hesabı + env vars gerekli)
- Admin paneli Supabase tablolarına bağımlı (migration çalıştırılmalı)
- Premium rapor PDF çıktısı henüz üretilmiyor

### P2 (Düşük öncelik)
- Analytics provider entegrasyonu (GA4/Plausible — layer hazır)
- Mobile UX optimizasyonu detay testi
- Sigorta ve bakım tahminleri tek-kaynaklı (OYDER)

## 6. Teknik Sağlık

- **TypeScript**: 0 hata (strict mode, `any` yok)
- **Lint**: 0 hata
- **Build**: Başarılı (21 statik + 3 dinamik sayfa)
- **Testler**:
  - Route engine: 27 assertion ✅
  - MTV golden: 24 assertion ✅
  - Muayene golden: 15 assertion ✅
  - Edge cases: 16 assertion ✅
  - Graf connectivity: 3240 çift ✅
  - **Toplam: 3322 assertion, 0 hata**
- **Deployment**: Vercel production (arac-karar-motoru.vercel.app)
- **GitHub**: github.com/BBBoring2025/arac-karar-motoru (private)
