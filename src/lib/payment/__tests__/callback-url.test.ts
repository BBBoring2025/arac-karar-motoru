/**
 * Sprint C P2 — getCallbackBaseUrl() unit tests
 *
 * Run via: npx tsx src/lib/payment/__tests__/callback-url.test.ts
 *
 * Pure function tests — manipulates process.env in-place.
 * Each test resets the env vars it touches.
 */

import {
  getCallbackBaseUrl,
  MissingCallbackBaseUrlError,
} from '../callback-url';

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

function snapshotEnv(): {
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_URL?: string;
  NODE_ENV?: string;
} {
  return {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    NODE_ENV: process.env.NODE_ENV,
  };
}

function restoreEnv(snap: ReturnType<typeof snapshotEnv>): void {
  if (snap.NEXT_PUBLIC_SITE_URL === undefined)
    delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = snap.NEXT_PUBLIC_SITE_URL;

  if (snap.VERCEL_URL === undefined) delete process.env.VERCEL_URL;
  else process.env.VERCEL_URL = snap.VERCEL_URL;

  if (snap.NODE_ENV === undefined)
    delete (process.env as Record<string, string | undefined>).NODE_ENV;
  else (process.env as Record<string, string>).NODE_ENV = snap.NODE_ENV;
}

console.log('\nSprint C P2 — callback-url.test.ts\n');

// ----------------------------------------------------------------------
// Fixture 1: NEXT_PUBLIC_SITE_URL set takes precedence
// ----------------------------------------------------------------------
{
  const snap = snapshotEnv();
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  process.env.VERCEL_URL = 'should-not-be-used.vercel.app';
  (process.env as Record<string, string>).NODE_ENV = 'production';

  console.log('Fixture 1: NEXT_PUBLIC_SITE_URL takes precedence');
  const url = getCallbackBaseUrl();
  assert(url === 'https://example.com', `expected https://example.com, got ${url}`);

  // Trailing slash stripped
  process.env.NEXT_PUBLIC_SITE_URL = 'https://trailing.example.com/';
  const stripped = getCallbackBaseUrl();
  assert(
    stripped === 'https://trailing.example.com',
    `expected trailing slash stripped, got ${stripped}`
  );

  restoreEnv(snap);
}

// ----------------------------------------------------------------------
// Fixture 2: only VERCEL_URL set → falls back to https://VERCEL_URL
// ----------------------------------------------------------------------
{
  const snap = snapshotEnv();
  delete process.env.NEXT_PUBLIC_SITE_URL;
  process.env.VERCEL_URL = 'arac-karar-motoru-abc123.vercel.app';
  (process.env as Record<string, string>).NODE_ENV = 'production';

  console.log('\nFixture 2: only VERCEL_URL set → https://${VERCEL_URL}');
  const url = getCallbackBaseUrl();
  assert(
    url === 'https://arac-karar-motoru-abc123.vercel.app',
    `expected https://arac-karar-motoru-abc123.vercel.app, got ${url}`
  );

  restoreEnv(snap);
}

// ----------------------------------------------------------------------
// Fixture 3: nothing set, NODE_ENV=development → localhost
// ----------------------------------------------------------------------
{
  const snap = snapshotEnv();
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_URL;
  (process.env as Record<string, string>).NODE_ENV = 'development';

  console.log('\nFixture 3: nothing set + dev mode → localhost');
  const url = getCallbackBaseUrl();
  assert(
    url === 'http://localhost:3000',
    `expected http://localhost:3000, got ${url}`
  );

  restoreEnv(snap);
}

// ----------------------------------------------------------------------
// Fixture 4: nothing set, NODE_ENV=production → throws
// ----------------------------------------------------------------------
{
  const snap = snapshotEnv();
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_URL;
  (process.env as Record<string, string>).NODE_ENV = 'production';

  console.log('\nFixture 4: nothing set + production → throws MissingCallbackBaseUrlError');
  let threw = false;
  let errorCode: string | undefined;
  let errorName: string | undefined;
  try {
    getCallbackBaseUrl();
  } catch (err) {
    threw = true;
    if (err instanceof MissingCallbackBaseUrlError) {
      errorCode = err.code;
      errorName = err.name;
    }
  }
  assert(threw, 'should throw');
  assert(
    errorCode === 'MISSING_CALLBACK_BASE_URL',
    `error code = MISSING_CALLBACK_BASE_URL, got ${errorCode}`
  );
  assert(
    errorName === 'MissingCallbackBaseUrlError',
    `error name = MissingCallbackBaseUrlError, got ${errorName}`
  );

  restoreEnv(snap);
}

// ----------------------------------------------------------------------
// Sprint B caveat smoke check: empty string is treated as missing
// ----------------------------------------------------------------------
{
  const snap = snapshotEnv();
  process.env.NEXT_PUBLIC_SITE_URL = '   '; // whitespace
  process.env.VERCEL_URL = 'fallback.vercel.app';
  (process.env as Record<string, string>).NODE_ENV = 'production';

  console.log('\nFixture 5: whitespace NEXT_PUBLIC_SITE_URL → falls back to VERCEL_URL');
  const url = getCallbackBaseUrl();
  assert(
    url === 'https://fallback.vercel.app',
    `whitespace should fall through to VERCEL_URL, got ${url}`
  );

  restoreEnv(snap);
}

console.log('\n==================================================');
console.log(`Sonuç: ${passed} geçti, ${failed} kaldı`);
if (failed > 0) process.exit(1);
