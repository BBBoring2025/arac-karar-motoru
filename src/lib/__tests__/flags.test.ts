/**
 * Sprint D P1 — flags.test.ts
 *
 * Run via: npx tsx src/lib/__tests__/flags.test.ts
 *
 * Tests the publicBetaMode flag (Sprint D P1) + the Plausible analytics
 * env-var detection (Sprint D P7). The existing Sprint B/C flag tests are
 * not in a file yet — this is the first dedicated flags.test.ts.
 */

import {
  getServerFlags,
  getClientFlags,
  flagsToPublicJSON,
  type Flags,
} from '../flags';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    failed++;
  }
}

function snapshot() {
  return {
    PUBLIC_BETA_MODE: process.env.PUBLIC_BETA_MODE,
    NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    IYZICO_API_KEY: process.env.IYZICO_API_KEY,
    IYZICO_SECRET_KEY: process.env.IYZICO_SECRET_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function restore(snap: ReturnType<typeof snapshot>): void {
  for (const [k, v] of Object.entries(snap)) {
    if (v === undefined) {
      delete (process.env as Record<string, string | undefined>)[k];
    } else {
      (process.env as Record<string, string>)[k] = v;
    }
  }
}

function unsetAll(): void {
  delete process.env.PUBLIC_BETA_MODE;
  delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
}

console.log('\nSprint D P1 — flags.test.ts\n');

// ─────────────────────────────────────────────────────────────────────
// publicBetaMode: 4 fixtures
// ─────────────────────────────────────────────────────────────────────
{
  const snap = snapshot();

  console.log('publicBetaMode — default TRUE when env missing');
  unsetAll();
  let flags: Flags = getServerFlags();
  assert(
    flags.publicBetaMode.enabled === true,
    'env missing → enabled=true (fail-safe default)'
  );
  assert(
    flags.publicBetaMode.reason === 'ok',
    `reason=ok (got ${flags.publicBetaMode.reason})`
  );

  console.log('\npublicBetaMode — explicit "true" → enabled');
  process.env.PUBLIC_BETA_MODE = 'true';
  flags = getServerFlags();
  assert(
    flags.publicBetaMode.enabled === true,
    'PUBLIC_BETA_MODE=true → enabled=true'
  );

  console.log('\npublicBetaMode — explicit "false" → disabled');
  process.env.PUBLIC_BETA_MODE = 'false';
  flags = getServerFlags();
  assert(
    flags.publicBetaMode.enabled === false,
    'PUBLIC_BETA_MODE=false → enabled=false'
  );
  assert(
    flags.publicBetaMode.reason === 'disabled_by_flag',
    'reason=disabled_by_flag'
  );

  console.log('\npublicBetaMode — "0" string → still enabled (fail-safe)');
  process.env.PUBLIC_BETA_MODE = '0';
  flags = getServerFlags();
  assert(
    flags.publicBetaMode.enabled === true,
    'PUBLIC_BETA_MODE="0" → enabled=true (only literal "false" disables)'
  );

  restore(snap);
}

// ─────────────────────────────────────────────────────────────────────
// flagsToPublicJSON round-trip: 4 fixtures
// ─────────────────────────────────────────────────────────────────────
{
  const snap = snapshot();
  unsetAll();

  console.log('\nflagsToPublicJSON — strips missingVars');
  const flags = getServerFlags();
  const publicJson = flagsToPublicJSON(flags);

  assert(
    !('missingVars' in publicJson.paymentEnabled),
    'publicJson.paymentEnabled has no missingVars'
  );
  assert(
    !('missingVars' in publicJson.analyticsEnabled),
    'publicJson.analyticsEnabled has no missingVars'
  );
  assert(
    'publicBetaMode' in publicJson,
    'publicJson includes publicBetaMode key'
  );
  assert(
    publicJson.publicBetaMode.enabled === true,
    'publicJson.publicBetaMode.enabled === true (fail-safe default)'
  );

  restore(snap);
}

// ─────────────────────────────────────────────────────────────────────
// analyticsEnabled (Sprint D P7 addition): 4 fixtures
// ─────────────────────────────────────────────────────────────────────
{
  const snap = snapshot();

  console.log('\nanalyticsEnabled — no env → missing_env');
  unsetAll();
  let flags = getServerFlags();
  assert(
    flags.analyticsEnabled.enabled === false,
    'no env → enabled=false'
  );
  assert(
    flags.analyticsEnabled.reason === 'missing_env',
    `reason=missing_env (got ${flags.analyticsEnabled.reason})`
  );
  assert(
    flags.analyticsEnabled.missingVars?.includes('NEXT_PUBLIC_PLAUSIBLE_DOMAIN') === true,
    'missingVars includes NEXT_PUBLIC_PLAUSIBLE_DOMAIN'
  );

  console.log('\nanalyticsEnabled — env set → ok');
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'arac-karar-motoru.vercel.app';
  flags = getServerFlags();
  assert(
    flags.analyticsEnabled.enabled === true,
    'NEXT_PUBLIC_PLAUSIBLE_DOMAIN set → enabled=true'
  );

  console.log('\nanalyticsEnabled — whitespace env → treated as missing');
  process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = '   ';
  flags = getServerFlags();
  assert(
    flags.analyticsEnabled.enabled === false,
    'whitespace env → enabled=false'
  );
  assert(
    flags.analyticsEnabled.reason === 'missing_env',
    'whitespace env → reason=missing_env'
  );

  restore(snap);
}

// ─────────────────────────────────────────────────────────────────────
// getClientFlags has publicBetaMode in shape
// ─────────────────────────────────────────────────────────────────────
{
  console.log('\ngetClientFlags — contains publicBetaMode key');
  const client = getClientFlags({});
  assert(
    'publicBetaMode' in client,
    'client flags have publicBetaMode key'
  );
  assert(
    client.publicBetaMode.enabled === true,
    'client default fail-safe = true'
  );
  assert(
    client.publicBetaMode.reason === 'unknown',
    'client reason=unknown (must fetch /api/health for truth)'
  );
}

console.log('\n==================================================');
console.log(`Sonuç: ${passed} geçti, ${failed} kaldı`);
if (failed > 0) process.exit(1);
