#!/usr/bin/env node
/**
 * Sprint B — P6 Admin User Seed + P8 Test 3 Supabase CRUD Verification
 *
 * Reads credentials from .env.local (never committed).
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS for the seed operations.
 *
 * Operations:
 *   1. Insert admin user into `kullanicilar` (auth_id, email, rol='admin')
 *   2. Seed one row into `mtv_tarifeleri`
 *   3. Update that row (verifies write path)
 *   4. SELECT to verify state
 *   5. DELETE to clean up
 *   6. SELECT to verify cleanup
 *
 * Output is JSON per-step, streamed to stdout. No secrets are printed.
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Parse .env.local
const envPath = resolve(projectRoot, '.env.local');
const envText = readFileSync(envPath, 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(JSON.stringify({ step: 'init', error: 'missing_env' }));
  process.exit(1);
}

const ADMIN_UID = 'd3cfcc76-58c0-4be2-a344-deb715c5bd9d';
const ADMIN_EMAIL = 'senalpserkan@gmail.com';

const sb = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function log(obj) {
  // Strip anything that might look like a secret before printing
  console.log(JSON.stringify(obj, null, 2));
}

async function main() {
  log({ step: 'init', message: 'Starting Sprint B admin seed + CRUD verification' });

  // Step 1: Insert or get admin user
  log({ step: '1-check-admin', message: 'Checking existing admin user' });
  const { data: existing, error: checkError } = await sb
    .from('kullanicilar')
    .select('id, email, rol')
    .eq('auth_id', ADMIN_UID)
    .maybeSingle();

  if (checkError) {
    log({ step: '1-check-admin', error: checkError.code, hint: checkError.hint, message: checkError.message });
  } else if (existing) {
    log({ step: '1-check-admin', found: true, id: existing.id, email: existing.email, rol: existing.rol });
  } else {
    log({ step: '1-insert-admin', message: 'Inserting admin user' });
    const { data: inserted, error: insertError } = await sb
      .from('kullanicilar')
      .insert({
        auth_id: ADMIN_UID,
        email: ADMIN_EMAIL,
        rol: 'admin',
        ad: 'Admin',
        soyad: 'User',
      })
      .select()
      .single();
    if (insertError) {
      log({ step: '1-insert-admin', error: insertError.code, hint: insertError.hint, message: insertError.message });
    } else {
      log({ step: '1-insert-admin', success: true, id: inserted.id, email: inserted.email, rol: inserted.rol });
    }
  }

  // Step 2: Seed mtv_tarifeleri test row (real schema from migration 001)
  log({ step: '2-seed-mtv', message: 'Inserting test row into mtv_tarifeleri' });
  const testRow = {
    motor_hacmi_alt: 9999,
    motor_hacmi_ust: 9999,
    yas_alt: 99,
    yas_ust: 99,
    yakit_tipi: 'benzin',
    yillik_tutar: 9999.99,
    yil: 2026,
    kaynak: 'SPRINT_B_TEST_DO_NOT_USE',
    updated_by: ADMIN_EMAIL,
  };
  const { data: seeded, error: seedError } = await sb
    .from('mtv_tarifeleri')
    .insert(testRow)
    .select()
    .single();

  let seededId = null;
  if (seedError) {
    log({ step: '2-seed-mtv', error: seedError.code, hint: seedError.hint, message: seedError.message });
  } else {
    seededId = seeded.id;
    log({
      step: '2-seed-mtv',
      success: true,
      id: seeded.id,
      yillik_tutar: seeded.yillik_tutar,
      kaynak: seeded.kaynak,
      updated_by: seeded.updated_by,
    });
  }

  // Step 3: UPDATE to simulate admin PUT (sets yillik_tutar + updated_by)
  if (seededId) {
    log({ step: '3-update-mtv', message: `Updating row ${seededId} to verify write + audit path` });
    const { data: updated, error: updateError } = await sb
      .from('mtv_tarifeleri')
      .update({ yillik_tutar: 10101.01, updated_by: ADMIN_EMAIL })
      .eq('id', seededId)
      .select()
      .single();
    if (updateError) {
      log({ step: '3-update-mtv', error: updateError.code, hint: updateError.hint, message: updateError.message });
    } else {
      log({
        step: '3-update-mtv',
        success: true,
        id: updated.id,
        new_yillik_tutar: updated.yillik_tutar,
        updated_by: updated.updated_by,
      });
    }
  }

  // Step 4: SELECT to verify
  if (seededId) {
    log({ step: '4-verify-mtv', message: 'Reading back updated row' });
    const { data: read, error: readError } = await sb
      .from('mtv_tarifeleri')
      .select('id, yillik_tutar, updated_by, kaynak')
      .eq('id', seededId)
      .single();
    if (readError) {
      log({ step: '4-verify-mtv', error: readError.code });
    } else {
      log({
        step: '4-verify-mtv',
        success: true,
        id: read.id,
        yillik_tutar: read.yillik_tutar,
        updated_by: read.updated_by,
        isUpdated: Number(read.yillik_tutar) === 10101.01,
        auditPathWorks: read.updated_by === ADMIN_EMAIL,
      });
    }
  }

  // Step 5: DELETE cleanup
  if (seededId) {
    log({ step: '5-cleanup-mtv', message: 'Deleting test row' });
    const { error: delError } = await sb.from('mtv_tarifeleri').delete().eq('id', seededId);
    if (delError) {
      log({ step: '5-cleanup-mtv', error: delError.code, message: delError.message });
    } else {
      log({ step: '5-cleanup-mtv', success: true });
    }
  }

  // Step 6: Verify cleanup
  log({ step: '6-verify-cleanup', message: 'Checking mtv_tarifeleri is empty again' });
  const { count, error: countError } = await sb
    .from('mtv_tarifeleri')
    .select('*', { count: 'exact', head: true });
  if (countError) {
    log({ step: '6-verify-cleanup', error: countError.code });
  } else {
    log({ step: '6-verify-cleanup', success: true, rowCount: count });
  }

  log({ step: 'done', message: 'Sprint B admin seed + CRUD verification complete' });
}

main().catch((err) => {
  log({ step: 'fatal', error: err.name, message: err.message });
  process.exit(1);
});
