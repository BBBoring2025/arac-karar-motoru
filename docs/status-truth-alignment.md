# Truth Alignment Sprint — Düzeltilen İddialar

**Sprint:** "Production Truth Alignment"
**Tarih:** Nisan 2026
**Amaç:** Canlı site, kod, dokümantasyon ve testler arasındaki tüm uyumsuzlukları kapatmak. Hiçbir yerde "gerçekte bitmemiş şeyi bitmiş" gibi göstermemek.

---

## Düzeltilen Iddia / Değerler

### 1. Muayene Verisi — KRİTİK DÜZELTME

**Önce (yanlış):**
- Otomobil periyodik muayene (1-3 yaş): **125 TL**
- Otomobil periyodik muayene (4+ yaş): **150 TL**
- İlk muayene: 175 TL
- Egzoz emisyon: 50-60 TL
- Confidence: "kesin"

**Sonra (gerçek 2026 TÜVTÜRK):**
- Otomobil/Minibüs/Kamyonet/SUV periyodik: **3.288 TL**
- Otobüs/Kamyon/Çekici/Tanker periyodik: **4.446 TL**
- Motosiklet/Traktör periyodik: **1.674 TL**
- Egzoz emisyon (tüm araçlar): **460 TL**
- Tekrar muayene: yaklaşık yarı fiyat
- Confidence: "kesin" (artık gerçekten kesin)

**Sapma:** Otomobil için **%96 (125 → 3.288)**. Veri tamamen yanlıştı.

**Doğrulama kaynakları:**
- [Sözcü 2026 TÜVTÜRK ücretleri](https://www.sozcu.com.tr/tuvturk-2026-muayene-ucretleri-belli-oldu-butun-arac-sahiplerini-ilgilendiriyor-p281523)
- [Hürriyet Bigpara araç muayene 2026](https://bigpara.hurriyet.com.tr/ekonomi-haberleri/galeri-arac-muayene-ucreti-2026-tablosu-yeni-yil-arac-muayene-ucretleri-ne-kadar-oldu-kac-tl-iste-traktor-otomobil-kamyonet_ID1623066/)
- [TÜVTÜRK Resmi Fiyat Listesi](https://www.tuvturk.com.tr/arac-muayene-fiyat-listesi.aspx)

### 2. Muayene Calculator — STRING MISMATCH BUG (KRİTİK)

Calculator `'Periyodik Muayene (1-3 yas)'` arıyordu ama veri dosyası `'Periyodik Muayene (1-3 yaş)'` (Türkçe karakter) içeriyordu. `find()` her zaman `undefined` dönüyor, fallback **150 TL** kullanılıyordu — kullanıcı bu yüzden sürekli 150 TL gördü.

**Düzeltme:** Calculator'daki tüm string'ler veri dosyasıyla birebir eşlendi (Türkçe karakterler dahil). Fallback 150 TL kaldırıldı, bunun yerine console.warn + 0 TL döner (geliştirici görmezse fark eder).

### 3. MTV Confidence — "kesin" → "yaklaşık"

**Önce:** Tüm yakıt tipleri için `confidence: 'kesin'`. Kullanıcı 3.950 TL gördüğünde "kesin tutar" sanıyordu.

**Sonra:**
- **Elektrikli**: `kesin` (her zaman 0 TL — 2026 muafiyeti)
- **Diğerleri**: `yaklaşık` + uyarı: "Kesin tutar için GİB MTV Hesaplama aracını kullanın"
- UI'da sarı uyarı kutusu + GİB linki

**Sebep:** Koddaki MTV tarife snapshot'ı GİB tarifelerinin %100 birebir kopyası değil. Yıl içi güncellemeleri yansıtmayabilir. 2026 zamlarıyla 1-1300cc 1-3 yaş benzin için kod 3.950 TL diyor ama gerçek minimum 5.750 TL civarında.

### 4. Metodoloji Sayfası — "Rota: Kesin" → 3 Alt Satır

**Önce:** Tek satır "Rota Hesaplama: Kesin"

**Sonra:** 3 ayrı satır:
- "Rota — Köprü/Tünel Ücretleri" → Kesin (KGM resmi)
- "Rota — Otoyol Segment Ücretleri" → Tahmini (segment bazlı)
- "Rota — İl/İlçe Mesafeleri" → Yaklaşık (Haversine offset içerir)

### 5. Rota Engine Confidence — "kesin" → "yüksek" (max)

**Önce:** Tüm edge'ler kesin ise rota "kesin" döner.

**Sonra:** Hiçbir rota artık "kesin" döndürmez çünkü district offset her zaman Haversine tahmini. Maksimum "yüksek" döner. Karma rotalar "tahmini" döner.

**Mantık:**
- Tüm edge kesin → `yüksek` (max — district offset varlığı nedeniyle)
- Edge'ler arasında tahmini var → `tahmini`

### 6. Payment Documentation — "AKTİF" → "Kod hazır, env bekliyor"

**Önce (status-p1.md):** "Durum: Tamamlandı"

**Sonra:** "Durum: Kod tamamlandı, deployment env vars bekliyor (production'da henüz aktif değil)"

**Sebep:** Local `.env.local`'de iyzico sandbox anahtarları var ama Vercel dashboard'da yok. Production canlı sayfasında "Ödeme Sistemi Hazırlanıyor" gözüküyor — kod davranışı doğru ama doküman "AKTİF SANDBOX" diyordu.

Eklenen tablo:

| Ortam | iyzico Env | /odeme Sayfası | Sandbox Çalışır mı? |
|-------|-----------|---------------|---------------------|
| Local (.env.local) | ✅ Var | Gerçek checkout flow | ✅ Evet |
| Vercel Production | ❌ Yok | "Hazırlanıyor" banner | ❌ Hayır |

### 7. MTV Sayfası UI

- ConfidenceBadge artık dinamik: `selectedFuel === 'Elektrik' ? 'kesin' : 'yaklaşık'`
- Sarı uyarı kutusu eklendi (elektrik haricinde): "Bu tutar GİB tarife yapısına göre hesaplanmıştır. Kesin tutar için GİB MTV Hesaplama aracını kullanın."
- Bilgilendirme metni "GİB 2026 MTV Tebliği" → "GİB MTV tarife yapısı (2026 başlangıç snapshot)"

---

## Yeni Test Kapsamı

### Muayene (21 assertion — gerçek değerlere kilitli)
- Otomobil 5 yaş benzin: **3.748 TL** (3.288 + 460 egzoz)
- Otomobil 10 yaş dizel: **3.748 TL**
- Elektrikli otomobil: **3.288 TL** (egzoz yok)
- Otobüs (ağır vasıta): **4.446 TL**
- Motosiklet: **1.674 TL**
- Egzoz farkı (benzin - elektrik): **460 TL**

### MTV (35 assertion)
- Elektrikli `confidence === 'kesin'`
- Benzinli/dizel/lpg/hibrit `confidence === 'yaklaşık'`
- Yaklaşık olanlar `uyari` field'ı içerir
- Elektrikli `uyari` içermez

---

## Yeni Dosyalar

- `docs/runtime-status.md` — Tek doğruluk kaynağı (production vs local)
- `docs/status-truth-alignment.md` — Bu dosya

## Değiştirilen Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `src/data/muayene.ts` | Tüm araç tipleri için gerçek 2026 TÜVTÜRK değerleri |
| `src/lib/muayene/calculator.ts` | String mismatch bug fix (Türkçe karakter), fallback 150 TL kaldırıldı |
| `src/lib/muayene/__tests__/muayene.test.ts` | Gerçek değerlere kilitli testler |
| `src/lib/mtv/types.ts` | `confidence: DataConfidence` (artık "kesin" hard-code değil), `uyari?` field |
| `src/lib/mtv/calculator.ts` | Confidence elektrik=kesin, diğerleri=yaklaşık + uyarı |
| `src/lib/mtv/__tests__/mtv.test.ts` | Confidence beklentileri güncellendi |
| `src/app/araclar/mtv-hesaplama/page.tsx` | Dinamik badge + sarı uyarı kutusu + GİB link |
| `src/app/metodoloji/page.tsx` | Rota satırı 3 alt satıra bölündü |
| `src/lib/route/route-engine.ts` | `determineConfidence()` artık max "yüksek" döner |
| `docs/status-p1.md` | "Tamamlandı" → "Kod hazır, env bekliyor" + production parity tablosu |

---

## KALAN SORUMLULUK (Kullanıcının Yapması Gereken)

Production'daki ödeme sayfasını gerçek aktif etmek için:
1. Vercel Dashboard → Settings → Environment Variables
2. Şunları ekle (local'de zaten çalışan değerler):
   - `IYZICO_API_KEY`
   - `IYZICO_SECRET_KEY`
   - `IYZICO_BASE_URL=https://sandbox-api.iyzipay.com`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Yeniden deploy
4. /odeme otomatik olarak gerçek checkout flow'a geçer

Bu yapılana kadar **doküman ve canlı sayfa hizalı**: ikisi de "henüz aktif değil" diyor.
