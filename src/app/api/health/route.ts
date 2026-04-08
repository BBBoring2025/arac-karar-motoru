/**
 * /api/health — Runtime Health Check Endpoint
 *
 * Döndürür:
 *   - status: genel durum
 *   - flags: feature flag state (missingVars strip edilmiş)
 *   - services: Supabase, iyzico reachability
 *   - timestamp: response zamanı
 *
 * GÜVENLIK:
 *   - HİÇBİR SECRET SIZDIRMAZ
 *   - Sadece boolean presence + reason code döner
 *   - Error messages .code/.name only, asla .stack/.message
 *
 * Her zaman HTTP 200 döner — service down = response field, HTTP code DEĞİL.
 */

import { getServerFlags, flagsToPublicJSON } from '@/lib/flags';
import { supabase } from '@/lib/supabase';

// Node runtime — iyzipay ve Supabase server SDK consistency için
export const runtime = 'nodejs';

// Bu endpoint her zaman fresh — cache'lenmemeli
export const dynamic = 'force-dynamic';

interface ServiceStatus {
  reachable: boolean | null;
  latencyMs?: number;
  mode?: string;
  error?: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'fail';
  timestamp: string;
  flags: ReturnType<typeof flagsToPublicJSON>;
  services: {
    supabase: ServiceStatus;
    iyzico: ServiceStatus;
  };
}

/**
 * Supabase connectivity probe — 2 second timeout.
 * Uses mtv_tarifeleri (RLS-enabled public read) to avoid the known
 * kullanicilar RLS self-reference issue (PostgreSQL error 42P17).
 * Never throws. Returns reachable:false with error code on failure.
 */
async function probeSupabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 2000),
    );
    const queryPromise = supabase
      .from('mtv_tarifeleri')
      .select('*', { count: 'exact', head: true });

    const result = await Promise.race([queryPromise, timeoutPromise]);
    const latencyMs = Date.now() - start;

    // PostgREST returns { error } object even if query succeeds (no data)
    if (result && typeof result === 'object' && 'error' in result && result.error) {
      return {
        reachable: false,
        latencyMs,
        error: (result.error as { code?: string }).code || 'query_error',
      };
    }

    return { reachable: true, latencyMs };
  } catch (err) {
    return {
      reachable: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.name : 'unknown',
    };
  }
}

/**
 * iyzico mode detection — NO actual network call.
 * Just checks env vars to determine mode, does not probe iyzico API.
 */
function getIyzicoStatus(paymentEnabled: boolean): ServiceStatus {
  if (!paymentEnabled) {
    return { reachable: null, mode: 'disabled' };
  }

  // Infer mode from IYZICO_BASE_URL without reading the secret key
  const baseUrl = process.env.IYZICO_BASE_URL || '';
  const mode = baseUrl.includes('sandbox') ? 'sandbox' : 'production';

  return { reachable: null, mode };
}

export async function GET() {
  try {
    const flags = getServerFlags();
    const supabaseStatus = await probeSupabase();
    const iyzicoStatus = getIyzicoStatus(flags.paymentEnabled.enabled);

    // Determine overall status
    let status: HealthResponse['status'] = 'ok';
    if (!supabaseStatus.reachable) {
      status = 'degraded';
    }

    const response: HealthResponse = {
      status,
      timestamp: new Date().toISOString(),
      flags: flagsToPublicJSON(flags),
      services: {
        supabase: supabaseStatus,
        iyzico: iyzicoStatus,
      },
    };

    return Response.json(response, { status: 200 });
  } catch (err) {
    // Even the health endpoint itself must never leak
    return Response.json(
      {
        status: 'fail',
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.name : 'unknown',
      },
      { status: 200 },
    );
  }
}
