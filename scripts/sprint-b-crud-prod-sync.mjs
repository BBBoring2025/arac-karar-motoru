#!/usr/bin/env node
/**
 * Sprint B — P8 Test 3 extended:
 * Proves that production /api/data-status reflects Supabase writes in real time.
 *
 * Timeline:
 *   1. Snapshot /api/data-status (expect mtv_tarifeleri.rowCount === 0)
 *   2. Insert test row via service role key
 *   3. Snapshot /api/data-status again (expect rowCount === 1)
 *   4. Delete test row
 *   5. Final snapshot (expect rowCount === 0 again)
 *
 * Writes delivery/sprint-b/api-responses/admin-crud-prod-sync.json
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const envText = readFileSync(resolve(projectRoot, '.env.local'), 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PROD_URL = 'https://arac-karar-motoru.vercel.app/api/data-status';

async function snapshotProd(label) {
  const res = await fetch(PROD_URL, { cache: 'no-store' });
  const json = await res.json();
  const mtv = (json.supabase?.tables ?? []).find((t) => t.name === 'mtv_tarifeleri');
  return {
    label,
    ts: new Date().toISOString(),
    http: res.status,
    mtv_rowCount: mtv?.rowCount ?? null,
    mtv_writable: mtv?.writable ?? null,
    alignmentWarning: json.alignmentWarning ? 'present' : 'missing',
  };
}

async function main() {
  const timeline = [];

  // 1. Before
  timeline.push({ step: 1, ...(await snapshotProd('before_seed')) });

  // 2. Insert test row
  const { data: seeded, error: seedErr } = await sb
    .from('mtv_tarifeleri')
    .insert({
      motor_hacmi_alt: 9999,
      motor_hacmi_ust: 9999,
      yas_alt: 99,
      yas_ust: 99,
      yakit_tipi: 'benzin',
      yillik_tutar: 9999.99,
      yil: 2026,
      kaynak: 'SPRINT_B_TEST_PROD_SYNC',
      updated_by: 'senalpserkan@gmail.com',
    })
    .select('id')
    .single();

  if (seedErr) {
    timeline.push({ step: 2, error: seedErr.code, message: seedErr.message });
    writeFileSync(
      resolve(projectRoot, 'delivery/sprint-b/api-responses/admin-crud-prod-sync.json'),
      JSON.stringify(timeline, null, 2),
    );
    return;
  }

  timeline.push({ step: 2, action: 'seed_ok', id: seeded.id });

  // Wait a moment for any cache to propagate (data-status is dynamic so should be instant)
  await new Promise((r) => setTimeout(r, 500));

  // 3. After seed
  timeline.push({ step: 3, ...(await snapshotProd('after_seed')) });

  // 4. Cleanup
  const { error: delErr } = await sb.from('mtv_tarifeleri').delete().eq('id', seeded.id);
  timeline.push({ step: 4, action: delErr ? 'delete_failed' : 'delete_ok', error: delErr?.code });

  await new Promise((r) => setTimeout(r, 500));

  // 5. After cleanup
  timeline.push({ step: 5, ...(await snapshotProd('after_cleanup')) });

  // Emit proof summary
  const beforeCount = timeline[0].mtv_rowCount;
  const afterSeedCount = timeline[2].mtv_rowCount;
  const afterCleanupCount = timeline[4].mtv_rowCount;

  const proof = {
    passed:
      beforeCount === 0 &&
      afterSeedCount === 1 &&
      afterCleanupCount === 0,
    beforeCount,
    afterSeedCount,
    afterCleanupCount,
    productionReflectsWrites: afterSeedCount === beforeCount + 1,
    productionReflectsDeletes: afterCleanupCount === beforeCount,
  };

  const result = { timeline, proof };

  writeFileSync(
    resolve(projectRoot, 'delivery/sprint-b/api-responses/admin-crud-prod-sync.json'),
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.name, message: err.message }));
  process.exit(1);
});
