/**
 * Sprint D P3 — Early access form input validation.
 *
 * Pure function (no side effects, no I/O). Exported for unit testing.
 * Used by src/app/api/early-access/route.ts POST handler.
 *
 * KVKK: no cleartext IP touched here. The route handler hashes the IP
 * *after* validation passes; this module only validates the user-provided
 * body fields.
 */

export type IlgiEnum =
  | 'tekli'
  | 'karsilastirma'
  | 'ticari'
  | 'genel'
  | 'b2b_widget';

export const VALID_ILGI: IlgiEnum[] = [
  'tekli',
  'karsilastirma',
  'ticari',
  'genel',
  'b2b_widget',
];

export interface EarlyAccessInput {
  ad: string;
  email: string;
  ilgi: IlgiEnum;
  not_metni?: string;
  source_page?: string;
}

export type ValidationResult =
  | { ok: true; data: EarlyAccessInput }
  | { ok: false; error: ValidationError };

export type ValidationError =
  | 'missing_ad'
  | 'ad_too_short'
  | 'ad_too_long'
  | 'missing_email'
  | 'invalid_email'
  | 'email_too_long'
  | 'missing_ilgi'
  | 'invalid_ilgi'
  | 'note_too_long'
  | 'source_page_too_long';

// Simple email regex — sufficient for form validation, not RFC-complete.
// Requires at least one `@`, at least one `.` after the `@`, and no spaces.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AD_MIN = 2;
const AD_MAX = 100;
const EMAIL_MAX = 200;
const NOTE_MAX = 1000;
const SOURCE_PAGE_MAX = 200;

export function validateInput(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'missing_ad' };
  }
  const body = raw as Record<string, unknown>;

  // ─── ad ─────────────────────────────────────────────────────────────
  const adRaw = body.ad;
  if (typeof adRaw !== 'string' || adRaw.trim().length === 0) {
    return { ok: false, error: 'missing_ad' };
  }
  const ad = adRaw.trim();
  if (ad.length < AD_MIN) {
    return { ok: false, error: 'ad_too_short' };
  }
  if (ad.length > AD_MAX) {
    return { ok: false, error: 'ad_too_long' };
  }

  // ─── email ──────────────────────────────────────────────────────────
  const emailRaw = body.email;
  if (typeof emailRaw !== 'string' || emailRaw.trim().length === 0) {
    return { ok: false, error: 'missing_email' };
  }
  const email = emailRaw.trim().toLowerCase();
  if (email.length > EMAIL_MAX) {
    return { ok: false, error: 'email_too_long' };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'invalid_email' };
  }

  // ─── ilgi ───────────────────────────────────────────────────────────
  const ilgiRaw = body.ilgi;
  if (typeof ilgiRaw !== 'string' || ilgiRaw.length === 0) {
    return { ok: false, error: 'missing_ilgi' };
  }
  if (!VALID_ILGI.includes(ilgiRaw as IlgiEnum)) {
    return { ok: false, error: 'invalid_ilgi' };
  }
  const ilgi = ilgiRaw as IlgiEnum;

  // ─── not_metni (optional) ───────────────────────────────────────────
  let notMetni: string | undefined;
  if (body.not_metni !== undefined && body.not_metni !== null && body.not_metni !== '') {
    if (typeof body.not_metni !== 'string') {
      return { ok: false, error: 'note_too_long' };
    }
    const n = (body.not_metni as string).trim();
    if (n.length > NOTE_MAX) {
      return { ok: false, error: 'note_too_long' };
    }
    if (n.length > 0) {
      notMetni = n;
    }
  }

  // ─── source_page (optional) ─────────────────────────────────────────
  let sourcePage: string | undefined;
  if (body.source_page !== undefined && body.source_page !== null && body.source_page !== '') {
    if (typeof body.source_page !== 'string') {
      return { ok: false, error: 'source_page_too_long' };
    }
    const sp = (body.source_page as string).trim();
    if (sp.length > SOURCE_PAGE_MAX) {
      return { ok: false, error: 'source_page_too_long' };
    }
    if (sp.length > 0) {
      sourcePage = sp;
    }
  }

  return {
    ok: true,
    data: {
      ad,
      email,
      ilgi,
      not_metni: notMetni,
      source_page: sourcePage,
    },
  };
}
