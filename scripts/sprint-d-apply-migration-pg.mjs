#!/usr/bin/env node
/**
 * Sprint D P2 — Apply migration via direct Postgres connection
 * (Supabase MCP is offline, supabase-js cannot execute DDL).
 *
 * Uses pg package (installed --no-save for this script only).
 * Connects via Supabase's pooler URL:
 *   postgresql://postgres.<ref>:<password>@<region>.pooler.supabase.com:5432/postgres
 *
 * But we don't have the pooler URL or db password in .env.local. Instead,
 * we have SUPABASE_SERVICE_ROLE_KEY which is a JWT — NOT a db password.
 *
 * So we construct the direct connection via:
 *   postgres://postgres:<service_role_as_password>@db.<ref>.supabase.co:5432/postgres
 * Wait — that's not right either. service_role is a JWT.
 *
 * Actually Supabase gives you a direct db connection string in the dashboard
 * under Database → Connection String → URI. Without it, we can only use
 * the REST API via supabase-js.
 *
 * Fallback plan: use supabase.rpc('sql', ...) if a custom function exists,
 * OR issue the migration via the admin dashboard manually.
 *
 * CORRECT FALLBACK: use the Supabase Management API which DOES accept
 * raw SQL via POST /v1/projects/{ref}/database/query but requires a
 * personal access token (SUPABASE_ACCESS_TOKEN), not the service_role key.
 *
 * Without that token we have to go via the dashboard.
 *
 * This script documents the limitation and tries one more thing: use
 * pg's connection string from SUPABASE_DB_URL if it happens to be in env.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

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
const dbUrl = env.SUPABASE_DB_URL;
const dbPassword = env.SUPABASE_DB_PASSWORD;

function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

async function main() {
  log({ step: 'init', supabase_url: url });

  if (!dbUrl && !dbPassword) {
    log({
      step: 'missing_connection_info',
      message:
        'Need either SUPABASE_DB_URL or SUPABASE_DB_PASSWORD in .env.local. ' +
        'Get it from Supabase Dashboard → Settings → Database → Connection String.',
    });
    log({
      step: 'fallback',
      message: 'Apply via dashboard: https://supabase.com/dashboard/project/fyuxlmcugtdxuvjnzdtu/sql/new',
      sql_file: 'supabase/migrations/003_early_access.sql',
    });
    process.exit(1);
  }

  // Construct connection string
  // Supabase pooler: postgres://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
  // Direct: postgres://postgres:<password>@db.<ref>.supabase.co:5432/postgres

  const projectRef = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    log({ step: 'fatal', error: 'cannot_parse_project_ref' });
    process.exit(1);
  }

  const connectionString =
    dbUrl ?? `postgres://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

  log({ step: 'connecting', host: `db.${projectRef}.supabase.co` });
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  log({ step: 'connected' });

  // Read migration SQL
  const migrationPath = resolve(
    projectRoot,
    'supabase/migrations/003_early_access.sql'
  );
  const sql = readFileSync(migrationPath, 'utf8');
  log({ step: 'migration_loaded', length: sql.length });

  // Execute
  try {
    await client.query(sql);
    log({ step: 'migration_applied', result: 'success' });
  } catch (err) {
    log({ step: 'migration_error', error: err.code, message: err.message });
    await client.end();
    process.exit(1);
  }

  // Verify
  const res = await client.query(
    "SELECT COUNT(*) as count FROM erken_erisim"
  );
  log({ step: 'verify', row_count: res.rows[0].count });

  // Smoke test insert + delete
  const insertRes = await client.query(
    `INSERT INTO erken_erisim (ad, email, ilgi, not_metni, source_page, ip_hash, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      'Sprint D migration test',
      `migration-${Date.now()}@example.com`,
      'genel',
      'Sprint D smoke test',
      'migration-script',
      'sha256:test',
      'node/migration-script',
    ]
  );
  const insertedId = insertRes.rows[0].id;
  log({ step: 'smoke_insert', id: insertedId });
  await client.query('DELETE FROM erken_erisim WHERE id = $1', [insertedId]);
  log({ step: 'smoke_cleanup', id: insertedId });

  await client.end();
  log({ step: 'done', result: 'migration_applied_and_verified' });
}

main().catch((err) => {
  log({ step: 'fatal', error: err.name, message: err.message });
  process.exit(1);
});
