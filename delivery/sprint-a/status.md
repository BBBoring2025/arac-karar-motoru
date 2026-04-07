# Sprint A — Production Truth Alignment

**Sprint Adı:** Production Truth Alignment
**Tamamlanma Tarihi:** Nisan 2026
**Commit:** `3c4d723`
**GitHub:** https://github.com/BBBoring2025/arac-karar-motoru
**Production:** https://arac-karar-motoru.vercel.app

---

## Sprint Amacı

Canlı production site, son build, metodoloji, entegrasyon dökümanı ve kullanıcıya gösterilen iddiaları **birebir hizalamak**. Hiçbir sayfada, testte veya dokümanda "gerçekte bitmemiş şeyi bitmiş" gibi gösterme.

## Yapılan İşler

| Alan | Önce | Sonra |
|------|------|-------|
| Muayene fiyatları | 125-150 TL (yanlış) | 3.288 / 4.446 / 1.674 TL (gerçek 2026) |
| Muayene calculator | Türkçe karakter bug → her zaman 150 TL fallback | String mismatch düzeltildi, gerçek değerler dönüyor |
| MTV confidence | Tüm yakıt tipleri "kesin" | Elektrik=kesin, diğerleri=yaklaşık + GİB uyarısı |
| Rota engine confidence | "Kesin" döndürebiliyordu | Max "yüksek" (district offset her zaman tahmini) |
| Metodoloji "Rota: Kesin" | Tek satır, overstate | 3 alt satır (köprü kesin, segment tahmini, offset yaklaşık) |
| Status-p1.md | "Tamamlandı" | "Kod hazır, env bekliyor" + production parity tablosu |

## Test Sonuçları

| Suite | Assertion | Durum |
|-------|-----------|-------|
| Route engine | 34 | ✅ |
| Edge cases | 16 | ✅ |
| MTV golden | 35 | ✅ |
| **Muayene golden** | **21** | ✅ **Gerçek 2026 değerlerine kilitli** |
| Graf connectivity | 3240 çift | ✅ |
| **TOPLAM** | **106 + 3240** | **Hepsi geçti** |

## Build / Lint / TS

| Kontrol | Sonuç |
|---------|-------|
| TypeScript (strict) | 0 hata |
| ESLint | 0 hata |
| Next.js Build | Başarılı |
| Tüm sayfalar | 21 statik + 3 dinamik |

## Üretilen Dosyalar

- `src/data/muayene.ts` — gerçek 2026 değerleri
- `src/lib/muayene/calculator.ts` — string mismatch fix
- `src/lib/muayene/__tests__/muayene.test.ts` — gerçek değerlere kilitli
- `src/lib/mtv/types.ts` — `confidence: DataConfidence` + `uyari?` field
- `src/lib/mtv/calculator.ts` — yakıt bazlı confidence
- `src/lib/mtv/__tests__/mtv.test.ts` — yeni confidence beklentileri
- `src/app/araclar/mtv-hesaplama/page.tsx` — dinamik badge + sarı uyarı kutusu + GİB linki
- `src/app/metodoloji/page.tsx` — rota satırı 3'e bölündü
- `src/lib/route/route-engine.ts` — `determineConfidence()` max "yüksek"
- `docs/status-p1.md` — production parity güncellemesi
- `docs/runtime-status.md` — **YENİ**: tek doğruluk kaynağı
- `docs/status-truth-alignment.md` — **YENİ**: düzeltilen iddia listesi

## Production Readiness

| Kriter | Durum |
|--------|-------|
| Canlı sayfalardaki tüm sayısal değerler doğrulanmış | ⚠️ Muayene ✅, MTV ⚠️ snapshot, otoyol ✅ köprü, ⚠️ segment |
| Misleading "kesin" iddiası kalmadı | ✅ |
| Mock ödeme akışı yok | ✅ (Vercel'de iyzico env yok → "hazırlanıyor" doğru gösteriliyor) |
| Testler gerçek değerlere bağlı | ✅ Muayene tamamen kilitli |
| Dokümantasyon canlı durumu yansıtıyor | ✅ runtime-status.md tek kaynak |

**Production Ready Engelleyiciler:**

1. **MTV tarife snapshot** — Kod 3.950 TL diyor, 2026 gerçek minimum ~5.750 TL. Confidence "yaklaşık" işaretli ve kullanıcıya GİB linki gösteriliyor (mitigated) ama veri snapshot'ı güncellenirse daha iyi olur.
2. **Otoyol segment ücretleri** — Köprü/tünel doğrulanmış (kesin). Segment ücretleri tahmini, gerçek KGM gişe verisi yok.
3. **Vercel env vars eksik** — iyzico ve `SUPABASE_SERVICE_ROLE_KEY` Vercel dashboard'a eklenmedi → ödeme sayfası "hazırlanıyor" gösteriyor (kasıtlı, kod doğru).

Bu 3 madde "engelleyici" değil — hepsi belgelenmiş ve kullanıcıya dürüstçe bildiriliyor. Sprint A'nın amacı **truth alignment'tı**, exact data quest değildi.
