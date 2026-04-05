# Rota Hesaplama Metodolojisi

## Genel Yaklaşım

Sistem, Türkiye karayolu ağı üzerinde il/ilçe merkezleri arası en kısa yol koridorunu bulur ve bu koridor üzerindeki yakıt + geçiş maliyetlerini hesaplar.

**Bu bir navigasyon uygulaması DEĞİLDİR.** Tam adres bazlı yönlendirme yapmaz. İlçe merkezleri arası yüksek güvenli maliyet tahmini üretir.

## Hesaplama Adımları

### 1. İlçe → Anchor Bağlama
Her ilçe merkezi bir "anchor node"a bağlıdır. Anchor'lar il merkezleri, önemli kavşaklar, köprü girişleri ve otoyol düğümleridir.

- **81 il merkezi** (il-merkezi)
- **4 kritik kavşak** (Bolu Geçidi, Pozantı, Afyon, Adapazarı-Bolu)
- **10 köprü/tünel girişi** (Osmangazi, Çanakkale, İstanbul köprüleri, Avrasya)
- **7+ otoyol düğümü** (Gebze, Ankara Ring, İzmir Ring vb.)

### 2. District Offset
İlçe merkezinden anchor'a olan mesafe Haversine (kuş uçuşu) + bölgesel çarpan ile hesaplanır:
- İstanbul: x1.5 (büyük şehir yayılımı)
- Büyükşehirler: x1.4
- Diğer iller: x1.25

### 3. Graf Üzerinde Dijkstra
139 bidirectional edge içeren koridor grafında en kısa yol bulunur. Her edge şunları taşır:
- distanceKm (gerçek karayolu km)
- durationMin (tahmini süre)
- roadType (serbest/ücretli/karma)
- tollSegmentIds (geçiş segmenti referansları)

### 4. Geçiş Ücreti Hesaplama
Rota üzerindeki her toll segment için araç sınıfına göre ücret hesaplanır:
- **Köprüler**: KGM resmi tarife (kesin)
- **Tüneller**: Resmi tarife + gece indirimi (kesin)
- **Otoyol segmentleri**: Tahmini segment ücretleri (tahmini)

### 5. Yakıt Maliyeti
```
yakıtLitre = (toplamKm / 100) × tüketim
yakıtMaliyeti = yakıtLitre × fiyat
```

### 6. Güven Seviyesi
- Tüm edge'ler "kesin" → rota "kesin"
- Herhangi biri "tahmini" → rota "tahmini"
- Karma → "yüksek"

## Veri Kaynakları

| Veri | Kaynak | Güven |
|------|--------|-------|
| İl/ilçe koordinatları | Coğrafi veri | Kesin |
| Koridor mesafeleri | Harita verileri | Yüksek |
| Köprü/tünel ücretleri | KGM 2026 | Kesin |
| Otoyol segment ücretleri | KGM tahmini | Tahmini |
| Yakıt fiyatları | PETDER | Yaklaşık |

## Sınırlamalar

- Adres bazlı rota YOK — ilçe merkezleri arası
- Trafik durumu hesaba katılmaz
- Feribot rotaları dahil değil
- Bazı otoyol segment ücretleri tahminidir
