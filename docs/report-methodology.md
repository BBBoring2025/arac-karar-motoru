# Karar Raporu Metodolojisi

## Genel Yaklaşım

Karar raporu, bir aracın satın alma bedelinin ötesindeki tüm sahiplik maliyetlerini 12 veya 36 aylık periyotta hesaplar. Her maliyet kalemi güven seviyesi ve veri kaynağıyla etiketlenir.

## Maliyet Kalemleri

| Kalem | Hesaplama | Güven | Kaynak |
|-------|-----------|-------|--------|
| **MTV** | Motor hacmi × yaş → GİB sabit tablo | Kesin | GİB 2026 Tebliği |
| **Yakıt** | (km/100) × tüketim × fiyat | Yaklaşık | PETDER + WLTP |
| **Sigorta** | Fiyat × segment × yaş çarpanları | Tahmini | OYDER benchmark |
| **Bakım** | Marka × yaş × km çarpanları | Tahmini | OYDER benchmark |
| **Muayene** | Araç tipi → TÜVTÜRK sabit tablo | Kesin | TÜVTÜRK 2026 |
| **Amortisman** | Segment × yaş × yakıt depreciation curve | Tahmini | OYDER sektör |
| **Kredi Faizi** | Anapara × faiz × vade (kullanıcı girdisi) | Kesin | Kullanıcı |
| **Noter** | Araç fiyatı → tarife tablosu | Kesin | Adalet Bakanlığı |

## Veri Sınıfları

Her kalem şu sınıflardan birine aittir:

| Sınıf | Kod | Açıklama |
|-------|-----|----------|
| Resmi | `resmi` | Devlet kurumu tarifesi (GİB, TÜVTÜRK, KGM) |
| Benchmark | `benchmark` | Sektör ortalaması (OYDER, PETDER) |
| Kullanıcı Girdisi | `kullanici_girdisi` | Kullanıcının girdiği değer |
| Model Tahmini | `model_tahmini` | Hesaplama modeli çıktısı |

## Alternatif Araç Karşılaştırması

Karşılaştırma motoru 161 araçlık veritabanından benzer segment ve motor hacminde alternatifler bulur:
- Segment uyumu
- Motor hacmi yakınlığı
- Yakıt tüketimi karşılaştırması
- Fiyat yakınlığı

Her alternatif 0-100 uyumluluk puanı alır.

## PDF Rapor İçeriği

1. Araç bilgisi (marka, model, yıl, fiyat, motor, yakıt)
2. TCO özeti (toplam, aylık ortalama, km başı maliyet)
3. Maliyet kırılım tablosu (kalem, tutar, güven, kaynak)
4. Metodoloji notu
5. Güven seviyeleri açıklaması
6. Disclaimer

## Karar Tavsiyesi Mantığı

AL / KIRALA / BEKLE tavsiyesi deterministik kurallarla üretilir:
- KM başı maliyet < 1.5 TL → AL puanı artar
- Aylık maliyet < 5.000 TL → AL puanı artar
- Kiralama fiyatı < aylık TCO → KIRALA puanı artar
- Toplam maliyet > 300.000 TL → BEKLE puanı artar

**Not**: Bu tavsiye yatırım danışmanlığı değildir. Hesaplama modelinin çıktısıdır.

## Sınırlamalar

- Sigorta ve bakım tahminleri sektör ortalamalarıdır — gerçek fiyatlar farklılık gösterir
- Amortisman oranları pazar koşullarına göre değişebilir
- Kredi faizi kullanıcının girdiği değerdir — banka teklifleri farklı olabilir
- Araç veritabanı sıfır km liste fiyatlarını içerir — bayii fiyatları farklı olabilir
