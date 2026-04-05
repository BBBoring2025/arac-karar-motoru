'use client';

import React, { useState, useMemo } from 'react';
import {
  Fuel,
  Shield,
  Wrench,
  TrendingDown,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { calculateTCO } from '@/lib/calculations';
import { vehicleDatabase } from '@/data/araclar';
import { TCOParams, TCOResult } from '@/lib/types';

type FormStep = 'selection' | 'financing' | 'results';

interface FormData {
  // Vehicle selection
  selectionType: 'predefined' | 'manual';
  vehicleId?: string;

  // Manual entry
  vehiclePrice: number;
  engineSize: number;
  fuelType: 'benzin' | 'dizel' | 'lpg' | 'hibrit' | 'elektrik';
  avgConsumption: number;
  vehicleAge: number;
  segment: 'kompakt' | 'sedan' | 'suv' | 'minivan' | 'kargo';
  brand: string;
  model: string;

  // Usage
  annualKm: number;
  fuelPrice: number;

  // Insurance
  hasInsurance: boolean;
  kaskoAmount?: number;
  trafikAmount?: number;

  // Financing
  paymentType: 'pesin' | 'kredi';
  downPayment?: number;
  loanRate?: number;
  loanTerm?: number;

  // Rental alternative
  monthlyRent?: number;
}

export default function RaporPage() {
  const [step, setStep] = useState<FormStep>('selection');
  const [formData, setFormData] = useState<FormData>({
    selectionType: 'manual',
    vehiclePrice: 400000,
    engineSize: 1600,
    fuelType: 'benzin',
    avgConsumption: 6.0,
    vehicleAge: 0,
    segment: 'sedan',
    brand: 'Örnek',
    model: 'Model',
    annualKm: 15000,
    fuelPrice: 32.5,
    hasInsurance: true,
    paymentType: 'pesin',
  });

  const [tcoResult, setTcoResult] = useState<TCOResult | null>(null);
  const [period, setPeriod] = useState<'12ay' | '36ay'>('36ay');

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');

  const brands = useMemo(() => {
    return [...new Set(vehicleDatabase.vehicles.map(v => v.brand))].sort();
  }, []);

  const modelsForBrand = useMemo(() => {
    if (!selectedBrand) return [];
    const models = vehicleDatabase.vehicles
      .filter(v => v.brand === selectedBrand)
      .map(v => ({ id: v.id, model: v.model, displayName: v.displayName, yearRange: v.yearRange }));
    // Deduplicate by model name
    const seen = new Set<string>();
    return models.filter(m => {
      if (seen.has(m.model)) return false;
      seen.add(m.model);
      return true;
    });
  }, [selectedBrand]);

  const yearsForModel = useMemo(() => {
    if (!selectedBrand || !selectedModel) return [];
    const vehicle = vehicleDatabase.vehicles.find(
      v => v.brand === selectedBrand && v.model === selectedModel
    );
    if (!vehicle) return [];
    const years: number[] = [];
    for (let y = vehicle.yearRange.max; y >= vehicle.yearRange.min; y--) {
      years.push(y);
    }
    return years;
  }, [selectedBrand, selectedModel]);

  const handleVehicleSelect = (vehicleId: string, year?: number) => {
    const vehicle = vehicleDatabase.vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      const currentYear = new Date().getFullYear();
      const age = year ? currentYear - year : 0;
      setFormData(prev => ({
        ...prev,
        vehicleId,
        vehiclePrice: vehicle.avgMarketPrice || 400000,
        engineSize: vehicle.engineSize,
        fuelType: vehicle.fuelType,
        avgConsumption: vehicle.avgConsumption,
        segment: vehicle.segment === 'SUV' ? 'suv' : vehicle.segment === 'Ticari' ? 'kargo' : 'sedan',
        brand: vehicle.brand,
        model: vehicle.model,
        vehicleAge: age,
      }));
    }
  };

  const handleCalculate = () => {
    const currentYear = new Date().getFullYear();
    const yapiYili = currentYear - formData.vehicleAge;

    const params: TCOParams = {
      aracFiyati: formData.vehiclePrice,
      motorHacmi: formData.engineSize,
      aracYasi: formData.vehicleAge,
      yapiYili,
      segment: formData.segment,
      marka: formData.brand,
      yakitTupu: formData.fuelType,
      tahminiYakitTuketimi: formData.avgConsumption,
      yillikKm: formData.annualKm,
      pesinOdeme: formData.paymentType === 'pesin',
      krediFaizi: formData.loanRate ? (formData.loanRate / 100) * 12 : undefined,
      krediVadesi: formData.loanTerm,
      ilkOdeme: formData.downPayment,
      yakitFiyati: formData.fuelPrice,
      kaskoTahmini: formData.kaskoAmount,
      trafikSigortasiTahmini: formData.trafikAmount,
      periyot: period,
    };

    const result = calculateTCO(params);
    setTcoResult(result);
    setStep('results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0F1722]">
      {/* Header */}
      <div className="bg-[#1B2A4A] border-b border-orange-500/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-white">
            Araç Karar Raporu
          </h1>
          <p className="text-gray-400 mt-1">
            Aracınızın 3 yılda maliyetini öğrenin
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12 gap-2">
          <div className={`h-2 w-16 rounded-full transition-all ${
            step === 'selection' ? 'bg-orange-500' : 'bg-green-500'
          }`} />
          <div className={`h-2 w-16 rounded-full transition-all ${
            ['results'].includes(step) ? 'bg-orange-500' : 'bg-gray-700'
          }`} />
        </div>

        {/* STEP 1: Vehicle Selection */}
        {step === 'selection' && (
          <div className="space-y-8">
            <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Araç Seçimi
              </h2>

              {/* Selection Type Toggle */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, selectionType: 'predefined' }))}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    formData.selectionType === 'predefined'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Veri Tabanından Seç
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, selectionType: 'manual' }))}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    formData.selectionType === 'manual'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Manuel Giriş
                </button>
              </div>

              {/* Predefined Selection — 3 Kademeli Dropdown */}
              {formData.selectionType === 'predefined' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. Marka */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Marka
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => {
                        setSelectedBrand(e.target.value);
                        setSelectedModel('');
                        setSelectedYear('');
                      }}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">Marka Seçin</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Model */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Model
                    </label>
                    <select
                      value={selectedModel}
                      disabled={!selectedBrand}
                      onChange={(e) => {
                        setSelectedModel(e.target.value);
                        setSelectedYear('');
                        const model = modelsForBrand.find(m => m.model === e.target.value);
                        if (model) {
                          handleVehicleSelect(model.id);
                        }
                      }}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="">Model Seçin</option>
                      {modelsForBrand.map(model => (
                        <option key={model.id} value={model.model}>
                          {model.model}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Yıl */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Yıl
                    </label>
                    <select
                      value={selectedYear}
                      disabled={!selectedModel}
                      onChange={(e) => {
                        const year = Number(e.target.value);
                        setSelectedYear(year);
                        const model = modelsForBrand.find(m => m.model === selectedModel);
                        if (model) {
                          handleVehicleSelect(model.id, year);
                        }
                      }}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none disabled:opacity-50"
                    >
                      <option value="">Yıl Seçin</option>
                      {yearsForModel.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Manual Entry */}
              {formData.selectionType === 'manual' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Marka
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Araç Fiyatı (₺)
                    </label>
                    <input
                      type="number"
                      value={formData.vehiclePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehiclePrice: Number(e.target.value) }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Motor Hacmi (cc)
                    </label>
                    <input
                      type="number"
                      value={formData.engineSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, engineSize: Number(e.target.value) }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Yakıt Tipi
                    </label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value as FormData['fuelType'] }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="benzin">Benzin</option>
                      <option value="dizel">Dizel</option>
                      <option value="lpg">LPG</option>
                      <option value="hibrit">Hibrit</option>
                      <option value="elektrik">Elektrik</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Ortalama Tüketim (L/100km)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.avgConsumption}
                      onChange={(e) => setFormData(prev => ({ ...prev, avgConsumption: Number(e.target.value) }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Araç Yaşı (yıl)
                    </label>
                    <input
                      type="number"
                      value={formData.vehicleAge}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicleAge: Number(e.target.value) }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Segment
                    </label>
                    <select
                      value={formData.segment}
                      onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value as FormData['segment'] }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="kompakt">Kompakt</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="minivan">Minivan</option>
                      <option value="kargo">Kargo</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Usage and Cost Section */}
            <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Kullanım Parametreleri
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-white font-medium mb-4">
                    Yıllık KM Tahmini: {formData.annualKm.toLocaleString('tr-TR')} km
                  </label>
                  <input
                    type="range"
                    min="5000"
                    max="50000"
                    step="1000"
                    value={formData.annualKm}
                    onChange={(e) => setFormData(prev => ({ ...prev, annualKm: Number(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>5.000 km</span>
                    <span>50.000 km</span>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Yakıt Fiyatı (₺/L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fuelPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, fuelPrice: Number(e.target.value) }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Insurance Section */}
            <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-orange-500" />
                Sigorta Bilgileri
              </h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasInsurance"
                    checked={formData.hasInsurance}
                    onChange={(e) => setFormData(prev => ({ ...prev, hasInsurance: e.target.checked }))}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                  <label htmlFor="hasInsurance" className="ml-3 text-white font-medium cursor-pointer">
                    Kasko ve Trafik Sigortası Ekle
                  </label>
                </div>

                {formData.hasInsurance && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Kasko Tahmini (₺/yıl)
                      </label>
                      <input
                        type="number"
                        value={formData.kaskoAmount || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, kaskoAmount: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        placeholder="Otomatik hesaplanacak"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Trafik Sigortası (₺/yıl)
                      </label>
                      <input
                        type="number"
                        value={formData.trafikAmount || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, trafikAmount: e.target.value ? Number(e.target.value) : undefined }))}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                        placeholder="Otomatik hesaplanacak"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financing Section */}
            <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Finansman Seçeneği
              </h2>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, paymentType: 'pesin' }))}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    formData.paymentType === 'pesin'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Peşin Ödeme
                </button>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, paymentType: 'kredi' }))}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    formData.paymentType === 'kredi'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Kredi ile Satın Al
                </button>
              </div>

              {formData.paymentType === 'kredi' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      İlk Ödeme (₺)
                    </label>
                    <input
                      type="number"
                      value={formData.downPayment || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, downPayment: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Faiz Oranı (% yıllık)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.loanRate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, loanRate: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                      placeholder="18"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">
                      Vade (ay)
                    </label>
                    <select
                      value={formData.loanTerm || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, loanTerm: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">Seçin</option>
                      <option value="12">12 ay</option>
                      <option value="24">24 ay</option>
                      <option value="36">36 ay</option>
                      <option value="48">48 ay</option>
                      <option value="60">60 ay</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleCalculate}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-lg transition-all text-lg flex items-center justify-center gap-2"
              >
                Raporu Oluştur
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Results */}
        {step === 'results' && tcoResult && (
          <div className="space-y-8">
            {/* Period Toggle */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setPeriod('12ay')}
                className={`px-8 py-3 rounded-lg font-bold transition-all text-lg ${
                  period === '12ay'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                12 Ay
              </button>
              <button
                onClick={() => setPeriod('36ay')}
                className={`px-8 py-3 rounded-lg font-bold transition-all text-lg ${
                  period === '36ay'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                36 Ay
              </button>
            </div>

            {/* Vehicle Summary Card */}
            <div className="bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/30 rounded-lg p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {tcoResult.aracBilgisi.marka} {tcoResult.aracBilgisi.model}
                  </h3>
                  <p className="text-gray-400 mt-1">
                    {tcoResult.aracBilgisi.fiyat.toLocaleString('tr-TR')} ₺
                  </p>
                </div>
              </div>

              <div className="text-center py-8 border-t border-orange-500/20">
                <p className="text-gray-300 text-lg mb-2">
                  Bu araç size {period === '12ay' ? '12 ayda' : '3 yılda'} yaklaşık olarak
                </p>
                <p className="text-5xl font-bold text-orange-400">
                  ₺{tcoResult.toplamMaliyet.toLocaleString('tr-TR')}
                </p>
                <p className="text-gray-400 mt-4">
                  Aylık ortalama: ₺{Math.round(tcoResult.ortalamAylikMaliyet).toLocaleString('tr-TR')}
                </p>
                <p className="text-gray-400">
                  KM başına: ₺{tcoResult.kmBasiMaliyet.toFixed(2)} / km
                </p>
              </div>
            </div>

            {/* TCO Breakdown Table */}
            <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Maliyet Dökümü
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-4 px-4 text-white font-semibold">Kalem</th>
                      <th className="text-right py-4 px-4 text-white font-semibold">Toplam (₺)</th>
                      <th className="text-right py-4 px-4 text-white font-semibold">% Oranı</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Yakıt', value: tcoResult.breakdown.yakit.toplam, icon: Fuel },
                      { label: 'MTV', value: tcoResult.breakdown.mtv.toplam },
                      { label: 'Sigorta', value: tcoResult.breakdown.sigorta.toplam, icon: Shield },
                      { label: 'Bakım', value: tcoResult.breakdown.bakim.toplam, icon: Wrench },
                      { label: 'Muayene', value: tcoResult.breakdown.muayene.toplam },
                      { label: 'Kredi Faizi', value: tcoResult.breakdown.krediMaliyeti.toplamFaiz },
                      { label: 'Değer Kaybı (Amortisman)', value: tcoResult.breakdown.amortisman.toplamDegerKaybi, icon: TrendingDown },
                    ].map((item, idx) => {
                      const percentage = (item.value / tcoResult.toplamMaliyet * 100).toFixed(1);
                      if (item.value === 0) return null;

                      return (
                        <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="py-4 px-4 text-gray-300 flex items-center gap-2">
                            {item.icon && <item.icon className="w-4 h-4 text-orange-500" />}
                            {item.label}
                          </td>
                          <td className="py-4 px-4 text-right text-white font-medium">
                            ₺{item.value.toLocaleString('tr-TR')}
                          </td>
                          <td className="py-4 px-4 text-right text-orange-400">
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Premium Sections (Blurred) */}
            <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-transparent pointer-events-none" />

              <div className="blur-sm opacity-50">
                <h3 className="text-2xl font-bold text-white mb-6">
                  3 Alternatif Araç Önerisi
                </h3>
                <div className="space-y-4">
                  {['Toyota Hilux', 'Honda CR-V', 'Renault Duster'].map((name, idx) => (
                    <div key={idx} className="bg-gray-800 rounded p-4">
                      <p className="text-white font-medium">{name}</p>
                      <p className="text-gray-400 text-sm">Uyum skoru: 92%</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/60 px-6 py-3 rounded-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-500" />
                  <span className="text-white font-semibold">Premium İçerik</span>
                </div>
              </div>
            </div>

            {/* Premium CTA */}
            <div className="bg-gradient-to-r from-orange-500/30 to-orange-500/10 border border-orange-500/50 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Tam Raporu Açmak İstiyorsunuz?
              </h3>
              <p className="text-gray-300 mb-6">
                Alternatif araçlar, detaylı karşılaştırma ve karar önerileri için
              </p>
              <a
                href="/odeme?product=rapor"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg transition-all text-lg"
              >
                Tam Raporu Aç - 99 TL
              </a>
            </div>

            {/* Back Button */}
            <button
              onClick={() => {
                setStep('selection');
                setTcoResult(null);
              }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all"
            >
              Parametreleri Düzenle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
