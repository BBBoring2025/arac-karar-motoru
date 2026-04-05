-- Araç Karar Motoru - Supabase Veritabanı Şeması
-- Version 3.0 | Nisan 2026
-- Bu migration dosyası tüm tabloları, RLS politikalarını ve seed verilerini içerir.

-- ============================================
-- 1. ENUM TYPES
-- ============================================

CREATE TYPE yakit_tipi AS ENUM ('benzin', 'dizel', 'lpg', 'hibrit', 'elektrik');
CREATE TYPE arac_segmenti AS ENUM ('kompakt', 'sedan', 'suv', 'hatchback', 'minivan', 'ticari', 'premium');
CREATE TYPE rapor_tipi AS ENUM ('tekli', 'karsilastirma', 'ticari');
CREATE TYPE rapor_durumu AS ENUM ('beklemede', 'odendi', 'hazirlaniyor', 'tamamlandi', 'iptal');
CREATE TYPE odeme_durumu AS ENUM ('beklemede', 'basarili', 'basarisiz', 'iade');

-- ============================================
-- 2. MTV TARİFE TABLOSU
-- ============================================

CREATE TABLE mtv_tarifeleri (
  id BIGSERIAL PRIMARY KEY,
  motor_hacmi_alt INTEGER NOT NULL, -- cc alt sınır
  motor_hacmi_ust INTEGER NOT NULL, -- cc üst sınır
  yas_alt INTEGER NOT NULL,         -- araç yaş alt sınır
  yas_ust INTEGER NOT NULL,         -- araç yaş üst sınır
  yakit_tipi yakit_tipi NOT NULL DEFAULT 'benzin',
  yillik_tutar DECIMAL(10,2) NOT NULL,
  yil INTEGER NOT NULL DEFAULT 2026,
  kaynak TEXT DEFAULT 'GİB 2026 MTV Tebliği',
  guncelleme_tarihi TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mtv_motor_hacmi ON mtv_tarifeleri(motor_hacmi_alt, motor_hacmi_ust);
CREATE INDEX idx_mtv_yas ON mtv_tarifeleri(yas_alt, yas_ust);

-- ============================================
-- 3. TÜVTÜRK MUAYENE ÜCRETLERİ
-- ============================================

CREATE TABLE muayene_ucretleri (
  id BIGSERIAL PRIMARY KEY,
  arac_tipi TEXT NOT NULL, -- Otomobil, Minibüs, Kamyonet, etc.
  muayene_turu TEXT NOT NULL, -- İlk, Periyodik, Tekrar, Egzoz
  ucret DECIMAL(10,2) NOT NULL,
  kdv_dahil BOOLEAN DEFAULT TRUE,
  yil INTEGER NOT NULL DEFAULT 2026,
  kaynak TEXT DEFAULT 'TÜVTÜRK 2026 Tarifesi',
  guncelleme_tarihi TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. KGM OTOYOL/KÖPRÜ ÜCRETLERİ
-- ============================================

CREATE TABLE otoyol_ucretleri (
  id BIGSERIAL PRIMARY KEY,
  guzergah_adi TEXT NOT NULL,
  guzergah_tipi TEXT NOT NULL, -- otoyol, köprü, tünel
  arac_sinifi INTEGER NOT NULL CHECK (arac_sinifi BETWEEN 1 AND 5),
  hgs_ucret DECIMAL(10,2) NOT NULL,
  ogs_ucret DECIMAL(10,2) NOT NULL,
  yil INTEGER NOT NULL DEFAULT 2026,
  kaynak TEXT DEFAULT 'KGM 2026 Tarifeleri',
  guncelleme_tarihi TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_otoyol_guzergah ON otoyol_ucretleri(guzergah_adi);

-- ============================================
-- 5. NOTER ÜCRETLERİ
-- ============================================

CREATE TABLE noter_ucretleri (
  id BIGSERIAL PRIMARY KEY,
  islem_tipi TEXT NOT NULL,
  deger_alt DECIMAL(12,2) DEFAULT 0,
  deger_ust DECIMAL(12,2) DEFAULT 999999999,
  oran DECIMAL(5,4), -- yüzde oran (ör: 0.0015)
  sabit_ucret DECIMAL(10,2), -- sabit ücret
  min_ucret DECIMAL(10,2),
  yil INTEGER NOT NULL DEFAULT 2026,
  kaynak TEXT DEFAULT 'Noterler Birliği 2026',
  guncelleme_tarihi TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ARAÇ VERİTABANI
-- ============================================

CREATE TABLE araclar (
  id BIGSERIAL PRIMARY KEY,
  marka TEXT NOT NULL,
  model TEXT NOT NULL,
  yil_baslangic INTEGER NOT NULL,
  yil_bitis INTEGER,
  motor_hacmi INTEGER, -- cc
  yakit_tipi yakit_tipi NOT NULL,
  ortalama_tuketim DECIMAL(4,1) NOT NULL, -- L/100km
  segment arac_segmenti NOT NULL,
  tahmini_bakim_yillik DECIMAL(10,2),
  tahmini_sigorta_alt DECIMAL(10,2),
  tahmini_sigorta_ust DECIMAL(10,2),
  ortalama_piyasa_fiyati DECIMAL(12,2),
  co2_emisyon INTEGER, -- g/km
  populerlik_sirasi INTEGER,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_araclar_marka ON araclar(marka);
CREATE INDEX idx_araclar_segment ON araclar(segment);
CREATE INDEX idx_araclar_yakit ON araclar(yakit_tipi);

-- ============================================
-- 7. AMORTİSMAN VERİLERİ
-- ============================================

CREATE TABLE amortisman_oranlari (
  id BIGSERIAL PRIMARY KEY,
  segment arac_segmenti NOT NULL,
  yil INTEGER NOT NULL, -- 1, 2, 3, 4, 5...
  deger_kaybi_orani DECIMAL(5,2) NOT NULL, -- yüzde
  yakit_tipi yakit_tipi, -- NULL = tüm yakıt tipleri
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_amortisman_segment ON amortisman_oranlari(segment, yil);

-- ============================================
-- 8. BAKIM BENCHMARK VERİLERİ
-- ============================================

CREATE TABLE bakim_benchmark (
  id BIGSERIAL PRIMARY KEY,
  marka TEXT NOT NULL,
  segment arac_segmenti,
  periyodik_bakim_ortalama DECIMAL(10,2), -- TL/yıl
  fren_bakim DECIMAL(10,2),
  lastik_ortalama DECIMAL(10,2),
  notlar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. KULLANICILAR
-- ============================================

CREATE TABLE kullanicilar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  ad TEXT,
  soyad TEXT,
  telefon TEXT,
  rol TEXT DEFAULT 'kullanici', -- kullanici, admin, b2b
  b2b_firma TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kullanicilar_email ON kullanicilar(email);

-- ============================================
-- 10. RAPORLAR
-- ============================================

CREATE TABLE raporlar (
  id BIGSERIAL PRIMARY KEY,
  kullanici_id UUID REFERENCES kullanicilar(id),
  rapor_tipi rapor_tipi NOT NULL,
  durum rapor_durumu DEFAULT 'beklemede',

  -- Araç bilgileri (JSON olarak saklanır)
  arac_bilgileri JSONB NOT NULL,

  -- Hesaplama sonuçları
  tco_12ay DECIMAL(12,2),
  tco_36ay DECIMAL(12,2),
  km_basi_maliyet DECIMAL(6,2),
  karar_ozeti TEXT, -- al / kirala / bekle

  -- Tam hesaplama sonuçları (JSON)
  hesaplama_sonuclari JSONB,
  alternatifler JSONB,

  -- Fiyat ve ödeme
  fiyat DECIMAL(10,2) NOT NULL,
  odeme_id TEXT, -- iyzico payment ID

  -- PDF
  pdf_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_raporlar_kullanici ON raporlar(kullanici_id);
CREATE INDEX idx_raporlar_durum ON raporlar(durum);

-- ============================================
-- 11. ÖDEMELER
-- ============================================

CREATE TABLE odemeler (
  id BIGSERIAL PRIMARY KEY,
  rapor_id BIGINT REFERENCES raporlar(id),
  kullanici_id UUID REFERENCES kullanicilar(id),

  tutar DECIMAL(10,2) NOT NULL,
  para_birimi TEXT DEFAULT 'TRY',
  durum odeme_durumu DEFAULT 'beklemede',

  -- iyzico bilgileri
  iyzico_payment_id TEXT,
  iyzico_conversation_id TEXT,
  iyzico_response JSONB,

  -- Kart bilgileri (sadece son 4 hane)
  kart_son_dort TEXT,
  kart_tipi TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_odemeler_rapor ON odemeler(rapor_id);

-- ============================================
-- 12. B2B MÜŞTERİLER
-- ============================================

CREATE TABLE b2b_musteriler (
  id BIGSERIAL PRIMARY KEY,
  firma_adi TEXT NOT NULL,
  yetkili_adi TEXT,
  email TEXT NOT NULL,
  telefon TEXT,
  paket TEXT DEFAULT 'baslangic', -- baslangic, profesyonel, kurumsal, filo
  aylik_sorgu_limiti INTEGER DEFAULT 500,
  kullanilan_sorgu INTEGER DEFAULT 0,
  widget_sayisi INTEGER DEFAULT 1,
  white_label BOOLEAN DEFAULT FALSE,
  api_key TEXT UNIQUE,
  aktif BOOLEAN DEFAULT TRUE,
  baslangic_tarihi DATE DEFAULT CURRENT_DATE,
  bitis_tarihi DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. ANALİTİK VE LOG
-- ============================================

CREATE TABLE sayfa_goruntulumeleri (
  id BIGSERIAL PRIMARY KEY,
  sayfa TEXT NOT NULL,
  ip_hash TEXT, -- IP hash (KVKK uyumu için hash)
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goruntumleme_sayfa ON sayfa_goruntulumeleri(sayfa);
CREATE INDEX idx_goruntumleme_tarih ON sayfa_goruntulumeleri(created_at);

CREATE TABLE hesaplama_loglari (
  id BIGSERIAL PRIMARY KEY,
  arac_tipi TEXT,
  hesaplama_tipi TEXT, -- mtv, yakit, otoyol, muayene, rota, tco
  girdi_parametreleri JSONB,
  sonuc JSONB,
  kullanici_id UUID REFERENCES kullanicilar(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. YAKIT FİYATLARI (Haftalık Güncelleme)
-- ============================================

CREATE TABLE yakit_fiyatlari (
  id BIGSERIAL PRIMARY KEY,
  yakit_tipi yakit_tipi NOT NULL,
  fiyat DECIMAL(6,2) NOT NULL, -- TL/lt veya TL/kWh
  sehir TEXT DEFAULT 'İstanbul',
  kaynak TEXT DEFAULT 'PETDER',
  gecerlilik_tarihi DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_yakit_fiyat_tarih ON yakit_fiyatlari(gecerlilik_tarihi DESC);

-- ============================================
-- 15. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE kullanicilar ENABLE ROW LEVEL SECURITY;
ALTER TABLE raporlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE odemeler ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi verilerini görebilir
CREATE POLICY "Kullanıcılar kendi profilini görebilir" ON kullanicilar
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Kullanıcılar kendi profilini güncelleyebilir" ON kullanicilar
  FOR UPDATE USING (auth.uid() = auth_id);

-- Raporlar: kullanıcı kendi raporlarını görebilir
CREATE POLICY "Kullanıcılar kendi raporlarını görebilir" ON raporlar
  FOR SELECT USING (
    kullanici_id IN (SELECT id FROM kullanicilar WHERE auth_id = auth.uid())
  );

-- Ödemeler: kullanıcı kendi ödemelerini görebilir
CREATE POLICY "Kullanıcılar kendi ödemelerini görebilir" ON odemeler
  FOR SELECT USING (
    kullanici_id IN (SELECT id FROM kullanicilar WHERE auth_id = auth.uid())
  );

-- Admin full access (rol = 'admin')
CREATE POLICY "Adminler tüm kullanıcıları görebilir" ON kullanicilar
  FOR ALL USING (
    EXISTS (SELECT 1 FROM kullanicilar WHERE auth_id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "Adminler tüm raporları görebilir" ON raporlar
  FOR ALL USING (
    EXISTS (SELECT 1 FROM kullanicilar WHERE auth_id = auth.uid() AND rol = 'admin')
  );

-- Public tables (herkes okuyabilir)
ALTER TABLE mtv_tarifeleri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "MTV tarifeleri herkese açık" ON mtv_tarifeleri FOR SELECT USING (true);

ALTER TABLE muayene_ucretleri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Muayene ücretleri herkese açık" ON muayene_ucretleri FOR SELECT USING (true);

ALTER TABLE otoyol_ucretleri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Otoyol ücretleri herkese açık" ON otoyol_ucretleri FOR SELECT USING (true);

ALTER TABLE araclar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Araçlar herkese açık" ON araclar FOR SELECT USING (true);

ALTER TABLE yakit_fiyatlari ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Yakıt fiyatları herkese açık" ON yakit_fiyatlari FOR SELECT USING (true);

-- ============================================
-- 16. FUNCTIONS & TRIGGERS
-- ============================================

-- Otomatik updated_at güncellemesi
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_kullanicilar_updated
  BEFORE UPDATE ON kullanicilar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_raporlar_updated
  BEFORE UPDATE ON raporlar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_araclar_updated
  BEFORE UPDATE ON araclar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_b2b_updated
  BEFORE UPDATE ON b2b_musteriler
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- B2B sorgu sayacı artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_b2b_query(api_key_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  musteri RECORD;
BEGIN
  SELECT * INTO musteri FROM b2b_musteriler
  WHERE api_key = api_key_param AND aktif = TRUE;

  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF musteri.kullanilan_sorgu >= musteri.aylik_sorgu_limiti THEN RETURN FALSE; END IF;

  UPDATE b2b_musteriler
  SET kullanilan_sorgu = kullanilan_sorgu + 1
  WHERE api_key = api_key_param;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Aylık sorgu sayacı sıfırlama (cron job ile çalıştırılır)
CREATE OR REPLACE FUNCTION reset_monthly_queries()
RETURNS VOID AS $$
BEGIN
  UPDATE b2b_musteriler SET kullanilan_sorgu = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 17. VIEWS
-- ============================================

-- Dashboard özet view
CREATE VIEW admin_dashboard AS
SELECT
  (SELECT COUNT(*) FROM kullanicilar) AS toplam_kullanici,
  (SELECT COUNT(*) FROM raporlar WHERE durum = 'tamamlandi') AS toplam_rapor,
  (SELECT COUNT(*) FROM raporlar WHERE created_at > NOW() - INTERVAL '30 days') AS aylik_rapor,
  (SELECT COALESCE(SUM(tutar), 0) FROM odemeler WHERE durum = 'basarili') AS toplam_gelir,
  (SELECT COALESCE(SUM(tutar), 0) FROM odemeler WHERE durum = 'basarili' AND created_at > NOW() - INTERVAL '30 days') AS aylik_gelir,
  (SELECT COUNT(*) FROM b2b_musteriler WHERE aktif = TRUE) AS aktif_b2b,
  (SELECT COUNT(*) FROM sayfa_goruntulumeleri WHERE created_at > NOW() - INTERVAL '30 days') AS aylik_pv;

-- Popüler araçlar view
CREATE VIEW populer_araclar AS
SELECT
  h.girdi_parametreleri->>'marka' AS marka,
  h.girdi_parametreleri->>'model' AS model,
  COUNT(*) AS hesaplama_sayisi
FROM hesaplama_loglari h
WHERE h.created_at > NOW() - INTERVAL '30 days'
GROUP BY 1, 2
ORDER BY hesaplama_sayisi DESC
LIMIT 20;
