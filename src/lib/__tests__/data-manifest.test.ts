/**
 * Sprint C P5 — data-manifest.test.ts
 *
 * Run via: npx tsx src/lib/__tests__/data-manifest.test.ts
 *
 * Drift detection: each manifest entry must have non-empty source metadata,
 * a valid confidence enum value, an itemCount > 0, and a filePath that
 * actually exists on disk.
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  dataManifest,
  getAllManifestEntries,
  getManifestEntry,
  DATA_MANIFEST_KEYS,
  computeStaleness,
  getStaleEntries,
  type DataManifestKey,
} from '../data-manifest';

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

const VALID_CONFIDENCE = ['kesin', 'yüksek', 'yaklaşık', 'tahmini'];
const PROJECT_ROOT = resolve(__dirname, '..', '..', '..');

console.log('\nSprint C P5 — data-manifest.test.ts\n');

// 1. Manifest has exactly 8 entries
console.log('Manifest size');
assert(
  Object.keys(dataManifest).length === 8,
  `dataManifest has 8 entries (got ${Object.keys(dataManifest).length})`
);
assert(
  DATA_MANIFEST_KEYS.length === 8,
  `DATA_MANIFEST_KEYS has 8 keys (got ${DATA_MANIFEST_KEYS.length})`
);
assert(
  getAllManifestEntries().length === 8,
  `getAllManifestEntries returns 8 (got ${getAllManifestEntries().length})`
);

// 2. Each key in DATA_MANIFEST_KEYS resolves via getManifestEntry
console.log('\nKey resolution');
for (const key of DATA_MANIFEST_KEYS) {
  const entry = getManifestEntry(key);
  assert(entry.key === key, `getManifestEntry("${key}").key === "${key}"`);
}

// 3. Each entry has non-empty source metadata
console.log('\nMetadata completeness per entry');
for (const entry of getAllManifestEntries()) {
  assert(
    entry.label.length > 0,
    `${entry.key}.label non-empty`
  );
  assert(
    entry.sourceLabel.length > 0,
    `${entry.key}.sourceLabel non-empty`
  );
  assert(
    entry.sourceUrl.length > 0 && entry.sourceUrl.startsWith('http'),
    `${entry.key}.sourceUrl is a URL`
  );
  assert(
    /^\d{4}-\d{2}-\d{2}$/.test(entry.effectiveDate),
    `${entry.key}.effectiveDate is ISO YYYY-MM-DD (got "${entry.effectiveDate}")`
  );
  assert(
    /^\d{4}-\d{2}-\d{2}$/.test(entry.lastUpdated),
    `${entry.key}.lastUpdated is ISO YYYY-MM-DD (got "${entry.lastUpdated}")`
  );
  assert(
    VALID_CONFIDENCE.includes(entry.confidence),
    `${entry.key}.confidence is one of ${VALID_CONFIDENCE.join('|')} (got "${entry.confidence}")`
  );
  assert(
    entry.itemCount > 0,
    `${entry.key}.itemCount > 0 (got ${entry.itemCount})`
  );
  assert(
    entry.runbookAnchor.startsWith('#'),
    `${entry.key}.runbookAnchor starts with # (got "${entry.runbookAnchor}")`
  );
}

// 4. Each filePath exists on disk
console.log('\nFile path existence');
for (const entry of getAllManifestEntries()) {
  const fullPath = resolve(PROJECT_ROOT, entry.filePath);
  assert(
    existsSync(fullPath),
    `${entry.key}.filePath exists on disk (${entry.filePath})`
  );
}

// 5. getManifestEntry throws on unknown key
console.log('\nError handling');
let threw = false;
try {
  getManifestEntry('unknown' as DataManifestKey);
} catch {
  threw = true;
}
assert(threw, 'getManifestEntry("unknown") throws');

// ═════════════════════════════════════════════════════════════════════
// Sprint D P8 — Refresh cadence + staleness (25+ assertions)
// ═════════════════════════════════════════════════════════════════════

const VALID_CADENCES = [
  'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'on-publication',
];

// 6. Every entry has a valid refreshCadence
console.log('\nSprint D P8 — refreshCadence per entry');
for (const entry of getAllManifestEntries()) {
  assert(
    VALID_CADENCES.includes(entry.refreshCadence),
    `${entry.key}.refreshCadence is valid (got "${entry.refreshCadence}")`
  );
  assert(
    typeof entry.stale === 'boolean',
    `${entry.key}.stale is boolean (got ${typeof entry.stale})`
  );
  assert(
    typeof entry.daysSinceUpdate === 'number' && entry.daysSinceUpdate >= 0,
    `${entry.key}.daysSinceUpdate is non-negative number`
  );
  assert(
    typeof entry.maxDaysForCadence === 'number',
    `${entry.key}.maxDaysForCadence is number`
  );
}

// 7. Computed stale matches (daysSinceUpdate > maxDaysForCadence) rule
console.log('\nSprint D P8 — stale consistency');
for (const entry of getAllManifestEntries()) {
  const expected = entry.maxDaysForCadence === -1
    ? false // on-publication = never stale
    : entry.daysSinceUpdate > entry.maxDaysForCadence;
  assert(
    entry.stale === expected,
    `${entry.key}.stale === (daysSinceUpdate > maxDaysForCadence) (stale=${entry.stale}, days=${entry.daysSinceUpdate}, max=${entry.maxDaysForCadence})`
  );
}

// 8. Deterministic staleness — pin clock
console.log('\nSprint D P8 — computeStaleness deterministic');
{
  // Case 1: yakit, 2026-01-15, monthly, now=2026-04-09 → 84 days, max 35 → STALE
  const yakit = computeStaleness(
    '2026-01-15',
    'monthly',
    new Date('2026-04-09T12:00:00Z')
  );
  assert(
    yakit.daysSinceUpdate === 84,
    `yakit 2026-01-15 → 2026-04-09 = 84 days (got ${yakit.daysSinceUpdate})`
  );
  assert(yakit.stale === true, 'yakit monthly cadence at 84 days → stale');
  assert(
    yakit.maxDaysForCadence === 35,
    `monthly max = 35 (got ${yakit.maxDaysForCadence})`
  );

  // Case 2: fresh entry, 5 days old, weekly, not stale
  const fresh = computeStaleness(
    '2026-04-04',
    'weekly',
    new Date('2026-04-09T12:00:00Z')
  );
  assert(fresh.stale === false, 'weekly at 5 days → not stale');
  assert(fresh.daysSinceUpdate === 5, `5 days (got ${fresh.daysSinceUpdate})`);

  // Case 3: 100 days + monthly → stale
  const old = computeStaleness(
    '2026-01-01',
    'monthly',
    new Date('2026-04-11T00:00:00Z')
  );
  assert(old.stale === true, 'monthly at 100 days → stale');

  // Case 4: on-publication never stales
  const neverStale = computeStaleness(
    '2024-01-01',
    'on-publication',
    new Date('2026-04-09T00:00:00Z')
  );
  assert(neverStale.stale === false, 'on-publication never stales');
  assert(
    neverStale.maxDaysForCadence === -1,
    'on-publication max = -1 (sentinel)'
  );
}

// 9. getStaleEntries() sanity (yakit must be stale as of "today")
console.log('\nSprint D P8 — getStaleEntries() runtime check');
{
  const stale = getStaleEntries();
  assert(
    stale.length >= 1,
    `at least 1 stale entry (got ${stale.length})`
  );
  const yakitEntry = stale.find((e) => e.key === 'yakit');
  assert(
    yakitEntry !== undefined,
    `yakit is in getStaleEntries() (runtime — depends on "now")`
  );
  if (yakitEntry) {
    assert(
      yakitEntry.refreshCadence === 'monthly',
      `yakit.refreshCadence === 'monthly'`
    );
  }
}

console.log('\n==================================================');
console.log(`Sonuç: ${passed} geçti, ${failed} kaldı`);
if (failed > 0) process.exit(1);
