/**
 * Sprint D P3 — POST /api/early-access
 *
 * Public endpoint for waitlist signups during public beta.
 * Uses admin client (service role key) to insert into erken_erisim table.
 *
 * KVKK: IP is hashed (SHA-256) before storage. User agent is truncated.
 * No cleartext PII beyond name + email.
 *
 * Related:
 *   - supabase/migrations/003_early_access.sql (table schema)
 *   - src/app/api/early-access/validation.ts (pure input validation)
 *   - src/components/payment/EarlyAccessForm.tsx (the form UI)
 *   - docs/public-beta-policy.md (why this exists)
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createAdminClient } from '@/lib/supabase';
import { validateInput } from './validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function hashIp(ipRaw: string | null): string {
  if (!ipRaw) return 'unknown';
  const salt = 'akm-sprint-d-early-access';
  return crypto
    .createHash('sha256')
    .update(salt + ipRaw)
    .digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    // ─── Parse + validate body ─────────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'invalid_json' },
        { status: 400 }
      );
    }

    const result = validateInput(body);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    const input = result.data;

    // ─── KVKK: hash IP, truncate user-agent ─────────────────────────────
    const ipRaw =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null;
    const ipHash = hashIp(ipRaw);
    const userAgent = (request.headers.get('user-agent') ?? '').slice(0, 200);

    // ─── Insert via admin client (RLS bypass for consistent error surface) ─
    let supabase;
    try {
      supabase = createAdminClient();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: 'admin_client_unavailable',
          hint: 'SUPABASE_SERVICE_ROLE_KEY missing on the server',
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('erken_erisim')
      .insert({
        ad: input.ad,
        email: input.email,
        ilgi: input.ilgi,
        not_metni: input.not_metni ?? null,
        source_page: input.source_page ?? null,
        ip_hash: ipHash,
        user_agent: userAgent,
      })
      .select('id')
      .single();

    if (error) {
      // Never leak .message — just the error code
      return NextResponse.json(
        {
          ok: false,
          error: 'db_error',
          code: error.code ?? 'unknown',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, id: data.id },
      { status: 200 }
    );
  } catch (err) {
    // Outer safety net
    console.error('[/api/early-access] error:', err);
    return NextResponse.json(
      {
        ok: false,
        error: 'server_error',
      },
      { status: 500 }
    );
  }
}
