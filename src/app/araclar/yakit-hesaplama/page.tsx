'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { Zap, Info } from 'lucide-react';
import { fuelData } from '@/data/yakit';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import DataSourceFooter from '@/components/ui/DataSourceFooter';
// Sprint D P7 — analytics call-site backfill
import { trackToolOpened, trackCalculation } from '@/lib/analytics';

export default function YakitHesaplama() {
  const [inputMode, setInputMode] = useState<'vehicle' | 'manual'>('vehicle');
  const [selectedVehicle, setSelectedVehicle] = useState('toyota_corolla_2023');
  const [manualConsumption, setManualConsumption] = useState('6.0');
  const [monthlyKm, setMonthlyKm] = useState('1500');
  const [fuelType, setFuelType] = useState('benzin');
  const [fuelPrice, setFuelPrice] = useState('44.25');
  // Sprint C P11: track if user has manually edited the price
  const [priceOverridden, setPriceOverridden] = useState(false);

  // Sprint D P7 — tool_opened event on mount
  useEffect(() => {
    trackToolOpened('yakit');
  }, []);

  // Sprint D P7 — calculation_completed when user changes inputs (debounced via useMemo deps)
  useEffect(() => {
    trackCalculation('yakit', {
      fuelType,
      inputMode,
      priceOverridden,
    });
  }, [fuelType, inputMode, priceOverridden]);

  const selectedVehicleData = useMemo(() => {
    return fuelData.vehicleConsumption.find(v => v.id === selectedVehicle);
  }, [selectedVehicle]);

  const selectedFuelData = useMemo(() => {
    return fuelData.fuelTypes.find(f => f.id === fuelType);
  }, [fuelType]);

  const consumption = inputMode === 'vehicle'
    ? (selectedVehicleData?.consumption || 6.0)
    : (parseFloat(manualConsumption) || 6.0);

  const monthlyKmNum = parseFloat(monthlyKm) || 1500;
  const fuelPriceNum = parseFloat(fuelPrice) || 44.25;

  const monthlyCost = useMemo(() => {
    const monthlyLiters = (monthlyKmNum / 100) * consumption;
    return monthlyLiters * fuelPriceNum;
  }, [monthlyKmNum, consumption, fuelPriceNum]);

  const yearlyCost = monthlyCost * 12;
  const costPerKm = monthlyCost > 0 ? monthlyCost / monthlyKmNum : 0;

  const fuelTypes = fuelData.fuelTypes;

  const comparisonTable = useMemo(() => {
    return fuelTypes.map(fuel => {
      const monthlyLiters = (monthlyKmNum / 100) * consumption;
      const cost = monthlyLiters * fuel.price;
      return {
        fuelType: fuel.displayName,
        monthlyPrice: fuel.price,
        monthlyCost: cost,
        yearlyCost: cost * 12,
      };
    });
  }, [monthlyKmNum, consumption, fuelTypes]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Yakıt Maliyeti Hesaplama</h1>
          <p className="text-lg text-slate-600">Araçınızın yakıt harcaması ve maliyetini hesaplayın</p>
        </div>

        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setInputMode('vehicle')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              inputMode === 'vehicle'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Araç Seçimi
          </button>
          <button
            onClick={() => setInputMode('manual')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
              inputMode === 'manual'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Manuel Giriş
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {inputMode === 'vehicle' ? (
            <Select
              label="Araç Seçimi"
              options={fuelData.vehicleConsumption.map(v => ({
                value: v.id,
                label: `${v.brand} ${v.model} (${v.year}) - ${v.consumption}L/100km`
              }))}
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yakıt Tüketimi (L/100km)</label>
              <Input
                type="number"
                step="0.1"
                value={manualConsumption}
                onChange={(e) => setManualConsumption(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aylık Km</label>
            <Input
              type="number"
              value={monthlyKm}
              onChange={(e) => setMonthlyKm(e.target.value)}
            />
          </div>

          <Select
            label="Yakıt Tipi"
            options={fuelTypes.map(fuel => ({ value: fuel.id, label: fuel.displayName }))}
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yakıt Fiyatı ({selectedFuelData?.pricePerUnit})
              {/* Sprint C P11: source label */}
              {priceOverridden ? (
                <span className="ml-2 inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-semibold rounded">
                  Sizin fiyatınız
                </span>
              ) : (
                <span className="ml-2 inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                  Referans (PETDER)
                </span>
              )}
            </label>
            <p className="text-xs text-slate-500 mb-2">
              {priceOverridden
                ? "Bu fiyat sizin tarafınızdan girildi."
                : `Referans fiyat — PETDER ortalaması (${fuelData.effectiveDate || fuelData.lastUpdated})`}
              {priceOverridden && (
                <button
                  type="button"
                  onClick={() => {
                    setFuelPrice(String(selectedFuelData?.price ?? '44.25'));
                    setPriceOverridden(false);
                  }}
                  className="ml-2 text-orange-600 hover:text-orange-700 underline"
                >
                  Referansa dön
                </button>
              )}
            </p>
            <Input
              type="number"
              step="0.01"
              value={fuelPrice}
              onChange={(e) => {
                setFuelPrice(e.target.value);
                setPriceOverridden(true);
              }}
            />
          </div>
        </div>

        {inputMode === 'vehicle' && selectedVehicleData && (
          <Card className="mb-8 bg-blue-50">
            <p className="text-slate-700">
              <strong>{selectedVehicleData.consumption}</strong> L/100km tüketim
            </p>
          </Card>
        )}

        <Card variant="highlighted" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-slate-900">Yakıt Maliyeti</h2>
            </div>
            <ConfidenceBadge
              level={inputMode === 'vehicle' ? 'yaklaşık' : 'kesin'}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Aylık Maliyet</p>
              <p className="text-2xl font-bold text-slate-900">
                {monthlyCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>
            <div className="bg-white bg-opacity-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Yıllık Maliyet</p>
              <p className="text-2xl font-bold text-slate-900">
                {yearlyCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>
            <div className="bg-white bg-opacity-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">KM Başına</p>
              <p className="text-2xl font-bold text-slate-900">
                {costPerKm.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Yakıt Tipi Karşılaştırması ({monthlyKmNum} km/ay)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Yakıt Tipi</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-900">Fiyat</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-900">Aylık</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-900">Yıllık</th>
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map((row, idx) => (
                  <tr key={idx} className={`border-t ${row.fuelType === selectedFuelData?.displayName ? 'bg-orange-50' : ''}`}>
                    <td className="px-4 py-3 text-slate-700">{row.fuelType}</td>
                    <td className="px-4 py-3 text-right text-slate-600 text-xs">
                      {row.monthlyPrice.toFixed(2)} TL
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {row.monthlyCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {row.yearlyCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Sprint D P11: Hardcoded "Bilgilendirme" Card removed.
            Sprint C P11 "Sizin fiyatınız" / "Referans (PETDER)" override
            semantics preserved above in the fuel price input. */}
        <div className="mb-4 text-sm text-slate-600">
          <p>
            Yakıt maliyeti hesaplaması, giriş yapılan tüketim verileri ve
            referans yakıt fiyatına dayanır. Gerçek harcamalar sürüş
            koşullarına göre değişebilir.
          </p>
        </div>

        {/* Sprint C P7 + D P11: data manifest footer — single source of truth */}
        <DataSourceFooter manifestKey="yakit" />

        <Card variant="highlighted" className="cursor-pointer hover:shadow-lg">
          <p className="text-center text-slate-900 mb-3 font-medium">Daha detaylı analiz için</p>
          <Link href="/rapor" className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors text-center">
            Karar Raporu Al
          </Link>
        </Card>
      </div>
    </div>
  );
}
