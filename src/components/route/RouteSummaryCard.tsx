'use client';

import { RouteResult } from '@/lib/route/types';
import {
  formatDistance,
  formatDuration,
  formatCurrency,
  formatCostPerKm,
} from '@/lib/route/formatters';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import { MapPin, Clock, Wallet } from 'lucide-react';

interface Props {
  result: RouteResult;
  showRoundTrip: boolean;
}

export default function RouteSummaryCard({ result, showRoundTrip }: Props) {
  const { startDistrict, endDistrict, oneWay, roundTrip, confidence } = result;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <h2 className="text-base font-semibold text-slate-900 leading-snug">
            {startDistrict.ilce},{' '}
            <span className="font-normal text-slate-600">{startDistrict.il}</span>
            <span className="mx-2 text-slate-400">→</span>
            {endDistrict.ilce},{' '}
            <span className="font-normal text-slate-600">{endDistrict.il}</span>
          </h2>
        </div>
        <div className="shrink-0">
          <ConfidenceBadge level={confidence} />
        </div>
      </div>

      {/* Three-column stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100">
        {/* Mesafe */}
        <div className="flex flex-col items-center gap-1 px-2 first:pl-0">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Mesafe
          </span>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="text-xl font-bold text-slate-900">
              {formatDistance(oneWay.distanceKm)}
            </span>
          </div>
        </div>

        {/* Süre */}
        <div className="flex flex-col items-center gap-1 px-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Süre
          </span>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-xl font-bold text-slate-900">
              {formatDuration(oneWay.durationMin)}
            </span>
          </div>
        </div>

        {/* Maliyet */}
        <div className="flex flex-col items-center gap-1 px-2 last:pr-0">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Maliyet
          </span>
          <div className="flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-slate-400" />
            <span className="text-xl font-bold text-orange-500">
              {formatCurrency(oneWay.totalCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Cost per km */}
      <p className="mt-3 text-center text-xs text-slate-500">
        {formatCostPerKm(oneWay.costPerKm)}
      </p>

      {/* Round-trip footer */}
      {showRoundTrip && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Gidiş-Dönüş</span>
          <span className="font-semibold text-slate-900">
            {formatCurrency(roundTrip.totalCost)}{' '}
            <span className="font-normal text-slate-500">
              ({formatDistance(roundTrip.distanceKm)})
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
