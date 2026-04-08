/**
 * /api/data-status — Data Source Truth Endpoint
 *
 * Bu endpoint'in amacı: kullanıcının "calculator hangi veriyi okuyor?" sorusuna
 * net cevap vermek.
 *
 * KRITIK: Uygulama şu anda iki paralel data store kullanıyor:
 *   1. src/data/*.ts hardcoded dosyalar → calculator'lar BURADAN okur
 *   2. Supabase tablolar → admin CRUD BURAYA yazar
 *
 * Bu endpoint her iki tarafı da gösterir ve **alignmentWarning** field'ı ile
 * misalignment'ı açıkça belirtir.
 *
 * GÜVENLIK: Hiçbir secret sızdırmaz. Sadece metadata (rowCount, populated, paths).
 */

import { supabase } from '@/lib/supabase';
import { getServerFlags } from '@/lib/flags';
import { mtvData } from '@/data/mtv';
import { inspectionData } from '@/data/muayene';
import { fuelData } from '@/data/yakit';
import { vehicleDatabase } from '@/data/araclar';
import { tollData } from '@/data/otoyol';
// Sprint C P12: data manifest is the canonical metadata source
// Sprint D P9: + getStaleEntries + RefreshCadence for freshness summary
import {
  getAllManifestEntries,
  getStaleEntries,
  type DataManifestKey,
  type RefreshCadence,
} from '@/lib/data-manifest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TableStatus {
  name: string;
  rowCount: number | null;
  rlsEnabled: boolean | null;
  writable: boolean;
  error?: string;
}

interface SrcDataStatus {
  path: string;
  populated: boolean;
  itemCount: number;
  snapshotOf: string;
  effectiveDate?: string;
}

interface ManifestSummary {
  key: string;
  label: string;
  filePath: string;
  sourceLabel: string;
  sourceUrl: string;
  effectiveDate: string;
  lastUpdated: string;
  confidence: string;
  itemCount: number;
}

interface StaleEntrySummary {
  key: DataManifestKey;
  label: string;
  cadence: RefreshCadence;
  daysSinceUpdate: number;
  maxDaysForCadence: number;
  runbookAnchor: string;
}

interface DataFreshnessBlock {
  generatedAt: string;
  totalEntries: number;
  staleCount: number;
  staleKeys: DataManifestKey[];
  staleSummary: StaleEntrySummary[];
}

interface DataStatusResponse {
  timestamp: string;
  // Sprint C P12: explicit binding decision (was implied)
  activeSource: 'src_data_static_files';
  adrReference: string;
  precedence: string[];
  calculationSource: 'src_data_static_files';
  adminCrudTarget: 'supabase_tables';
  alignmentWarning: string;
  supabase: {
    reachable: boolean;
    tables: TableStatus[];
    error?: string;
  };
  srcDataFiles: Record<string, SrcDataStatus>;
  // Sprint C P12: manifest summary (single source for admin UI + footer)
  manifest: ManifestSummary[];
  // Sprint D P9: data freshness summary (full detail, cheap version on /api/health)
  dataFreshness: DataFreshnessBlock;
}

// Sprint C ADR-001 binding: src/data is the source of truth.
// Sprint B's "remediation in B+1" wording is replaced with the ADR reference.
const ALIGNMENT_WARNING =
  'ADR-001 (accepted Sprint C, 2026-04-08): src/data/*.ts is the binding ' +
  'source of truth for all tariff calculations. The /api/admin/tarifeleri ' +
  'endpoint still accepts writes to Supabase tarife tables (kept for the ' +
  'Sprint B regression script), but those writes have ZERO effect on the ' +
  'user-visible calculators. The MTV / muayene / otoyol / yakıt admin tabs ' +
  'have been hidden in Sprint C P6. See docs/adr/0001-src-data-as-source-of-truth.md ' +
  'and docs/data-update-runbook.md for the editorial workflow.';

const ADR_REFERENCE = 'docs/adr/0001-src-data-as-source-of-truth.md';

const PRECEDENCE = [
  'src/data/*.ts (binding)',
  '(supabase tarife tables ignored — see ADR-001)',
];

const TRACKED_TABLES = [
  'mtv_tarifeleri',
  'muayene_ucretleri',
  'otoyol_ucretleri',
  'yakit_fiyatlari',
  'araclar',
  'amortisman_oranlari',
  'bakim_benchmark',
  'noter_ucretleri',
  'kullanicilar',
  'raporlar',
  'odemeler',
] as const;

async function getTableRowCount(
  tableName: string,
  writable: boolean,
): Promise<TableStatus> {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return {
        name: tableName,
        rowCount: null,
        rlsEnabled: null,
        writable,
        error: error.code || 'query_error',
      };
    }

    return {
      name: tableName,
      rowCount: count ?? 0,
      rlsEnabled: null, // Can't determine via client SDK, documented in baseline
      writable,
    };
  } catch (err) {
    return {
      name: tableName,
      rowCount: null,
      rlsEnabled: null,
      writable,
      error: err instanceof Error ? err.name : 'unknown',
    };
  }
}

function getSrcDataStatus(): Record<string, SrcDataStatus> {
  return {
    mtv: {
      path: 'src/data/mtv.ts',
      populated: mtvData.gasoline.length > 0,
      itemCount: mtvData.gasoline.length + mtvData.diesel.length + mtvData.lpg.length + mtvData.hybrid.length,
      snapshotOf: 'GİB 2026 MTV snapshot (confidence: yaklaşık, see docs/runtime-status.md)',
      effectiveDate: mtvData.effectiveDate,
    },
    muayene: {
      path: 'src/data/muayene.ts',
      populated: inspectionData.vehicleTypes.length > 0,
      itemCount: inspectionData.vehicleTypes.length,
      snapshotOf: 'TÜVTÜRK 2026 verified (confidence: kesin, 3.288/4.446/1.674 TL + 460 egzoz)',
      effectiveDate: inspectionData.effectiveDate,
    },
    yakit: {
      path: 'src/data/yakit.ts',
      populated: fuelData.fuelTypes.length > 0,
      itemCount: fuelData.fuelTypes.length,
      snapshotOf: 'PETDER 2026 snapshot (confidence: yaklaşık)',
      effectiveDate: fuelData.effectiveDate,
    },
    araclar: {
      path: 'src/data/araclar.ts',
      populated: vehicleDatabase.vehicles.length > 0,
      itemCount: vehicleDatabase.vehicles.length,
      snapshotOf: `${vehicleDatabase.vehicles.length} vehicles from OYDER + manufacturer data (confidence: yüksek)`,
      effectiveDate: vehicleDatabase.effectiveDate,
    },
    otoyol: {
      path: 'src/data/otoyol.ts',
      populated: tollData.routes.length > 0,
      itemCount: tollData.routes.length,
      snapshotOf: 'KGM 2026 bridges verified (confidence: kesin), highway segments estimated (confidence: tahmini)',
      effectiveDate: tollData.effectiveDate,
    },
  };
}

export async function GET() {
  try {
    const flags = getServerFlags();
    const writable = flags.adminWriteEnabled.enabled;

    // Probe each table for row count
    const tablePromises = TRACKED_TABLES.map((t) => getTableRowCount(t, writable));
    const tables = await Promise.all(tablePromises);

    // Check if any supabase query succeeded to determine overall reachability
    const anyReachable = tables.some((t) => t.rowCount !== null);

    // Sprint C P12: build manifest summary from data-manifest.ts
    const allEntries = getAllManifestEntries();
    const manifestSummary: ManifestSummary[] = allEntries.map((entry) => ({
      key: entry.key,
      label: entry.label,
      filePath: entry.filePath,
      sourceLabel: entry.sourceLabel,
      sourceUrl: entry.sourceUrl,
      effectiveDate: entry.effectiveDate,
      lastUpdated: entry.lastUpdated,
      confidence: entry.confidence,
      itemCount: entry.itemCount,
    }));

    // Sprint D P9: data freshness summary (full detail)
    const staleEntries = getStaleEntries();
    const dataFreshness: DataFreshnessBlock = {
      generatedAt: new Date().toISOString(),
      totalEntries: allEntries.length,
      staleCount: staleEntries.length,
      staleKeys: staleEntries.map((e) => e.key),
      staleSummary: staleEntries.map((e) => ({
        key: e.key,
        label: e.label,
        cadence: e.refreshCadence,
        daysSinceUpdate: e.daysSinceUpdate,
        maxDaysForCadence: e.maxDaysForCadence,
        runbookAnchor: e.runbookAnchor,
      })),
    };

    const response: DataStatusResponse = {
      timestamp: new Date().toISOString(),
      // Sprint C P12: ADR-001 binding fields
      activeSource: 'src_data_static_files',
      adrReference: ADR_REFERENCE,
      precedence: PRECEDENCE,
      calculationSource: 'src_data_static_files',
      adminCrudTarget: 'supabase_tables',
      alignmentWarning: ALIGNMENT_WARNING,
      supabase: {
        reachable: anyReachable,
        tables,
        error: anyReachable ? undefined : 'all_queries_failed',
      },
      srcDataFiles: getSrcDataStatus(),
      manifest: manifestSummary,
      dataFreshness,
    };

    return Response.json(response, { status: 200 });
  } catch (err) {
    return Response.json(
      {
        timestamp: new Date().toISOString(),
        activeSource: 'src_data_static_files',
        adrReference: ADR_REFERENCE,
        error: err instanceof Error ? err.name : 'unknown',
        alignmentWarning: ALIGNMENT_WARNING,
      },
      { status: 200 },
    );
  }
}
