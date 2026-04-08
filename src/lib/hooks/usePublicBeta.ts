'use client';

/**
 * Sprint D P6 — usePublicBeta()
 *
 * Shared client hook for Header + Footer to read `publicBetaMode` from
 * /api/health. Session-cached to avoid duplicate fetches on the same page.
 *
 * Fail-safe default: returns `true` while the fetch is pending and if the
 * fetch fails. This protects against accidental "launch" when the env var
 * is missing or the API is unreachable.
 *
 * Runtime contract:
 *   - /api/health returns top-level `publicBetaMode: boolean` (Sprint D P1)
 *   - Flag is computed from PUBLIC_BETA_MODE env var, default TRUE
 *   - Explicit PUBLIC_BETA_MODE='false' is the ONLY way to disable
 */

import { useEffect, useState } from 'react';

// Module-scope cache. One fetch per session/tab.
let cached: boolean | null = null;
let pending: Promise<boolean> | null = null;

async function fetchOnce(): Promise<boolean> {
  if (cached !== null) return cached;
  if (pending) return pending;

  pending = fetch('/api/health', { cache: 'no-store' })
    .then((r) => {
      if (!r.ok) throw new Error('health_not_ok');
      return r.json();
    })
    .then((j) => {
      const v = j?.publicBetaMode === true;
      cached = v;
      return v;
    })
    .catch(() => {
      // Fail-safe: any error → stay in beta
      cached = true;
      return true;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

/**
 * Client hook. Fail-safe default is `true` (visible BETA badges) while the
 * fetch is pending or if it fails.
 */
export function usePublicBeta(): boolean {
  const [isBeta, setIsBeta] = useState<boolean>(cached ?? true);

  useEffect(() => {
    if (cached !== null) {
      setIsBeta(cached);
      return;
    }
    let cancelled = false;
    fetchOnce().then((v) => {
      if (!cancelled) setIsBeta(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return isBeta;
}
