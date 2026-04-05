'use client';

import Link from 'next/link';
import { RouteResult } from '@/lib/route/types';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import { Info } from 'lucide-react';

interface Props {
  result: RouteResult;
}

export default function RouteConfidenceNote({ result }: Props) {
  const { confidence, tollBreakdown } = result;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-5 w-5 text-slate-400" />
        <h2 className="text-base font-semibold text-slate-900">Bu hesaplama hakkında</h2>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 mb-5">
        Bu sonuç, il/ilçe merkezleri arası yol koridor grafı üzerinden hesaplanmıştır.
      </p>

      {/* Toll detail notes */}
      {tollBreakdown.length > 0 && (
        <ul className="space-y-2 mb-5">
          {tollBreakdown.map((toll) => {
            const isKesin = toll.type === 'köprü' || toll.type === 'tünel';
            return (
              <li key={toll.segmentId} className="flex items-start gap-2 text-sm">
                <span>{isKesin ? '✅' : '⚠️'}</span>
                <span className="text-slate-700">
                  {isKesin ? (
                    <>
                      <span className="font-medium">Kesin:</span> {toll.name} ücreti (KGM 2026
                      resmi tarife)
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
        <span className="text-sm text-slate-600 font-medium">Güven seviyesi:</span>
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
