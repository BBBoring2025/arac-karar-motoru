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

console.log('\n==================================================');
console.log(`Sonuç: ${passed} geçti, ${failed} kaldı`);
if (failed > 0) process.exit(1);
