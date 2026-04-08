'use client';

import Link from 'next/link';
import { RouteResult } from '@/lib/route/types';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import { Info } from 'lucide-react';

interface Props {
  result: RouteResult;
}

const TOLL_SOURCE_LABELS: Record<string, string> = {
  kgm_official: 'KGM resmi tarifesi (kesin)',
  estimated_segment: 'Tahmini segment ücretleri',
  mixed: 'Karma — bir kısmı KGM resmi, bir kısmı tahmini',
  none: 'Geçiş ücreti yok',
};

const FUEL_SOURCE_LABELS: Record<string, string> = {
  user_input: 'Sizin girişiniz',
  reference_country: 'Referans (PETDER ülke ortalaması)',
  reference_city: 'Referans (şehir bazlı)',
};

const PATH_DISTANCE_LABELS: Record<string, string> = {
  graph: 'Sadece graf (il merkezi → il merkezi)',
  haversine_offset: 'Sadece ilçe → anchor offset (aynı il)',
  mixed: 'Graf + ilçe-merkez offset (Haversine ×{multiplier})',
};

export default function RouteConfidenceNote({ result }: Props) {
  const {
    confidence,
    tollBreakdown,
    pathDistanceSource,
    tollSource,
    districtOffsetSource,
    fuelPriceSource,
  } = result;

  // Sprint C P10: source provenance lines
  const distanceLine = pathDistanceSource
    ? PATH_DISTANCE_LABELS[pathDistanceSource]?.replace(
        '{multiplier}',
        districtOffsetSource?.multiplier?.toString() ?? '1.25'
      )
    : null;
  const tollLine = tollSource ? TOLL_SOURCE_LABELS[tollSource] : null;
  const fuelLine = fuelPriceSource ? FUEL_SOURCE_LABELS[fuelPriceSource] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-5 w-5 text-slate-400" />
        <h2 className="text-base font-semibold text-slate-900">
          Bu hesaplama hakkında
        </h2>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-5">
        Bu sonuç, il/ilçe merkezleri arası yol koridor grafı üzerinden
        hesaplanmıştır.
      </p>

      {/* Sprint C P10: source provenance lines */}
      {(distanceLine || tollLine || fuelLine) && (
        <ul className="mb-5 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          {distanceLine && (
            <li className="flex items-start gap-2 text-slate-700">
              <span className="font-semibold text-slate-900">
                Mesafe kaynağı:
              </span>
              <span>{distanceLine}</span>
            </li>
          )}
          {tollLine && (
            <li className="flex items-start gap-2 text-slate-700">
              <span className="font-semibold text-slate-900">
                Geçiş ücretleri:
              </span>
              <span>{tollLine}</span>
            </li>
          )}
          {fuelLine && (
            <li className="flex items-start gap-2 text-slate-700">
              <span className="font-semibold text-slate-900">
                Yakıt fiyatı:
              </span>
              <span>{fuelLine}</span>
            </li>
          )}
        </ul>
      )}

      {/* Toll detail notes */}
      {tollBreakdown.length > 0 && (
        <ul className="space-y-2 mb-5">
          {tollBreakdown.map((toll) => {
            const isKesin = toll.confidence === 'kesin';
            return (
              <li key={toll.segmentId} className="flex items-start gap-2 text-sm">
                <span>{isKesin ? '✅' : '⚠️'}</span>
                <span className="text-slate-700">
                  {isKesin ? (
                    <>
                      <span className="font-medium">Kesin:</span> {toll.name}{' '}
                      ({toll.sourceLabel ?? 'KGM resmi tarife'})
                    </>
                  ) : (
                    <>
                      <span className="font-medium">Tahmini:</span> {toll.name}
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* Confidence level */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-sm text-slate-600 font-medium">
          Güven seviyesi:
        </span>
        <ConfidenceBadge level={confidence} />
      </div>

      {/* Metadata */}
      <div className="space-y-1 text-xs text-slate-500 mb-4">
        <p>Son güncelleme: 5 Nisan 2026</p>
        <p>Kaynak: KGM, PETDER</p>
      </div>

      {/* Methodology link */}
      <Link
        href="/metodoloji"
        className="inline-flex items-center text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
      >
        Metodolojimizi inceleyin →
      </Link>
    </div>
  );
}
