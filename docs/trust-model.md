# Güven Modeli — Araç Karar Motoru

## Amaç

Her hesaplama sonucunda kullanıcıya neyin resmi veri, neyin tahmin, neyin kendi girdisi olduğunu net göstermek.

**Kural**: "Kesin" diyorsak gerçekten kesin. Emin değilsek "tahmini" deriz. Veri yoksa sayı uydurmak yerine "veri eksik" gösteririz.

## Güven Seviyeleri

| Seviye | Kod | Renk | Açıklama | Örnek |
|--------|-----|------|----------|-------|
| **Kesin** | `kesin` | Yeşil | Resmi kurum tarifesi, sabit tutar | MTV (GİB), muayene (TÜVTÜRK), köprü ücreti (KGM) |
| **Yüksek Güven** | `yüksek` | Mavi | Doğrulanmış veri, düşük değişkenlik | Araç veritabanı fiyatları, WLTP tüketim |
| **Yaklaşık** | `yaklaşık` | Sarı | Referans değerden türetilmiş | PETDER yakıt fiyatları, otoyol yıllık tahmini |
| **Tahmini** | `tahmini` | Turuncu | Sektör ortalaması, model çıktısı | Sigorta, bakım, amortisman, otoyol segment ücretleri |

## TypeScript Tipi

```typescript
// src/lib/types.ts — TEK canonical kaynak
export type DataConfidence = 'kesin' | 'yüksek' | 'yaklaşık' | 'tahmini';
```

Tüm modüller bu tipi kullanır. Kendi confidence tipi tanımlayan dosya YOKTUR.

## Modül Bazlı Güven Matrisi

| Modül | Hesaplama | Güven | Neden |
|-------|-----------|-------|-------|
| MTV | Motor hacmi x yaş → sabit TL | Kesin | GİB tarife tablosu, formül yok |
| Muayene | Araç tipi x yaş → sabit TL | Kesin | TÜVTÜRK resmi tarife |
| Köprü/Tünel | Araç sınıfı → sabit TL | Kesin | KGM resmi tarife |
| Otoyol segmenti | Araç sınıfı → segment TL | Tahmini | Gişe-gişe veri eksik |
| Yakıt fiyatı | PETDER referans | Yaklaşık | Pompa fiyatları farklılık gösterir |
| Yakıt maliyeti | Fiyat x tüketim x km | Yaklaşık | Kullanıcı km'si tahmin |
| Sigorta | Fiyat x segment x yaş | Tahmini | OYDER benchmark ortalaması |
| Bakım | Marka x yaş x km | Tahmini | OYDER benchmark ortalaması |
| Amortisman | Segment x yaş x yakıt | Tahmini | OYDER sektör verileri |
| Noter | Araç fiyatı → tarife | Kesin | Adalet Bakanlığı tarifesi |
| Rota mesafesi | Dijkstra graf | Yüksek | Doğrulanmış koridor km'leri |
| İlçe offset | Haversine x çarpan | Tahmini | Kuş uçuşu tahmin |

## UI Kuralları

1. Her hesaplama sonuç kartında `<ConfidenceBadge>` gösterilir
2. Bilgilendirme kutusunda kaynak adı ve tarife tarihi bulunur
3. Tarihler hardcoded değil, veri dosyasından dinamik okunur
4. Kullanıcı girdisi olan alanlar "(sizin girdiniz)" ile etiketlenir

## Etiketleme Karar Ağacı

```
Veri resmi kurum tarifesi mi?
  → EVET → "kesin"
Veri doğrulanmış ve düşük değişkenlik mi?
  → EVET → "yüksek"
Veri referans kaynaktan türetilmiş mi?
  → EVET → "yaklaşık"
Veri sektör ortalaması veya model çıktısı mı?
  → EVET → "tahmini"
```

## Son Güncelleme

Bu model Nisan 2026 itibarıyla geçerlidir.
