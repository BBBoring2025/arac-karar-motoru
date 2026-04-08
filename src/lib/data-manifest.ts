/**
 * Sprint C P5 — Data Manifest Layer
 *
 * Single typed source of truth for "what data files we have, where they
 * come from, and how confident we are in each one." All consumers (admin
 * UI, public footer, /api/data-status, runbook) read from this manifest
 * instead of crawling individual `src/data/*.ts` files.
 *
 * The actual data is still bundled into the build via the underlying
 * `src/data/*.ts` modules. This manifest just normalizes the metadata.
 *
 * ADR-001 binds `src/data` as the source of truth for tariffs.
 * See `docs/adr/0001-src-data-as-source-of-truth.md`.
 */

import type { DataConfidence } from '@/lib/types';

import { mtvData } from '@/data/mtv';
import { inspectionData } from '@/data/muayene';
import { fuelData } from '@/data/yakit';
import { tollData } from '@/data/otoyol';
import { vehicleDatabase } from '@/data/araclar';
import { noterData } from '@/data/noter';
import { amortismanData } from '@/data/amortisman';
import { tollSegments } from '@/data/routes/toll-segments';

export type DataManifestKey =
  | 'mtv'
  | 'muayene'
  | 'yakit'
  | 'otoyol-routes'
  | 'otoyol-segments'
  | 'araclar'
  | 'noter'
  | 'amortisman';

/**
 * Sprint D P8 — how often each data family is expected to be refreshed.
 * Drives the `stale` boolean on each manifest entry.
 */
export type RefreshCadence =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'on-publication';

/**
 * Sprint D P8 — maximum allowed days between updates, per cadence.
 * A data entry is `stale` if `daysSinceUpdate > maxDaysForCadence`.
 * `on-publication` has no upper bound (used for sources that update irregularly).
 */
const CADENCE_MAX_DAYS: Record<RefreshCadence, number> = {
  daily: 2,
  weekly: 10,
  monthly: 35,
  quarterly: 100,
  yearly: 380,
  'on-publication': Number.POSITIVE_INFINITY,
};

export interface DataManifestEntry {
  /** Manifest key (also used as URL anchor in the runbook) */
  key: DataManifestKey;
  /** Human-readable label shown in admin UI + public footer */
  label: string;
  /** Source organization or document, e.g. "GİB 2026 MTV Tebliği" */
  sourceLabel: string;
  /** Canonical URL for the source (verifiable) */
  sourceUrl: string;
  /** Date the values come into effect (ISO 8601) */
  effectiveDate: string;
  /** Date the data file was last touched (ISO 8601) */
  lastUpdated: string;
  /** Confidence level (kesin / yüksek / yaklaşık / tahmini) */
  confidence: DataConfidence;
  /** Optional notes about the data */
  notes?: string;
  /** Path to the canonical TS file (for the editorial workflow) */
  filePath: string;
  /** Number of items in the data file (for sanity checking) */
  itemCount: number;
  /** Anchor in docs/data-update-runbook.md */
  runbookAnchor: string;

  // ─── Sprint D P8: freshness fields ─────────────────────────────────────
  /** Expected refresh cadence (drives stale detection) */
  refreshCadence: RefreshCadence;
  /** Computed at module init: true if now - lastUpdated > cadence threshold */
  stale: boolean;
  /** Computed: how many days since lastUpdated (floor) */
  daysSinceUpdate: number;
  /**
   * Computed: max allowed days for the cadence.
   * −1 means unbounded (on-publication cadence).
   */
  maxDaysForCadence: number;
}

/**
 * Sprint D P8 — Pure staleness computation.
 *
 * `now` is injectable so tests can pin the clock for deterministic assertions.
 * Production callers omit it; it defaults to `new Date()`.
 */
export function computeStaleness(
  lastUpdated: string,
  cadence: RefreshCadence,
  now: Date = new Date()
): { stale: boolean; daysSinceUpdate: number; maxDaysForCadence: number } {
  const updated = new Date(lastUpdated);
  const daysSinceUpdate = Math.floor(
    (now.getTime() - updated.getTime()) / 86_400_000
  );
  const max = CADENCE_MAX_DAYS[cadence];
  return {
    stale: daysSinceUpdate > max,
    daysSinceUpdate,
    maxDaysForCadence: max === Number.POSITIVE_INFINITY ? -1 : max,
  };
}

/**
 * Sprint D P8 — Internal helper. Builds an entry from its base fields
 * and computes the staleness-related fields at module init time.
 */
type ManifestEntryInput = Omit<
  DataManifestEntry,
  'stale' | 'daysSinceUpdate' | 'maxDaysForCadence'
>;

function buildEntry(input: ManifestEntryInput): DataManifestEntry {
  const { stale, daysSinceUpdate, maxDaysForCadence } = computeStaleness(
    input.lastUpdated,
    input.refreshCadence
  );
  return {
    ...input,
    stale,
    daysSinceUpdate,
    maxDaysForCadence,
  };
}

/**
 * Compute item count for each data type using the underlying TS module.
 * Lazy: each entry knows how to count its own items so the manifest stays
 * decoupled from the schema differences across data files.
 */
function mtvItemCount(): number {
  return (
    mtvData.gasoline.length +
    mtvData.diesel.length +
    mtvData.lpg.length +
    (mtvData.hybrid?.length ?? 0) +
    (mtvData.electric ? 1 : 0)
  );
}

function muayeneItemCount(): number {
  return inspectionData.vehicleTypes.length;
}

function fuelItemCount(): number {
  return fuelData.fuelTypes.length;
}

function tollRoutesItemCount(): number {
  return tollData.routes.length;
}

function tollSegmentsItemCount(): number {
  return tollSegments.length;
}

function araclarItemCount(): number {
  return vehicleDatabase.vehicles.length;
}

function noterItemCount(): number {
  return noterData.services.length;
}

function amortismanItemCount(): number {
  return amortismanData.segments.length;
}

/**
 * The manifest itself. Hand-coded once. Each entry pulls source label,
 * URL, dates, and confidence from the underlying data file at module-init
 * time. The data files own their own truth; the manifest normalizes the
 * shape so consumers don't have to crawl them.
 *
 * Sprint D P8 — each entry is wrapped with `buildEntry()` which computes
 * the `stale`, `daysSinceUpdate`, and `maxDaysForCadence` fields from the
 * `lastUpdated` + `refreshCadence` pair.
 */
export const dataManifest: Record<DataManifestKey, DataManifestEntry> = {
  mtv: buildEntry({
    key: 'mtv',
    label: 'MTV Tarifeleri',
    sourceLabel: mtvData.sourceLabel,
    sourceUrl: mtvData.sourceUrl,
    effectiveDate: mtvData.effectiveDate,
    lastUpdated: mtvData.lastUpdated,
    confidence: mtvData.confidence as DataConfidence,
    notes: undefined,
    filePath: 'src/data/mtv.ts',
    itemCount: mtvItemCount(),
    runbookAnchor: '#mtv',
    // GİB annual tariff → yearly cadence
    refreshCadence: 'yearly',
  }),
  muayene: buildEntry({
    key: 'muayene',
    label: 'Muayene Ücretleri',
    sourceLabel: inspectionData.sourceLabel,
    sourceUrl: inspectionData.sourceUrl,
    effectiveDate: inspectionData.effectiveDate,
    lastUpdated: inspectionData.lastUpdated,
    confidence: inspectionData.confidence as DataConfidence,
    notes: undefined,
    filePath: 'src/data/muayene.ts',
    itemCount: muayeneItemCount(),
    runbookAnchor: '#muayene',
    // TÜVTÜRK annual tariff → yearly cadence
    refreshCadence: 'yearly',
  }),
  yakit: buildEntry({
    key: 'yakit',
    label: 'Yakıt Fiyatları',
    sourceLabel: fuelData.sourceLabel,
    sourceUrl: fuelData.sourceUrl,
    effectiveDate: fuelData.effectiveDate,
    lastUpdated: fuelData.lastUpdated,
    confidence: fuelData.confidence as DataConfidence,
    notes: fuelData.notes,
    filePath: 'src/data/yakit.ts',
    itemCount: fuelItemCount(),
    runbookAnchor: '#yakit',
    // PETDER prices fluctuate continuously → monthly cadence (the runbook
    // target). Yakıt IS stale as of 2026-04-09 because lastUpdated=2026-01-15.
    refreshCadence: 'monthly',
  }),
  'otoyol-routes': buildEntry({
    key: 'otoyol-routes',
    label: 'Otoyol Tarifeleri (route-based, eski)',
    sourceLabel: tollData.sourceLabel,
    sourceUrl: tollData.sourceUrl,
    effectiveDate: tollData.effectiveDate,
    lastUpdated: tollData.lastUpdated,
    confidence: tollData.confidence as DataConfidence,
    notes:
      'Rota bazlı eski format. Yeni rota motoru toll-segments.ts kullanır.',
    filePath: 'src/data/otoyol.ts',
    itemCount: tollRoutesItemCount(),
    runbookAnchor: '#otoyol-routes',
    // KGM annual publication → yearly
    refreshCadence: 'yearly',
  }),
  'otoyol-segments': buildEntry({
    key: 'otoyol-segments',
    label: 'Otoyol/Köprü Segmentleri (route engine)',
    sourceLabel: 'KGM 2026 Resmi Tarifesi (köprüler) + tahmini segmentler',
    sourceUrl: 'https://www.kgm.gov.tr',
    effectiveDate: '2026-01-01',
    lastUpdated: '2026-04-05',
    confidence: 'kesin',
    notes:
      'Köprü ve tünel ücretleri KGM resmi tarifesinden, otoyol segmentleri tahmini.',
    filePath: 'src/data/routes/toll-segments.ts',
    itemCount: tollSegmentsItemCount(),
    runbookAnchor: '#otoyol-segments',
    refreshCadence: 'yearly',
  }),
  araclar: buildEntry({
    key: 'araclar',
    label: 'Araç Veritabanı',
    sourceLabel: vehicleDatabase.sourceLabel,
    sourceUrl: vehicleDatabase.sourceUrl,
    effectiveDate: vehicleDatabase.effectiveDate,
    lastUpdated: vehicleDatabase.lastUpdated,
    confidence: vehicleDatabase.confidence as DataConfidence,
    notes: vehicleDatabase.notes,
    filePath: 'src/data/araclar.ts',
    itemCount: araclarItemCount(),
    runbookAnchor: '#araclar',
    // Vehicle prices change quarterly per OYDER benchmarks
    refreshCadence: 'quarterly',
  }),
  noter: buildEntry({
    key: 'noter',
    label: 'Noter Ücretleri',
    sourceLabel: noterData.sourceLabel,
    sourceUrl: noterData.sourceUrl,
    effectiveDate: noterData.effectiveDate,
    lastUpdated: noterData.lastUpdated,
    confidence: noterData.confidence as DataConfidence,
    notes: undefined,
    filePath: 'src/data/noter.ts',
    itemCount: noterItemCount(),
    runbookAnchor: '#noter',
    // Adalet Bakanlığı annual tariff
    refreshCadence: 'yearly',
  }),
  amortisman: buildEntry({
    key: 'amortisman',
    label: 'Amortisman Oranları',
    sourceLabel: amortismanData.sourceLabel,
    sourceUrl: amortismanData.sourceUrl,
    effectiveDate: amortismanData.effectiveDate,
    lastUpdated: amortismanData.lastUpdated,
    confidence: amortismanData.confidence as DataConfidence,
    notes: amortismanData.notes,
    filePath: 'src/data/amortisman.ts',
    itemCount: amortismanItemCount(),
    runbookAnchor: '#amortisman',
    // OYDER sector benchmarks update quarterly
    refreshCadence: 'quarterly',
  }),
};

/**
 * Look up a single manifest entry by key.
 * Throws if the key is not in the manifest (compile-time + runtime safety).
 */
export function getManifestEntry(key: DataManifestKey): DataManifestEntry {
  const entry = dataManifest[key];
  if (!entry) {
    throw new Error(`data-manifest: unknown key "${key}"`);
  }
  return entry;
}

/**
 * Return all manifest entries as an array (admin UI, runbook generator).
 */
export function getAllManifestEntries(): DataManifestEntry[] {
  return (Object.keys(dataManifest) as DataManifestKey[]).map(
    (k) => dataManifest[k]
  );
}

/**
 * Sprint D P8 — Return only the stale manifest entries.
 * Used by `/api/health.dataFreshness`, `/api/data-status.dataFreshness`,
 * and the admin dashboard stale warning card.
 *
 * NOTE: staleness is computed ONCE at module init time using the host clock.
 * For long-running server instances this means `daysSinceUpdate` drifts;
 * in practice Next.js cold-starts the lambda frequently enough that this is
 * acceptable. If we ever need real-time staleness, recompute per request.
 */
export function getStaleEntries(): DataManifestEntry[] {
  return getAllManifestEntries().filter((e) => e.stale);
}

/**
 * Total entry count — handy for sanity checks and tests.
 */
export const DATA_MANIFEST_KEYS: DataManifestKey[] = [
  'mtv',
  'muayene',
  'yakit',
  'otoyol-routes',
  'otoyol-segments',
  'araclar',
  'noter',
  'amortisman',
];
