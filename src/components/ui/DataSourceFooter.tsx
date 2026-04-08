/**
 * Sprint C P7 — DataSourceFooter
 *
 * Compact footer block shown at the bottom of every public calculator
 * page. Reads from the `src/lib/data-manifest.ts` so admins (and future
 * Sprint D's audit job) get a single source of truth for what's shown.
 *
 * Props:
 *   - manifestKey: which data type's manifest entry to render
 *
 * The component is server-render-safe (no state, no effects).
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import {
  getManifestEntry,
  type DataManifestKey,
} from '@/lib/data-manifest';
import ConfidenceBadge from './ConfidenceBadge';

interface DataSourceFooterProps {
  manifestKey: DataManifestKey;
  /** Optional Tailwind class override for the wrapper */
  className?: string;
}

const DataSourceFooter: React.FC<DataSourceFooterProps> = ({
  manifestKey,
  className = '',
}) => {
  const entry = getManifestEntry(manifestKey);

  return (
    <div
      className={`mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm ${className}`}
      role="contentinfo"
      aria-label={`Veri kaynağı: ${entry.label}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-1 text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Kaynak:</span>{' '}
            <a
              href={entry.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 underline"
            >
              {entry.sourceLabel}
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p>
            <span className="font-semibold text-slate-900">Yürürlük:</span>{' '}
            {entry.effectiveDate}
            {' · '}
            <span className="font-semibold text-slate-900">
              Son güncelleme:
            </span>{' '}
            {entry.lastUpdated}
          </p>
          {entry.notes && (
            <p className="text-xs text-slate-500">{entry.notes}</p>
          )}
        </div>
        <div className="flex-shrink-0">
          <ConfidenceBadge level={entry.confidence} />
        </div>
      </div>
    </div>
  );
};

export default DataSourceFooter;
