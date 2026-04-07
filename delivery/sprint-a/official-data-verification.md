# Official Data Verification — Sprint A

Sprint A'da hangi resmi verilerin **gerçekten doğrulandığını** ve hangilerinin doğrulanmadığını şeffaf şekilde gösterir.

---

## ✅ Bu Sprintte DOĞRULANAN Veriler

### 1. TÜVTÜRK 2026 Muayene Ücretleri

**Doğrulama yöntemi:** WebSearch (Sözcü, Hürriyet Bigpara, Milliyet, TÜVTÜRK official)

**Doğrulanmış değerler:**

| Araç Kategorisi | Ücret (TL) | Kaynak |
|----------------|------------|--------|
| Otomobil/Minibüs/Kamyonet/SUV | **3.288** | Sözcü, Hürriyet, TÜVTÜRK |
| Otobüs/Kamyon/Çekici/Tanker | **4.446** | Sözcü, Hürriyet |
| Motosiklet/Traktör | **1.674** | Hürriyet Bigpara |
| Egzoz Emisyon Ölçümü | **460** | Sözcü, Bigpara |
| Yola elverişlilik (otomobil) | **822** (toplam 4.110 TL) | Sözcü |
| Yola elverişlilik (ağır vasıta) | **1.111,50** (toplam 5.557,50 TL) | Sözcü |

**Zam oranı:** 27 Kasım 2025 Resmi Gazete — %25.49 yeniden değerleme oranı.

**Kaynaklar:**
- [Sözcü 2026 TÜVTÜRK ücretleri](https://www.sozcu.com.tr/tuvturk-2026-muayene-ucretleri-belli-oldu-butun-arac-sahiplerini-ilgilendiriyor-p281523)
- [Bigpara araç muayene 2026 tablosu](https://bigpara.hurriyet.com.tr/ekonomi-haberleri/galeri-arac-muayene-ucreti-2026-tablosu-yeni-yil-arac-muayene-ucretleri-ne-kadar-oldu-kac-tl-iste-traktor-otomobil-kamyonet_ID1623066/)
- [TÜVTÜRK Resmi Fiyat Listesi](https://www.tuvturk.com.tr/arac-muayene-fiyat-listesi.aspx)
- [İşçi Haber - %25.49 zam](https://www.iscihaber.net/otomobil/arac-muayene-ucretlerine-yuzde-2549-zam-2026da-otomobil-muayenesi-3-bin-288-tlye-cikiyor/191387)
- [CNN Türk araç muayene tarife](https://www.cnnturk.com/otomobil/galeri/tuvturk-arac-muayene-ucretleri-guncel-tarife-2026-arac-muayenesi-toplam-maliyeti-ne-kadar-2384027)

**Uygulama:**
- Veri dosyası `src/data/muayene.ts` tüm 8 araç tipi için güncellendi
- Golden testler bu **kesin değerlere kilitli** (3.748, 3.288, 4.446, 1.674, 460)
- Calculator string mismatch bug düzeltildi

**Güven seviyesi:** **Kesin** (gerçek 2026 tarifeleri)

---

### 2. MTV 2026 Genel Doğrulama

**Doğrulama yöntemi:** WebSearch (Hürriyet, Milliyet, GİB MTV Hesaplama)

**Doğrulanan bilgiler:**
- 2026 MTV %18.95 zam alındı (yeniden değerleme oranı altında)
- Otomobillerde yıllık tutar **5.750 - 274.415 TL** arasında değişiyor
- En düşük bracket için minimum ~5.750 TL

**Kod'daki snapshot:**
- 1-1300cc benzin 1-3 yaş: **3.950 TL** (kod) vs **5.750 TL+** (gerçek minimum)
- ⚠️ Kod snapshot'ı 2026 zamlarını yansıtmıyor

**Yapılan düzeltme:**
- Veri sayıları tek tek güncellenmedi (45+ değer × 5 yakıt tipi = 225+ değer doğrulanması bu sprint kapsamı dışı)
- **Confidence "yaklaşık"a düşürüldü** + UI'da sarı uyarı + GİB MTV Hesaplama linki eklendi
- Kullanıcı artık 3.950 TL'ye "kesin" sanmıyor

**Kaynaklar:**
- [Bigpara 2026 MTV tarifesi](https://bigpara.hurriyet.com.tr/haberler/ekonomi-haberleri/en-cok-satan-modeller-uzerinden-kalem-kalem-hesapladik-iste-2026nin-mtv-tarifesi_ID1622792/)
- [GİB MTV Hesaplama (resmi)](https://dijital.gib.gov.tr/hesaplamalar/MTVHesaplama)

**Güven seviyesi:** **Yaklaşık** (kullanıcı GİB linkine yönlendiriliyor)

---

## ⚠️ Bu Sprintte DOĞRULANMAYAN Veriler

### Önceki Sprintlerde Doğrulanmıştı (yeniden test edilmedi)

| Veri | Önceki doğrulama | Güven |
|------|-----------------|-------|
| Osmangazi Köprüsü 1.sınıf | 995 TL (KGM) | Kesin |
| Avrasya Tüneli 1.sınıf | 280 TL (KGM) | Kesin |
| 15 Temmuz Köprüsü 1.sınıf | 59 TL (KGM) | Kesin |
| FSM Köprüsü 1.sınıf | 59 TL (KGM) | Kesin |
| YSS Köprüsü 1.sınıf | 95 TL (KGM) | Kesin |
| 1915 Çanakkale 1.sınıf | 995 TL (KGM) | Kesin |

### Hâlâ Snapshot Olarak Kalan (resmi kaynak verisi alınmadı)

| Veri | Mevcut durum | Eylem |
|------|-------------|-------|
| MTV tarifeleri (45+ bracket) | 2026 başı snapshot | Confidence "yaklaşık", GİB linki |
| Otoyol segment ücretleri (12 segment) | KM tahmini | Confidence "tahmini" |
| Yakıt fiyatları (PETDER) | 2026-01-15 snapshot | Confidence "yaklaşık", kullanıcı override |
| Amortisman oranları (OYDER) | Sektör ortalama | Confidence "tahmini" |
| Sigorta premium (OYDER) | Sektör ortalama | Confidence "tahmini" |
| Bakım maliyetleri (OYDER) | Sektör ortalama | Confidence "tahmini" |
| Noter ücretleri (Adalet Bakanlığı) | Daha önce eklenmiş | Confidence "kesin" (yeniden doğrulanmadı) |

---

## Doğrulama Stratejisi

Sprint A'nın amacı **truth alignment**'tı, exhaustive data refresh değil. Strateji:

1. **Kullanıcı en sık gördüğü iddiayı** önce düzelt (muayene)
2. **Doğrulanamayan veriler için confidence düşür** (MTV)
3. **Tüm yanlış "kesin" badge'lerini kaldır**
4. **Production durumunu dürüst dokümante et** (runtime-status.md)

Sprint B'de yapılması gereken: MTV tarife snapshot'ını GİB hesap aracıyla 5-10 örnek üzerinden manual tek tek doğrulayıp güncellemek.
