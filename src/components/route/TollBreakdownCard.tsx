'use client';

import { RouteResult } from '@/lib/route/types';
import { formatCurrency } from '@/lib/route/formatters';
import { Route, ExternalLink } from 'lucide-react';

interface Props {
  result: RouteResult;
  showRoundTrip: boolean;
}

const TYPE_ICONS: Record<string, string> = {
  köprü: '🌉',
  otoyol: '🛣️',
  tünel: '🚇',
};

const TYPE_LABELS: Record<string, string> = {
  köprü: 'Köprü',
  otoyol: 'Otoyol',
  tünel: 'Tünel',
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  köprü: 'bg-blue-50 text-blue-700 border-blue-200',
  otoyol: 'bg-amber-50 text-amber-700 border-amber-200',
  tünel: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function TollBreakdownCard({ result, showRoundTrip }: Props) {
  const { oneWay, roundTrip, tollBreakdown, metadata } = result;
  const isEmpty = tollBreakdown.length === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <Route className="h-5 w-5 text-orange-500" />
        <h2 className="text-base font-semibold text-slate-900">Geçiş Ücretleri</h2>
      </div>

      {isEmpty ? (
        <p className="text-sm text-emerald-600 font-medium">
          Bu güzergahta ücretli geçiş bulunmuyor.
        </p>
      ) : (
        <>
          {/* Table */}
          <div className="w-full text-sm">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 pb-2 border-b border-gray-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span>Geçiş Noktası</span>
              <span className="text-center">Tip</span>
              <span className="text-right">Ücret</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {tollBreakdown.map((toll) => {
                const icon = TYPE_ICONS[toll.type] ?? '🛣️';
                const label = TYPE_LABELS[toll.type] ?? toll.type;
                const badgeColor =
                  TYPE_BADGE_COLORS[toll.type] ?? 'bg-gray-50 text-gray-700 border-gray-200';

                // Sprint C P10: per-line confidence badge
                const confColor =
                  toll.confidence === 'kesin'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : toll.confidence === 'tahmini'
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200';

                return (
                  <div
                    key={toll.segmentId}
                    className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center py-2.5"
                  >
                    <div className="min-w-0">
                      {toll.sourceUrl ? (
                        <a
                          href={toll.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-slate-800 hover:text-orange-600 truncate inline-flex items-center gap-1"
                          title={toll.sourceLabel}
                        >
                          {icon} {toll.name}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="font-medium text-slate-800 truncate">
                          {icon} {toll.name}
                        </span>
                      )}
                      {toll.confidence && (
                        <span
                          className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${confColor}`}
                        >
                          {toll.confidence}
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}
                    >
                      {label}
                    </span>
                    <span className="text-right font-semibold text-slate-900">
                      {formatCurrency(toll.amount)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Divider + Total */}
            <div className="grid grid-cols-[1fr_auto] gap-x-3 items-center pt-3 border-t border-gray-200 mt-1">
              <span className="text-sm font-semibold text-slate-700">Toplam Geçiş</span>
              <span className="text-right text-sm font-bold text-slate-900">
                {formatCurrency(oneWay.tollCost)}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <p className="mt-4 text-xs text-slate-500">
        Araç sınıfı:{' '}
        <span className="font-medium text-slate-700">{metadata.vehicleClass}</span>{' '}
        · HGS
      </p>

      {/* Round-trip footer */}
      {showRoundTrip && !isEmpty && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Gidiş-Dönüş</span>
          <span className="font-semibold text-orange-500">
            {formatCurrency(roundTrip.tollCost)}
          </span>
        </div>
      )}
    </div>
  );
}
