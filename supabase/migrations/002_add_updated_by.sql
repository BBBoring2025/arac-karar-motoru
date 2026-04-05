-- Admin audit: updated_by kolonu ekleme
-- Her tarife tablosuna güncellemeyi yapan admin kullanıcının bilgisi eklenir
ALTER TABLE mtv_tarifeleri ADD COLUMN IF NOT EXISTS updated_by TEXT;
ALTER TABLE muayene_ucretleri ADD COLUMN IF NOT EXISTS updated_by TEXT;
ALTER TABLE otoyol_ucretleri ADD COLUMN IF NOT EXISTS updated_by TEXT;
ALTER TABLE yakit_fiyatlari ADD COLUMN IF NOT EXISTS updated_by TEXT;
ALTER TABLE araclar ADD COLUMN IF NOT EXISTS updated_by TEXT;
ALTER TABLE amortisman_oranlari ADD COLUMN IF NOT EXISTS updated_by TEXT;
ALTER TABLE bakim_benchmark ADD COLUMN IF NOT EXISTS updated_by TEXT;
