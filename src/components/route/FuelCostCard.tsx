'use client';

import { RouteResult } from '@/lib/route/types';
import { formatCurrency } from '@/lib/route/formatters';
import { Fuel } from 'lucide-react';

interface Props {
  result: RouteResult;
  showRoundTrip: boolean;
}

const FUEL_TYPE_LABELS: Record<string, string> = {
  benzin: 'Benzin',
  dizel: 'Dizel',
  lpg: 'LPG',
  elektrik: 'Elektrik',
  hibrit: 'Hibrit',
};

export default function FuelCostCard({ result, showRoundTrip }: Props) {
  const { oneWay, roundTrip, metadata, fuelPriceSource } = result;

  const fuelTypeLabel = FUEL_TYPE_LABELS[metadata.fuelType] ?? metadata.fuelType;
  const isElektrik = metadata.fuelType === 'elektrik';
  const unit = isElektrik ? 'kWh' : 'L';
  const priceLabel = `₺${metadata.fuelPrice}/${unit}`;

  // Sprint C P10: fuel price source label
  const sourceSubtitle =
    fuelPriceSource === 'user_input'
      ? 'Sizin fiyatınız'
      : fuelPriceSource === 'reference_country'
      ? 'Referans (PETDER ortalaması)'
      : fuelPriceSource === 'reference_city'
      ? 'Referans (şehir bazlı)'
      : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <Fuel className="h-5 w-5 text-orange-500" />
        <h2 className="text-base font-semibold text-slate-900">Yakıt Maliyeti</h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Toplam Litre */}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500 mb-0.5">Toplam {isElektrik ? 'kWh' : 'Litre'}</p>
          <p className="text-lg font-bold text-slate-900">
            {oneWay.fuelLiters.toFixed(1)} {unit}
          </p>
        </div>

        {/* Birim Fiyat */}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500 mb-0.5">Birim Fiyat</p>
          <p className="text-lg font-bold text-slate-900">
            {priceLabel}{' '}
            <span className="text-xs font-normal text-slate-500">({fuelTypeLabel})</span>
          </p>
          {/* Sprint C P10: Sizin fiyatınız vs Referans subtitle */}
          {sourceSubtitle && (
            <p
              className={`mt-1 text-[11px] font-medium ${
                fuelPriceSource === 'user_input'
                  ? 'text-orange-600'
                  : 'text-slate-500'
              }`}
            >
              {sourceSubtitle}
            </p>
          )}
        </div>

        {/* Tüketim */}
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500 mb-0.5">Tüketim</p>
          <p className="text-lg font-bold text-slate-900">
            {metadata.fuelConsumption}{' '}
            <span className="text-xs font-normal text-slate-500">{unit}/100km</span>
          </p>
        </div>

        {/* Yakıt Maliyeti */}
        <div className="rounded-lg bg-orange-50 border border-orange-100 p-3">
          <p className="text-xs text-orange-600 mb-0.5">Yakıt Maliyeti</p>
          <p className="text-lg font-bold text-orange-600">
            {formatCurrency(oneWay.fuelCost)}
          </p>
        </div>
      </div>

      {/* Round-trip footer */}
      {showRoundTrip && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Gidiş-Dönüş</span>
          <span className="font-semibold text-orange-500">
            {formatCurrency(roundTrip.fuelCost)}
          </span>
        </div>
      )}
    </div>
  );
}
