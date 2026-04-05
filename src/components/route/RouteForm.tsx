'use client';

/**
 * RouteForm — Rota hesaplama ana formu
 * Başlangıç/varış seçimi, araç seçimi, geçiş ücreti ayarları
 */

import React, { useState, useCallback } from 'react';
import { ArrowLeftRight, Loader2, Navigation } from 'lucide-react';
import CityDistrictSelector from './CityDistrictSelector';
import VehicleSelector from './VehicleSelector';
import type { RouteParams } from '@/lib/route/types';

interface RouteFormProps {
  onCalculate: (params: RouteParams) => void;
  isCalculating: boolean;
}

const VEHICLE_CLASSES = [
  { value: '1', label: '1 — Otomobil' },
  { value: '2', label: '2 — Hafif Ticari / Minibüs' },
  { value: '3', label: '3 — Otobüs' },
  { value: '4', label: '4 — Kamyonet' },
  { value: '5', label: '5 — Kamyon / Tır' },
];

export default function RouteForm({ onCalculate, isCalculating }: RouteFormProps) {
  const [startDistrictId, setStartDistrictId] = useState('');
  const [endDistrictId, setEndDistrictId] = useState('');
  const [vehicleClass, setVehicleClass] = useState('1');
  const [includeTolls, setIncludeTolls] = useState(true);
  const [roundTrip, setRoundTrip] = useState(false);

  const [vehicleData, setVehicleData] = useState({
    fuelType: 'benzin',
    fuelConsumption: 7.5,
    fuelPrice: 44,
    vehicleLabel: '',
  });

  const handleVehicleChange = useCallback(
    (data: { fuelType: string; fuelConsumption: number; fuelPrice: number; vehicleLabel?: string }) => {
      setVehicleData({
        fuelType: data.fuelType,
        fuelConsumption: data.fuelConsumption,
        fuelPrice: data.fuelPrice,
        vehicleLabel: data.vehicleLabel ?? '',
      });
    },
    []
  );

  const handleSwap = useCallback(() => {
    const temp = startDistrictId;
    setStartDistrictId(endDistrictId);
    setEndDistrictId(temp);
  }, [startDistrictId, endDistrictId]);

  const isValid =
    startDistrictId &&
    endDistrictId &&
    startDistrictId !== endDistrictId &&
    vehicleData.fuelConsumption > 0 &&
    vehicleData.fuelPrice > 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValid) return;

      onCalculate({
        startDistrictId,
        endDistrictId,
        vehicleClass,
        fuelConsumption: vehicleData.fuelConsumption,
        fuelPrice: vehicleData.fuelPrice,
        fuelType: vehicleData.fuelType,
        includeTolls,
        roundTrip,
      });
    },
    [
      isValid,
      onCalculate,
      startDistrictId,
      endDistrictId,
      vehicleClass,
      vehicleData,
      includeTolls,
      roundTrip,
    ]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Başlangıç / Varış */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Güzergah</h3>
          <button
            type="button"
            onClick={handleSwap}
            disabled={!startDistrictId && !endDistrictId}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Başlangıç ve varışı değiştir"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Değiştir
          </button>
        </div>

        <div className="space-y-4">
          <CityDistrictSelector
            label="Başlangıç"
            selectedDistrictId={startDistrictId}
            onDistrictChange={setStartDistrictId}
          />
          <CityDistrictSelector
            label="Varış"
            selectedDistrictId={endDistrictId}
            onDistrictChange={setEndDistrictId}
          />
        </div>

        {startDistrictId && endDistrictId && startDistrictId === endDistrictId && (
          <p className="mt-2 text-sm text-red-500">
            Başlangıç ve varış aynı ilçe olamaz.
          </p>
        )}
      </div>

      {/* Araç Seçimi */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Araç Bilgisi</h3>
        <VehicleSelector onVehicleChange={handleVehicleChange} />
      </div>

      {/* Seçenekler */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Seçenekler</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Araç Sınıfı
            </label>
            <select
              value={vehicleClass}
              onChange={(e) => setVehicleClass(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {VEHICLE_CLASSES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTolls}
                onChange={(e) => setIncludeTolls(e.target.checked)}
                className="w-4 h-4 accent-orange-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700">Ücretli yolları dahil et</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={roundTrip}
                onChange={(e) => setRoundTrip(e.target.checked)}
                className="w-4 h-4 accent-orange-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700">Gidiş-Dönüş</span>
            </label>
          </div>
        </div>
      </div>

      {/* Hesapla Butonu */}
      <button
        type="submit"
        disabled={!isValid || isCalculating}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
      >
        {isCalculating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Hesaplanıyor...
          </>
        ) : (
          <>
            <Navigation className="w-5 h-5" />
            Hesapla
          </>
        )}
      </button>
    </form>
  );
}
