-- Sprint D P2 — Early Access (Waitlist) table
--
-- Captures public beta waitlist signups while payment live is deferred.
-- KVKK-aware: IP is stored as SHA-256 hash only, not cleartext.
-- RLS: public anon key can INSERT only (no SELECT/UPDATE/DELETE).
-- Admin reads via service role key (bypasses RLS).
--
-- Related:
--   - docs/public-beta-policy.md (Sprint D P1)
--   - src/app/api/early-access/route.ts (Sprint D P3)
--   - src/components/payment/EarlyAccessForm.tsx (Sprint D P4)

CREATE TABLE IF NOT EXISTS erken_erisim (
  id BIGSERIAL PRIMARY KEY,
  ad TEXT NOT NULL,
  email TEXT NOT NULL,
  -- ilgi: which product they want (matches Sprint A products.ts + b2b widget)
  ilgi TEXT NOT NULL CHECK (ilgi IN ('tekli', 'karsilastirma', 'ticari', 'genel', 'b2b_widget')),
  not_metni TEXT,
  -- Which page the form was submitted from (for attribution)
  source_page TEXT,
  -- KVKK: SHA-256 hash, never cleartext IP
  ip_hash TEXT,
  -- Truncated to first 200 chars for UA fingerprinting
  user_agent TEXT,
  -- Lifecycle state
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for admin panel query patterns
CREATE INDEX IF NOT EXISTS idx_erken_erisim_email ON erken_erisim(email);
CREATE INDEX IF NOT EXISTS idx_erken_erisim_created ON erken_erisim(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_erken_erisim_ilgi ON erken_erisim(ilgi);
CREATE INDEX IF NOT EXISTS idx_erken_erisim_status ON erken_erisim(status);

-- RLS
ALTER TABLE erken_erisim ENABLE ROW LEVEL SECURITY;

-- Public (anon key) can INSERT only. No SELECT/UPDATE/DELETE policy = denied
-- by default for the anon role. Admin reads use service role key which
-- bypasses RLS entirely.
DROP POLICY IF EXISTS "Public can insert waitlist entries" ON erken_erisim;
CREATE POLICY "Public can insert waitlist entries" ON erken_erisim
  FOR INSERT WITH CHECK (true);
