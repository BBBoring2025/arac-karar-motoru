'use client';

/**
 * VehicleSelector — Araç seçimi veya manuel tüketim girişi
 * Tab 1: Veritabanından araç seç (marka → model)
 * Tab 2: Manuel yakıt tipi + tüketim + fiyat
 */

import React, { useState, useMemo, useCallback } from 'react';
import SearchableCombobox, { ComboboxOption } from './SearchableCombobox';
import { vehicleDatabase } from '@/data/araclar';
import { fuelData } from '@/data/yakit';

interface VehicleData {
  fuelType: string;
  fuelConsumption: number;
  fuelPrice: number;
  vehicleLabel?: string;
}

interface VehicleSelectorProps {
  onVehicleChange: (data: VehicleData) => void;
}

const FUEL_LABELS: Record<string, string> = {
  benzin: 'Benzin',
  dizel: 'Dizel',
  lpg: 'LPG',
  elektrik: 'Elektrik',
  hibrit: 'Hibrit',
};

function getDefaultFuelPrice(fuelType: string): number {
  const ft = fuelData.fuelTypes.find(
    (f) => f.id.toLowerCase() === fuelType.toLowerCase()
  );
  return ft?.price ?? 44;
}

export default function VehicleSelector({ onVehicleChange }: VehicleSelectorProps) {
  const [tab, setTab] = useState<'arac' | 'manuel'>('arac');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // Manuel state
  const [manuelFuelType, setManuelFuelType] = useState('benzin');
  const [manuelConsumption, setManuelConsumption] = useState(7.5);
  const [manuelPrice, setManuelPrice] = useState(getDefaultFuelPrice('benzin'));

  const brandOptions: ComboboxOption[] = useMemo(() => {
    const brands = [...new Set(vehicleDatabase.vehicles.map((v) => v.brand))].sort(
      (a, b) => a.localeCompare(b, 'tr')
    );
    return brands.map((b) => ({ value: b, label: b }));
  }, []);

  const modelOptions: ComboboxOption[] = useMemo(() => {
    if (!selectedBrand) return [];
    return vehicleDatabase.vehicles
      .filter((v) => v.brand === selectedBrand)
      .map((v) => ({
        value: v.id,
        label: v.model,
        sublabel: `${FUEL_LABELS[v.fuelType] || v.fuelType} · ${v.avgConsumption} L/100km`,
      }));
  }, [selectedBrand]);

  const handleBrandChange = useCallback((brand: string) => {
    setSelectedBrand(brand);
    setSelectedVehicleId('');
  }, []);

  const handleModelChange = useCallback(
    (vehicleId: string) => {
      setSelectedVehicleId(vehicleId);
      const vehicle = vehicleDatabase.vehicles.find((v) => v.id === vehicleId);
      if (vehicle) {
        const price = getDefaultFuelPrice(vehicle.fuelType);
        onVehicleChange({
          fuelType: vehicle.fuelType,
          fuelConsumption: vehicle.avgConsumption,
          fuelPrice: price,
          vehicleLabel: vehicle.displayName,
        });
      }
    },
    [onVehicleChange]
  );

  const handleManuelChange = useCallback(
    (field: string, value: string | number) => {
      let newFuelType = manuelFuelType;
      let newConsumption = manuelConsumption;
      let newPrice = manuelPrice;

      if (field === 'fuelType') {
        newFuelType = value as string;
        newPrice = getDefaultFuelPrice(newFuelType);
        setManuelFuelType(newFuelType);
        setManuelPrice(newPrice);
      } else if (field === 'consumption') {
        newConsumption = Number(value);
        setManuelConsumption(newConsumption);
      } else if (field === 'price') {
        newPrice = Number(value);
        setManuelPrice(newPrice);
      }

      onVehicleChange({
        fuelType: newFuelType,
        fuelConsumption: field === 'consumption' ? Number(value) : newConsumption,
        fuelPrice: field === 'price' ? Number(value) : newPrice,
        vehicleLabel: 'Manuel',
      });
    },
    [manuelFuelType, manuelConsumption, manuelPrice, onVehicleChange]
  );

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab('arac')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'arac'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
          }`}
        >
          Araç Seç
        </button>
        <button
          type="button"
          onClick={() => setTab('manuel')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'manuel'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-slate-600 hover:bg-gray-200'
          }`}
        >
          Manuel Giriş
        </button>
      </div>

      {tab === 'arac' ? (
        <div className="grid grid-cols-2 gap-3">
          <SearchableCombobox
            options={brandOptions}
            value={selectedBrand}
            onChange={handleBrandChange}
            placeholder="Marka"
            label="Marka"
          />
          <SearchableCombobox
            options={modelOptions}
            value={selectedVehicleId}
            onChange={handleModelChange}
            placeholder="Model"
            label="Model"
            disabled={!selectedBrand}
          />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Yakıt Tipi
            </label>
            <select
              value={manuelFuelType}
              onChange={(e) => handleManuelChange('fuelType', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="benzin">Benzin</option>
              <option value="dizel">Dizel</option>
              <option value="lpg">LPG</option>
              <option value="elektrik">Elektrik</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tüketim ({manuelFuelType === 'elektrik' ? 'kWh' : 'L'}/100km)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={manuelConsumption}
              onChange={(e) => handleManuelChange('consumption', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fiyat (TL/{manuelFuelType === 'elektrik' ? 'kWh' : 'L'})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={manuelPrice}
              onChange={(e) => handleManuelChange('price', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
