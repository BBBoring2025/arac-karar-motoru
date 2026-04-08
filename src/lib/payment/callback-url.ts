/**
 * Sprint C P2 — getCallbackBaseUrl() helper
 *
 * Sprint B left a known caveat: /api/payment/create returns 500 in production.
 * Root cause: src/app/api/payment/create/route.ts:29-32 fell back to
 * 'http://localhost:3000' when NEXT_PUBLIC_SITE_URL was missing in the Vercel
 * env. iyzico sandbox rejects localhost callback URLs that arrive from a
 * non-localhost host, which made the iyzipay SDK throw before the create
 * route could return a meaningful error.
 *
 * Sprint C fix: this helper centralizes the precedence so the bug surfaces
 * deterministically:
 *
 *   1. NEXT_PUBLIC_SITE_URL  (explicit override; preferred)
 *   2. https://${VERCEL_URL} (Vercel auto-injects this; safe fallback)
 *   3. http://localhost:3000 (only when NODE_ENV !== 'production')
 *   4. throws MissingCallbackBaseUrlError (production with neither set)
 *
 * The throw is intentional: iyzico will silently swallow a bad callback URL,
 * so we'd rather return HTTP 500 with a clear error code from /api/payment/create
 * than let the SDK fail in an opaque way.
 */

export class MissingCallbackBaseUrlError extends Error {
  readonly code = 'MISSING_CALLBACK_BASE_URL';
  constructor() {
    super(
      'Callback base URL cannot be determined. Set NEXT_PUBLIC_SITE_URL in the Vercel Production environment, or rely on Vercel-injected VERCEL_URL. See docs/payment-modes.md.'
    );
    this.name = 'MissingCallbackBaseUrlError';
  }
}

/**
 * Returns the base URL the iyzico callback should redirect to (no trailing slash).
 *
 * @throws MissingCallbackBaseUrlError when none of the expected sources are present
 *   in production mode.
 */
export function getCallbackBaseUrl(): string {
  // Priority 1: explicit override from env (preferred for production)
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.trim().length > 0) {
    return stripTrailingSlash(explicit.trim());
  }

  // Priority 2: Vercel-injected VERCEL_URL (always set on Vercel deployments).
  // VERCEL_URL has no protocol prefix, e.g. 'arac-karar-motoru-abc123.vercel.app'
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl && vercelUrl.trim().length > 0) {
    return `https://${stripTrailingSlash(vercelUrl.trim())}`;
  }

  // Priority 3: localhost fallback ONLY in non-production
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:3000';
  }

  // Production with neither: throw to surface the bug instead of silently using localhost.
  throw new MissingCallbackBaseUrlError();
}

function stripTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
