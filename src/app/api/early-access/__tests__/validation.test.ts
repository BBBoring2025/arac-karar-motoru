/**
 * Sprint D P3 — Validation unit tests for /api/early-access
 *
 * Run via: npx tsx src/app/api/early-access/__tests__/validation.test.ts
 *
 * Pure-function tests. No I/O, no Supabase, no crypto. The route handler
 * uses these + adds the IP hash + user agent + DB insert on top.
 */

import { validateInput, VALID_ILGI } from '../validation';

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

console.log('\nSprint D P3 — /api/early-access validation.test.ts\n');

// ────────────────────────────────────────────────────────────────────
// Null / undefined / wrong shape
// ────────────────────────────────────────────────────────────────────
console.log('Non-object inputs');
{
  let r = validateInput(null);
  assert(!r.ok && r.error === 'missing_ad', 'null → missing_ad');

  r = validateInput(undefined);
  assert(!r.ok && r.error === 'missing_ad', 'undefined → missing_ad');

  r = validateInput('string');
  assert(!r.ok && r.error === 'missing_ad', 'string → missing_ad');

  r = validateInput([]);
  // Arrays are objects in JS but have no ad field — will fail missing_ad
  assert(!r.ok && r.error === 'missing_ad', 'array → missing_ad');
}

// ────────────────────────────────────────────────────────────────────
// ad field
// ────────────────────────────────────────────────────────────────────
console.log('\nad field');
{
  let r = validateInput({
    ad: 'A', // too short
    email: 'test@example.com',
    ilgi: 'tekli',
  });
  assert(!r.ok && r.error === 'ad_too_short', 'ad="A" → ad_too_short');

  r = validateInput({
    ad: '', // empty
    email: 'test@example.com',
    ilgi: 'tekli',
  });
  assert(!r.ok && r.error === 'missing_ad', 'ad="" → missing_ad');

  r = validateInput({
    ad: '   ', // whitespace
    email: 'test@example.com',
    ilgi: 'tekli',
  });
  assert(!r.ok && r.error === 'missing_ad', 'ad="   " → missing_ad');

  r = validateInput({
    ad: 'x'.repeat(101), // too long
    email: 'test@example.com',
    ilgi: 'tekli',
  });
  assert(!r.ok && r.error === 'ad_too_long', 'ad 101 chars → ad_too_long');

  r = validateInput({
    ad: 'Ali Veli',
    email: 'test@example.com',
    ilgi: 'tekli',
  });
  assert(r.ok && r.data.ad === 'Ali Veli', 'valid ad trimmed');
}

// ────────────────────────────────────────────────────────────────────
// email field
// ────────────────────────────────────────────────────────────────────
console.log('\nemail field');
{
  let r = validateInput({
    ad: 'Ali',
    email: 'notanemail',
    ilgi: 'tekli',
  });
  assert(!r.ok && r.error === 'invalid_email', '"notanemail" → invalid_email');

  r = validateInput({
    ad: 'Ali',
    email: 'test @example.com', // space
    ilgi: 'tekli',
  });
  assert(
    !r.ok && r.error === 'invalid_email',
    'email with space → invalid_email'
  );

  r = validateInput({
    ad: 'Ali',
    email: 'test@noext',
    ilgi: 'tekli',
  });
  assert(!r.ok && r.error === 'invalid_email', 'no TLD → invalid_email');

  r = validateInput({
    ad: 'Ali',
    email: '',
    ilgi: 'tekli',
  });
  assert(!r.ok && r.error === 'missing_email', 'empty email → missing_email');

  r = validateInput({
    ad: 'Ali',
    email: 'TEST@Example.COM', // should lowercase
    ilgi: 'tekli',
  });
  assert(
    r.ok && r.data.email === 'test@example.com',
    'email lowercased + trimmed'
  );
}

// ────────────────────────────────────────────────────────────────────
// ilgi field
// ────────────────────────────────────────────────────────────────────
console.log('\nilgi field');
{
  let r = validateInput({
    ad: 'Ali',
    email: 'a@b.co',
    ilgi: 'notreal',
  });
  assert(!r.ok && r.error === 'invalid_ilgi', 'invalid ilgi enum');

  r = validateInput({
    ad: 'Ali',
    email: 'a@b.co',
    ilgi: '',
  });
  assert(!r.ok && r.error === 'missing_ilgi', 'empty ilgi');

  // All valid enums
  for (const ilgi of VALID_ILGI) {
    r = validateInput({ ad: 'Ali', email: 'a@b.co', ilgi });
    assert(r.ok && r.data.ilgi === ilgi, `valid ilgi "${ilgi}"`);
  }
}

// ────────────────────────────────────────────────────────────────────
// not_metni (optional)
// ────────────────────────────────────────────────────────────────────
console.log('\nnot_metni (optional)');
{
  let r = validateInput({
    ad: 'Ali',
    email: 'a@b.co',
    ilgi: 'tekli',
    not_metni: 'x'.repeat(1001),
  });
  assert(!r.ok && r.error === 'note_too_long', '1001 chars → too long');

  r = validateInput({
    ad: 'Ali',
    email: 'a@b.co',
    ilgi: 'tekli',
    not_metni: 'Detaylı bilgi istiyorum',
  });
  assert(
    r.ok && r.data.not_metni === 'Detaylı bilgi istiyorum',
    'valid note'
  );

  r = validateInput({
    ad: 'Ali',
    email: 'a@b.co',
    ilgi: 'tekli',
    not_metni: undefined,
  });
  assert(
    r.ok && r.data.not_metni === undefined,
    'undefined note → undefined in output'
  );
}

// ────────────────────────────────────────────────────────────────────
// source_page (optional)
// ────────────────────────────────────────────────────────────────────
console.log('\nsource_page (optional)');
{
  let r = validateInput({
    ad: 'Ali',
    email: 'a@b.co',
    ilgi: 'tekli',
    source_page: 'odeme',
  });
  assert(r.ok && r.data.source_page === 'odeme', 'valid source_page');

  r = validateInput({
    ad: 'Ali',
    email: 'a@b.co',
    ilgi: 'tekli',
    source_page: 'x'.repeat(201),
  });
  assert(
    !r.ok && r.error === 'source_page_too_long',
    '201 chars source_page → too long'
  );
}

// ────────────────────────────────────────────────────────────────────
// Full valid payload
// ────────────────────────────────────────────────────────────────────
console.log('\nFull valid payload');
{
  const r = validateInput({
    ad: '  Sprint D Test  ',
    email: ' sprint-d@example.com ',
    ilgi: 'tekli',
    not_metni: '  Test note  ',
    source_page: 'odeme',
  });
  assert(r.ok, 'full payload valid');
  if (r.ok) {
    assert(r.data.ad === 'Sprint D Test', 'ad trimmed');
    assert(r.data.email === 'sprint-d@example.com', 'email trimmed + lowercased');
    assert(r.data.ilgi === 'tekli', 'ilgi preserved');
    assert(r.data.not_metni === 'Test note', 'not_metni trimmed');
    assert(r.data.source_page === 'odeme', 'source_page preserved');
  }
}

console.log('\n==================================================');
console.log(`Sonuç: ${passed} geçti, ${failed} kaldı`);
if (failed > 0) process.exit(1);
