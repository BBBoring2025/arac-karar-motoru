# Production Audit Report — Arac Karar Motoru

**Tarih**: 5 Nisan 2026
**Kapsam**: Tum kullanici-facing sayfalar, veri katmani, hesaplama motorlari

## 1. Canli Sitede Verilen Sozler vs Gerceklik

### Dogru Sozler

- 160+ arac modeli, 35+ marka: Dogru (161 arac, araclar.ts)
- 5 ucretsiz hesaplama araci: Dogru (MTV, otoyol, yakit, muayene, rota)
- 81 il, 969 ilce rota hesaplama: Dogru (graph connectivity test: 3240/3240 cift)
- GIB MTV tarifeleri: Dogru (sabit lookup tablosu, formul degil)
- KGM kopru/tunel ucretleri: Dogru (6 kopru/tunel, toll-segments.ts)
- PETDER yakit referans fiyatlari: Dogru (snapshot, periyodik guncelleme)

### Duzeltilen Sorunlar

| Sorun | Durum | Cozum |
|-------|-------|-------|
| Sahte telefon numarasi (+90 212 123 45 67) | Duzeltildi | Kaldirildi |
| Mock odeme akisi (iyzico entegre degil) | Duzeltildi | "Yakinda" sayfasina donusturuldu |
| Sahte premium icerik (hardcoded araclar) | Duzeltildi | Kaldirildi |
| Para iade garantisi (odeme yok) | Duzeltildi | Iddia kaldirildi |
| B2B widget iddiasi (yok) | Duzeltildi | FAQ'dan kaldirildi |
| iyzico guvencesi iddiasi (entegre degil) | Duzeltildi | Kosullu dile cevrildi |
| Sabit "5 Nisan 2026" tarihi | Duzeltildi | "Periyodik guncelleme" |

## 2. Veri Guvenilirlik Matrisi

| Veri Kalemi | Kaynak | Guven | Son Guncelleme | sourceUrl |
|-------------|--------|-------|----------------|-----------|
| MTV tarifeleri | GIB | Kesin | 2026-01-01 | gib.gov.tr |
| Muayene ucretleri | TUVTURK | Kesin | 2026-01-01 | tuvturk.com.tr |
| Kopru/tunel ucretleri | KGM | Kesin | 2026-01-01 | kgm.gov.tr |
| Otoyol segment ucretleri | KGM tahmini | Tahmini | 2026-04-05 | kgm.gov.tr |
| Yakit fiyatlari | PETDER | Yaklasik | 2026-01-15 | petder.org.tr |
| Amortisman oranlari | OYDER | Tahmini | 2026-01-15 | oyder.org.tr |
| Noter ucretleri | Adalet Bakanligi | Kesin | 2026-01-01 | noterlerbirligi.org.tr |
| Sigorta tahminleri | OYDER benchmark | Tahmini | — | — |
| Bakim maliyetleri | OYDER benchmark | Tahmini | — | — |
| Arac veritabani | OYDER/uretici | Yuksek | 2026-04-05 | oyder.org.tr |

## 3. Kalan Bilinen Eksiklikler (P1-P2)

### P1 (Orta oncelik)

- Odeme sistemi henuz aktif degil (iyzico entegrasyonu bekliyor)
- Admin paneli Supabase tablolarina bagimli (tablolar olusturulmali)
- Premium rapor PDF ciktisi henuz uretilmiyor

### P2 (Dusuk oncelik)

- Analytics/event tracking yok
- Accessibility (a11y) tam audit yapilmadi
- Mobile UX optimizasyonu tamamlanmadi
- Sigorta ve bakim tahminleri tek-kaynakli (OYDER)

## 4. Teknik Saglik

- TypeScript: 0 hata (strict mode)
- Lint: 0 hata
- Build: Basarili (21 statik + 3 dinamik sayfa)
- Test: 10 route test + 8 edge case + 3240 graf baglanti testi = Tumu geciyor
- Deployment: Vercel production (arac-karar-motoru.vercel.app)
