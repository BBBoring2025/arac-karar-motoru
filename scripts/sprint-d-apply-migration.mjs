#!/usr/bin/env node
/**
 * Sprint D P2 — Apply migration 003_early_access.sql via Supabase REST.
 *
 * Used when Supabase MCP is offline. Reads SUPABASE_SERVICE_ROLE_KEY from
 * .env.local and executes the migration SQL via supabase-js.
 *
 * Run via: /usr/local/bin/node scripts/sprint-d-apply-migration.mjs
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const envPath = resolve(projectRoot, '.env.local');
const envText = readFileSync(envPath, 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq === -1) continue;
  env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(JSON.stringify({ error: 'missing_env' }));
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

async function main() {
  log({ step: 'init', message: 'Sprint D P2 migration apply' });

  // Check current state
  log({ step: 'check', message: 'Probing erken_erisim table' });
  const { error: probeError } = await sb
    .from('erken_erisim')
    .select('*', { count: 'exact', head: true });

  if (!probeError) {
    log({ step: 'check', result: 'table_already_exists' });
    // Verify it looks right
    const { data: testInsert, error: insertError } = await sb
      .from('erken_erisim')
      .insert({
        ad: 'Sprint D migration test',
        email: `migration-test-${Date.now()}@example.com`,
        ilgi: 'genel',
        not_metni: 'Sprint D migration apply smoke test',
        source_page: 'migration-script',
      })
      .select('id')
      .single();
    if (insertError) {
      log({ step: 'verify', error: insertError.code, message: insertError.message });
      process.exit(1);
    }
    log({ step: 'verify', inserted_id: testInsert.id });
    // Cleanup
    await sb.from('erken_erisim').delete().eq('id', testInsert.id);
    log({ step: 'cleanup', removed_id: testInsert.id });
    log({ step: 'done', result: 'table_ready' });
    return;
  }

  log({ step: 'check', error_code: probeError.code, message: 'Table does not exist, need to apply migration via dashboard' });
  log({
    step: 'manual_action_required',
    instructions:
      'Supabase MCP is offline. Copy supabase/migrations/003_early_access.sql and run it via https://supabase.com/dashboard/project/fyuxlmcugtdxuvjnzdtu/sql/new',
  });
  process.exit(1);
}

main().catch((err) => {
  log({ step: 'fatal', error: err.name, message: err.message });
  process.exit(1);
});
