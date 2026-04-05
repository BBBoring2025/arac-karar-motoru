'use client';

/**
 * Rota Maliyet Hesaplama Sayfası
 * İlçeden ilçeye rota hesaplaması yapar.
 * Sprint 1 motorunu (calculateRoute) kullanır.
 */

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { calculateRoute } from '@/lib/route/route-engine';
import type { RouteResult, RouteParams } from '@/lib/route/types';
import RouteForm from '@/components/route/RouteForm';
import RouteSummaryCard from '@/components/route/RouteSummaryCard';
import FuelCostCard from '@/components/route/FuelCostCard';
import TollBreakdownCard from '@/components/route/TollBreakdownCard';
import TotalCostCard from '@/components/route/TotalCostCard';
import RouteTimeline from '@/components/route/RouteTimeline';
import RouteConfidenceNote from '@/components/route/RouteConfidenceNote';
import { trackRouteCalculated, trackError } from '@/lib/analytics';

export default function RotaMaliyetPage() {
  const [result, setResult] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showRoundTrip, setShowRoundTrip] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleCalculate = useCallback((params: RouteParams) => {
    setIsCalculating(true);
    setError(null);
    setResult(null);
    setShowRoundTrip(params.roundTrip);

    // Motor senkron çalışır, setTimeout ile UI'ın güncellenmesini sağla
    setTimeout(() => {
      try {
        const routeResult = calculateRoute(params);
        setResult(routeResult);
        trackRouteCalculated(
          routeResult.startDistrict.il,
          routeResult.endDistrict.il,
          routeResult.oneWay.distanceKm
        );
        // Smooth scroll
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Bilinmeyen hata';
        trackError('rota', message);
        if (message.includes('Rota bulunamadı')) {
          setError(
            'Bu güzergah için henüz veri bulunmuyor. Farklı bir il/ilçe deneyin.'
          );
        } else if (message.includes('bulunamadı')) {
          setError('Seçilen ilçe veritabanında bulunamadı.');
        } else {
          setError(message);
        }
      } finally {
        setIsCalculating(false);
      }
    }, 50);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Rota Maliyet Hesaplama
          </h1>
          <p className="text-slate-600 mt-2">
            İlçeden ilçeye yakıt ve geçiş ücreti hesaplayın. 81 il, 970+ ilçe desteklenir.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form */}
        <RouteForm onCalculate={handleCalculate} isCalculating={isCalculating} />

        {/* Hata */}
        {error && (
          <div role="alert" className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">
                  Rota hesaplanamadı
                </h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <p className="text-red-600 text-xs mt-2">
                  Olası nedenler: seçilen ilçeler arasında tanımlı bir koridor
                  bulunmuyor veya ücretli yollar kapatıldığında alternatif rota
                  mevcut değil.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sonuçlar */}
        <div aria-live="polite" aria-atomic="false">
        {result && (
          <div
            ref={resultRef}
            className="mt-8 space-y-6 animate-in fade-in duration-500"
          >
            {result.tollAvoidanceNote && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-800 text-sm">{result.tollAvoidanceNote}</p>
                </div>
              </div>
            )}

            <RouteSummaryCard result={result} showRoundTrip={showRoundTrip} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FuelCostCard result={result} showRoundTrip={showRoundTrip} />
              <TollBreakdownCard result={result} showRoundTrip={showRoundTrip} />
            </div>

            <TotalCostCard result={result} showRoundTrip={showRoundTrip} />

            <RouteTimeline result={result} />

            <RouteConfidenceNote result={result} />
          </div>
        )}
        </div>

        {/* Alt bilgilendirme */}
        <div className="mt-8 text-center text-xs text-gray-500 py-4 border-t border-gray-200">
          <p>Kaynak: PETDER &amp; KGM 2026 | Veriler 5 Nisan 2026 itibarıyla günceldir.</p>
        </div>

        {/* CTA */}
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center">
          <p className="text-slate-900 font-medium mb-3">
            Daha detaylı analiz için
          </p>
          <Link
            href="/rapor"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Karar Raporu Al
          </Link>
        </div>
      </div>
    </div>
  );
}
