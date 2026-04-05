'use client';

import { RouteResult } from '@/lib/route/types';
import { formatCurrency, formatCostPerKm } from '@/lib/route/formatters';
import { Coins } from 'lucide-react';

interface Props {
  result: RouteResult;
  showRoundTrip: boolean;
}

export default function TotalCostCard({ result, showRoundTrip }: Props) {
  const { oneWay, roundTrip } = result;

  const fuelPct =
    oneWay.totalCost > 0
      ? Math.round((oneWay.fuelCost / oneWay.totalCost) * 100)
      : 0;
  const tollPct =
    oneWay.totalCost > 0
      ? Math.round((oneWay.tollCost / oneWay.totalCost) * 100)
      : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <Coins className="h-5 w-5 text-orange-500" />
        <h2 className="text-base font-semibold text-slate-900">Toplam Maliyet Özeti</h2>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-4">
        {/* Yakıt */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-slate-600 font-medium">Yakıt</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(oneWay.fuelCost)}{' '}
              <span className="text-xs text-slate-400 font-normal">%{fuelPct}</span>
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${fuelPct}%` }}
            />
          </div>
        </div>

        {/* Geçiş */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-slate-600 font-medium">Geçiş Ücretleri</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(oneWay.tollCost)}{' '}
              <span className="text-xs text-slate-400 font-normal">%{tollPct}</span>
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all"
              style={{ width: `${tollPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-gray-200" />

      {/* Total */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Toplam
          </p>
          <p className="text-3xl font-bold text-slate-900 leading-tight">
            {formatCurrency(oneWay.totalCost)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {formatCostPerKm(oneWay.costPerKm)}
          </p>
        </div>
      </div>

      {/* Round-trip footer */}
      {showRoundTrip && (
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            G/D Toplam
          </span>
          <span className="text-lg font-bold text-orange-500">
            {formatCurrency(roundTrip.totalCost)}
          </span>
        </div>
      )}
    </div>
  );
}
