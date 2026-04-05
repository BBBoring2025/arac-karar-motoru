# P2 Sprint Status — Rota v3 + Premium Karar Raporu

**Tarih**: Nisan 2026
**Durum**: Tamamlandı

## Yapılanlar

### 1. Karşılaştırma Motoru — Gerçek Araç DB
- Mock 4 araç kaldırıldı → gerçek 161 araçlık veritabanına bağlandı
- `generateAracDatabase()` artık `vehicleDatabase.vehicles`'den çekiyor
- Segment mapping: Vehicle.segment (A/B/C/SUV) → TCO segmenti (kompakt/sedan/suv)
- Uyumluluk puanı gerçek araç verileriyle çalışıyor

### 2. PDF Rapor Üretimi
- `jspdf` v2.5 + `jspdf-autotable` kuruldu
- `src/lib/report/pdf-generator.ts` — A4 PDF oluşturur:
  - Başlık + tarih
  - Araç bilgisi
  - TCO özet kutusu
  - Maliyet kırılım tablosu (kalem/tutar/güven/kaynak)
  - Metodoloji notu + güven seviyeleri açıklaması
  - Disclaimer footer
- Rapor sayfasında "PDF İndir" butonu (dynamic import — bundle'ı büyütmez)

### 3. Rota Testleri Genişletildi
- Test 11: İzmit → Kaş (771 km, 12 node — uzun mesafe çoklu segment)
- Test 12: Toll breakdown segment tipi kontrolü (köprü tipi doğrulama)
- Toplam: 34 route assertion, 0 hata

### 4. Rota Modülü Durumu
Rota v3 Sprint 1-4'te tamamlanmıştı. P2'de doğrulandı:
- 81 il, 969 ilçe, 104 anchor, 139 edge
- Dijkstra shortest path + toll avoidance (10x penalty)
- Segment bazlı geçiş ücreti (6 köprü/tünel kesin, 12 otoyol tahmini)
- District offset (Haversine + bölgesel çarpan)
- Confidence: kesin/yüksek/tahmini

## Test Sonuçları

| Test Suite | Assertion | Durum |
|-----------|-----------|-------|
| Route engine | 34 | ✅ |
| Edge cases | 16 | ✅ |
| MTV golden | 30 | ✅ |
| Muayene golden | 17 | ✅ |
| Graf connectivity | 3240 çift | ✅ |

## Dokümantasyon

- `docs/route-methodology.md` — Rota hesaplama metodolojisi
- `docs/report-methodology.md` — Karar raporu metodolojisi
- `docs/status-p2.md` — Bu dosya
