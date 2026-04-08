/**
 * Feature Flags — Tek Doğruluk Kaynağı
 *
 * Her flag'ın 4 yanıtı var:
 *   1. code proof     — flag'ın kodu var mı
 *   2. env proof      — gerekli environment variable var mı
 *   3. runtime proof  — runtime'da provider erişilebilir mi (sadece analytics için client-side)
 *   4. enabled        — yukarıdakilerin composite sonucu
 *
 * ÖNEMLİ: Flag'ler lambda cold start'ta okunur, runtime'da cache'lenir.
 * Environment variable değişikliği **redeploy gerektirir**.
 *
 * SSR vs Client:
 *   - Server modülleri (API routes, server components): `getServerFlags()`
 *   - Client componentleri: `/api/health` fetch et, `flags` field'ını oku
 *
 * Mevcut kod reuse:
 *   - `src/lib/payment/config.ts::isPaymentEnabled()` → flags.ts ONU çağırır
 *   - `src/lib/analytics/tracker.ts::isEnabled()` → refactor edilir, flags.ts'ye delegate eder
 */

import { isPaymentEnabled } from './payment/config';

// ─── Types ──────────────────────────────────────────────────────────────────

export type FlagReason =
  | 'ok'
  | 'missing_env'
  | 'missing_provider'
  | 'disabled_by_flag'
  | 'unknown';

export interface FlagState {
  enabled: boolean;
  reason: FlagReason;
  /**
   * Missing env var names — only included in server-side responses.
   * Stripped before being sent to client via `flagsToPublicJSON()`.
   */
  missingVars?: string[];
}

export interface Flags {
  /** iyzico payment system (depends on IYZICO_API_KEY + IYZICO_SECRET_KEY) */
  paymentEnabled: FlagState;

  /** Supabase admin write operations (depends on SUPABASE_SERVICE_ROLE_KEY) */
  adminWriteEnabled: FlagState;

  /**
   * Analytics (GA4 or Plausible) — client-side flag.
   * Server returns `unknown` reason because it can't inspect `window.gtag`.
   */
  analyticsEnabled: FlagState;

  /** Route engine v3 (Dijkstra + offset) — always enabled, no env gate */
  routeV3Enabled: FlagState;

  /** PDF report generation (jspdf + autotable) — always enabled, no env gate */
  pdfEnabled: FlagState;
}

export interface ClientFlagHints {
  gtag?: boolean;
  plausible?: boolean;
}

// ─── Server-side flag resolution ────────────────────────────────────────────

/**
 * Reads process.env at call time.
 * Use ONLY in server code (route handlers, server components, server actions).
 * Client code should fetch /api/health to get flag state.
 */
export function getServerFlags(): Flags {
  // Payment — reuses existing isPaymentEnabled() primitive (no duplication)
  const paymentOk = isPaymentEnabled();
  const paymentFlag: FlagState = paymentOk
    ? { enabled: true, reason: 'ok' }
    : {
        enabled: false,
        reason: 'missing_env',
        missingVars: ['IYZICO_API_KEY', 'IYZICO_SECRET_KEY'],
      };

  // Admin write — depends on service role key (RLS bypass)
  const adminOk = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminFlag: FlagState = adminOk
    ? { enabled: true, reason: 'ok' }
    : {
        enabled: false,
        reason: 'missing_env',
        missingVars: ['SUPABASE_SERVICE_ROLE_KEY'],
      };

  // Analytics — server cannot know if client-side provider is loaded.
  // Always returns `unknown` reason on the server; true state is determined client-side.
  const analyticsFlag: FlagState = {
    enabled: false,
    reason: 'unknown',
  };

  return {
    paymentEnabled: paymentFlag,
    adminWriteEnabled: adminFlag,
    analyticsEnabled: analyticsFlag,
    routeV3Enabled: { enabled: true, reason: 'ok' },
    pdfEnabled: { enabled: true, reason: 'ok' },
  };
}

// ─── Client-side flag resolution ────────────────────────────────────────────

/**
 * Client-safe flag resolution.
 * Does NOT read process.env — that's server-only.
 *
 * Client uses this to determine analytics state (since server can't see window.gtag).
 * For payment and admin state, client should fetch /api/health and use those flags.
 */
export function getClientFlags(hints: ClientFlagHints): Flags {
  const analyticsOk = !!(hints.gtag || hints.plausible);
  const analyticsFlag: FlagState = analyticsOk
    ? { enabled: true, reason: 'ok' }
    : { enabled: false, reason: 'missing_provider' };

  return {
    // Client can't determine these without a server fetch — mark as unknown
    paymentEnabled: { enabled: false, reason: 'unknown' },
    adminWriteEnabled: { enabled: false, reason: 'unknown' },
    analyticsEnabled: analyticsFlag,
    routeV3Enabled: { enabled: true, reason: 'ok' },
    pdfEnabled: { enabled: true, reason: 'ok' },
  };
}

// ─── Public (client-safe) JSON serialization ───────────────────────────────

export interface PublicFlagState {
  enabled: boolean;
  reason: FlagReason;
}

export type PublicFlags = Record<keyof Flags, PublicFlagState>;

/**
 * Strips `missingVars` field before sending to client.
 * Used by /api/health to avoid leaking exact env var names.
 */
export function flagsToPublicJSON(f: Flags): PublicFlags {
  const strip = (s: FlagState): PublicFlagState => ({
    enabled: s.enabled,
    reason: s.reason,
  });
  return {
    paymentEnabled: strip(f.paymentEnabled),
    adminWriteEnabled: strip(f.adminWriteEnabled),
    analyticsEnabled: strip(f.analyticsEnabled),
    routeV3Enabled: strip(f.routeV3Enabled),
    pdfEnabled: strip(f.pdfEnabled),
  };
}
