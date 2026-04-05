# Manuel Doğrulama Kontrol Listesi

Her deploy öncesi veya veri güncellemesi sonrası yapılacak kontroller.

## 1. Confidence Badge Doğruluğu

| Sayfa | Badge | Doğru mu? |
|-------|-------|-----------|
| /araclar/mtv-hesaplama | "Kesin" (yeşil) | [ ] Evet — GİB tarife tablosu |
| /araclar/muayene-ucreti | "Kesin" (yeşil) | [ ] Evet — TÜVTÜRK tarife |
| /araclar/otoyol-hesaplama | "Yaklaşık" (sarı) | [ ] Evet — yıllık tahmin içerir |
| /araclar/yakit-hesaplama | "Yaklaşık" (sarı) | [ ] Evet — referans fiyat |
| /araclar/rota-maliyet | Dinamik | [ ] Köprü rotası = kesin, karma rota = yüksek/tahmini |

## 2. Kaynak ve Tarih Doğruluğu

| Sayfa | Kaynak metni | Tarih kaynağı |
|-------|-------------|---------------|
| MTV | [ ] "GİB" yazıyor | [ ] mtvData.effectiveDate'den geliyor |
| Muayene | [ ] "TÜVTÜRK" yazıyor | [ ] inspectionData.effectiveDate'den geliyor |
| Otoyol | [ ] "KGM" yazıyor | [ ] tollData.lastUpdated'dan geliyor |
| Yakıt | [ ] "PETDER" yazıyor | [ ] fuelData.effectiveDate'den geliyor |
| Rota | [ ] "PETDER & KGM" yazıyor | [ ] Sabit ama doğru |

## 3. Veri Spot-Check'leri

| Test | Beklenen | Kontrol |
|------|----------|---------|
| MTV: benzin 1200cc, 2 yaş | 3.950 TL/yıl | [ ] |
| MTV: elektrikli, herhangi yaş | 0 TL | [ ] |
| Muayene: otomobil, 5 yaş | ~150 TL | [ ] |
| Osmangazi Köprüsü 1. sınıf | 995 TL | [ ] |
| Avrasya Tüneli 1. sınıf | 280 TL | [ ] |
| 15 Temmuz Köprüsü 1. sınıf | 59 TL | [ ] |

## 4. Hardcoded Tarih Kontrolü

```bash
grep -rn "5 Nisan 2026" src/app/
```
Sonuç: [ ] 0 satır (tüm tarihler dinamik olmalı)

## 5. Sahte İddia Kontrolü

```bash
grep -rn "para iade\|123 45 67\|iyzico güvencesi" src/
```
Sonuç: [ ] 0 satır

## 6. Tip Tutarlılığı

```bash
grep -rn "GuvenSeviyesi" src/ --include="*.ts" --include="*.tsx" | grep -v "types.ts"
```
Sonuç: [ ] Sadece types.ts'de alias olarak var, başka yerde inline tanım YOK

## 7. Sayfa Erişim Testi

| Sayfa | HTTP | Kontrol |
|-------|------|---------|
| / | [ ] 200 | |
| /araclar/mtv-hesaplama | [ ] 200 | |
| /araclar/muayene-ucreti | [ ] 200 | |
| /araclar/otoyol-hesaplama | [ ] 200 | |
| /araclar/yakit-hesaplama | [ ] 200 | |
| /araclar/rota-maliyet | [ ] 200 | |
| /rapor | [ ] 200 | |
| /metodoloji | [ ] 200 | |
| /sss | [ ] 200 | |
| /odeme | [ ] 200 | |

## 8. Test Suite

```bash
npx tsx src/lib/route/__tests__/route-engine.test.ts  # [ ] 27/27
npx tsx src/lib/mtv/__tests__/mtv.test.ts             # [ ] 30/30
npx tsx src/lib/muayene/__tests__/muayene.test.ts     # [ ] 17/17
npx tsx src/lib/route/__tests__/edge-cases.test.ts    # [ ] 16/16
```
