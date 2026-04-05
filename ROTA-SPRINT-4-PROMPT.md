# ROTA v3 — Sprint 4: Bug Fix + Graf Kalitesi + Deploy Hazırlığı

## BAĞLAM
Sprint 1-3'te rota hesaplama motoru (Dijkstra + koridor grafı), UI ve SEO/trust katmanı tamamlandı.
Sonrasında graf bağlantı kopuklukları düzeltildi ve ilçe veritabanı 550'den 969'a genişletildi.
Şimdi audit'te çıkan kritik ve orta öncelikli sorunları düzeltiyoruz.

## GÖREV 1 — Avrasya Tüneli Bağlantı Eksikliği (KRİTİK)

### Sorun
`avrasya-avrupa` ve `avrasya-asya` node'ları grafta izole durumda. Tünel var ama İstanbul ağına bağlı değil.
Diğer 3 köprü (15 Temmuz, FSM, YSS) doğru bağlı: `istanbul-avrupa` → köprü-giriş → köprü → köprü-çıkış → `istanbul-anadolu`
Avrasya'da ise bu bağlantılar eksik.

### Yapılacak
`src/data/routes/graph.ts` dosyasında **İstanbul Boğaz Köprüleri** bölümüne 2 edge ekle:

```typescript
// Avrasya Tüneli → İstanbul bağlantıları
{
  id: 'edge-istanbul-avrupa-avrasya-avrupa',
  from: 'istanbul-avrupa',
  to: 'avrasya-avrupa',
  distanceKm: 6,
  durationMin: 12,
  roadType: 'serbest',
  tollSegmentIds: [],
  bidirectional: true,
  confidence: 'kesin',
},
{
  id: 'edge-avrasya-asya-istanbul-anadolu',
  from: 'avrasya-asya',
  to: 'istanbul-anadolu',
  distanceKm: 8,
  durationMin: 15,
  roadType: 'serbest',
  tollSegmentIds: [],
  bidirectional: true,
  confidence: 'kesin',
},
```

### Doğrulama
Test: `dijkstra('istanbul-avrupa', 'istanbul-anadolu', routeEdges, true)` çalıştır ve Avrasya tünelini kullanan bir rota bulunabildiğini doğrula.

---

## GÖREV 2 — Ücretli Yol Kaçınma İyileştirmesi

### Sorun
`includeTolls=false` olduğunda sistem yalnızca 3x penalty uyguluyor, gerçek serbest alternatif bulmuyor.
Test 5'te İstanbul→Bursa ücretli=161.6 km, ücretsiz=161.6 km çıkıyor — farksız.

### Yapılacak
`src/lib/route/graph-search.ts` dosyasında:

1. `TOLL_PENALTY_MULTIPLIER` değerini 3'ten **10**'a çıkar (ücretli yolu çok daha pahalı yap)
2. Eğer bulunan rota hâlâ ücretli edge içeriyorsa ve `includeTolled=false` ise, sonuçta `tollAvoidanceFailed: true` flag'i döndür

`src/lib/route/types.ts` → `DijkstraResult` interface'ine ekle:
```typescript
tollAvoidanceFailed?: boolean; // Serbest alternatif bulunamadı
```

`src/lib/route/route-engine.ts` → Sonuç hesaplamada:
- Eğer `includeTolls=false` ama rota hâlâ toll içeriyorsa, kullanıcıya uyarı göster
- `RouteResult` interface'ine `tollAvoidanceNote?: string` ekle

`src/app/araclar/rota-maliyet/page.tsx` → Sonuç alanında:
- `result.tollAvoidanceNote` varsa sarı uyarı banner'ı göster:
  "Bu güzergahta ücretsiz alternatif bulunamamıştır. Gösterilen rota en kısa ücretli güzergahtır."

---

## GÖREV 3 — Osmangazi Köprüsü Serbest Alternatifi

### Sorun
İstanbul→Bursa arasında ücretli yol kapalıyken alternatif güzergah (Yalova üzerinden feribot değil, karayoluyla) yok.

### Yapılacak
`src/data/routes/graph.ts` dosyasına serbest alternatif edge'ler ekle:

```typescript
// İstanbul → Bursa serbest alternatif (Yalova üzerinden)
{
  id: 'edge-gebze-yalova',
  from: 'gebze',
  to: 'yalova',
  distanceKm: 75,
  durationMin: 65,
  roadType: 'serbest',
  tollSegmentIds: [],
  bidirectional: true,
  confidence: 'tahmini',
},
```

NOT: Yalova→Bursa edge'i zaten mevcut (60 km, serbest). Bu sayede `istanbul-anadolu` → `gebze` → `yalova` → `bursa` serbest alternatifi oluşacak.

---

## GÖREV 4 — Toll Calculator Güvenlik Kontrolü

### Yapılacak
`src/lib/route/toll-calculator.ts` dosyasında:
- Bilinmeyen `tollSegmentId` referanslarında sessizce 0 TL dönmek yerine console.warn ile uyarı ver
- Fonksiyona try/catch ekle, hata durumunda hesaplama çökmemeli

---

## GÖREV 5 — Test Dosyasını Genişlet

`src/lib/route/__tests__/route-engine.test.ts` dosyasına yeni testler ekle:

```
Test 7: Avrasya Tüneli kullanılabilirliği
- istanbul-avrupa → istanbul-anadolu arası rota bul
- Avrasya tüneli edge'inin path'te olabileceğini doğrula

Test 8: Uzun mesafe — Hakkari → Edirne
- Rota bulunabildiğini doğrula (graf tam bağlantılı mı?)
- Mesafe 1500-2200 km aralığında olmalı

Test 9: Toll avoidance uyarısı
- İstanbul → Ankara, includeTolls=false
- Serbest alternatif bulunmalı (Ankara-Bolu serbest edge mevcut)
- Eğer rota hâlâ toll içeriyorsa tollAvoidanceNote dolu olmalı

Test 10: İstanbul → Bursa, ücretli yol kapalı
- Ücretsiz rota mesafesi ücretliden FAZLA olmalı
- Osmangazi Köprüsü tollBreakdown'da OLMAMALI
```

---

## GÖREV 6 — Combobox UX İyileştirmesi

`src/components/route/SearchableCombobox.tsx`:
- `MAX_VISIBLE_OPTIONS` 50'den **80**'e çıkar (Konya 31 ilçe)
- Eğer sonuç limiti aşılıyorsa, listenin altına gri italik metin ekle:
  `"Daha spesifik arayın — ${totalCount - MAX_VISIBLE_OPTIONS} sonuç daha var"`

---

## ÖNEMLİ KURALLAR

1. Mevcut çalışan hiçbir kodu bozma
2. Her değişiklikten sonra `npx tsc --noEmit` ve `npm run lint` çalıştır
3. Tüm testleri (`npx tsx src/lib/route/__tests__/route-engine.test.ts`) çalıştır ve 10/10 geçmeli
4. `'use client'` directive'lerini Client Component'lerde unutma
5. Güven dili: Asla "kesin sonuç" veya "%100 doğru" yazma

## CHECKLIST
- [ ] Avrasya Tüneli bağlantı edge'leri eklendi
- [ ] Ücretli yol kaçınma iyileştirildi (penalty 3→10, warning flag)
- [ ] Gebze→Yalova serbest edge eklendi
- [ ] Toll calculator güvenlik kontrolü eklendi
- [ ] 4 yeni test eklendi ve hepsi geçti
- [ ] Combobox MAX_VISIBLE_OPTIONS 80'e çıkarıldı + limit mesajı
- [ ] TypeScript 0 hata
- [ ] Lint 0 hata
- [ ] Mevcut 16 test hâlâ geçiyor
