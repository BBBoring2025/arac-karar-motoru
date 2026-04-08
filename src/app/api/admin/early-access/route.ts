/**
 * Sprint D P10 — GET /api/admin/early-access
 *
 * Admin-guarded read endpoint for the waitlist table. Returns the total
 * count + a paginated list of submissions. Masks ip_hash + user_agent
 * for display safety (never leaks raw user agent strings in the admin UI).
 *
 * Auth: requireAdmin() (Sprint A/B auth pattern)
 * Storage: erken_erisim table (Sprint D P2 migration)
 */

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return Response.json(
      { ok: false, error: auth.error ?? 'unauthorized' },
      { status: 403 }
    );
  }

  const { searchParams } = request.nextUrl;
  const offsetRaw = parseInt(searchParams.get('offset') ?? '0', 10);
  const limitRaw = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
  const offset = Math.max(0, isNaN(offsetRaw) ? 0 : offsetRaw);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, isNaN(limitRaw) ? DEFAULT_LIMIT : limitRaw)
  );

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return Response.json(
      { ok: false, error: 'admin_client_unavailable' },
      { status: 500 }
    );
  }

  // Total count
  const { count: totalCount, error: countError } = await supabase
    .from('erken_erisim')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    return Response.json(
      { ok: false, error: 'db_error', code: countError.code },
      { status: 500 }
    );
  }

  // Page
  const { data, error } = await supabase
    .from('erken_erisim')
    .select(
      'id, ad, email, ilgi, not_metni, source_page, ip_hash, user_agent, status, created_at, updated_at'
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return Response.json(
      { ok: false, error: 'db_error', code: error.code },
      { status: 500 }
    );
  }

  // Mask PII-ish fields for display
  const masked = (data ?? []).map((row) => ({
    ...row,
    ip_hash: row.ip_hash ? row.ip_hash.slice(0, 12) + '…' : null,
    user_agent: row.user_agent ? row.user_agent.slice(0, 80) : null,
  }));

  return Response.json({
    ok: true,
    count: totalCount ?? 0,
    offset,
    limit,
    entries: masked,
  });
}
