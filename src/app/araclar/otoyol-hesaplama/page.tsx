'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { Zap, Info } from 'lucide-react';
import { tollData } from '@/data/otoyol';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';
import DataSourceFooter from '@/components/ui/DataSourceFooter';
// Sprint D P7 — analytics call-site backfill
import { trackToolOpened, trackCalculation } from '@/lib/analytics';

export default function OtoyolHesaplama() {
  const [selectedRoute, setSelectedRoute] = useState('o1');
  const [selectedVehicleClass, setSelectedVehicleClass] = useState('1');

  // Sprint D P7 — tool_opened + calculation events
  useEffect(() => {
    trackToolOpened('otoyol');
  }, []);

  useEffect(() => {
    trackCalculation('otoyol', {
      route: selectedRoute,
      vehicleClass: selectedVehicleClass,
    });
  }, [selectedRoute, selectedVehicleClass]);
  const [selectedGateSystem, setSelectedGateSystem] = useState('hgs');
  const [monthlyPassages, setMonthlyPassages] = useState('4');

  const selectedRouteData = useMemo(() => {
    return tollData.routes.find(r => r.id === selectedRoute);
  }, [selectedRoute]);

  const singlePassageFee = useMemo(() => {
    if (!selectedRouteData) return 0;
    const toll = selectedRouteData.vehicleClasses[selectedVehicleClass];
    return selectedGateSystem === 'hgs' ? toll.hgs : toll.ogs;
  }, [selectedRouteData, selectedVehicleClass, selectedGateSystem]);

  const monthlyFee = useMemo(() => {
    return singlePassageFee * parseInt(monthlyPassages || '0');
  }, [singlePassageFee, monthlyPassages]);

  const annualFee = useMemo(() => {
    return monthlyFee * 12;
  }, [monthlyFee]);

  const routes = tollData.routes;
  const vehicleClasses = Object.values(tollData.vehicleClasses);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Otoyol ve Köprü Ücreti Hesaplama</h1>
          <p className="text-lg text-slate-600">KGM 2026 tarifelerine göre geçiş ücretini hesaplayın</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Select
            label="Otoyol / Köprü Seçimi"
            options={routes.map(route => ({ value: route.id, label: route.displayName }))}
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
          />

          <Select
            label="Araç Sınıfı"
            options={vehicleClasses.map(vc => ({ value: vc.id, label: `${vc.name} - ${vc.examples}` }))}
            value={selectedVehicleClass}
            onChange={(e) => setSelectedVehicleClass(e.target.value)}
          />

          <Select
            label="Geçiş Sistemi"
            options={[
              { value: 'hgs', label: 'HGS (Hızlı Geçiş) - 10% İndirim' },
              { value: 'ogs', label: 'OGS (Otomatik Geçiş)' },
            ]}
            value={selectedGateSystem}
            onChange={(e) => setSelectedGateSystem(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aylık Geçiş Sayısı (İsteğe Bağlı)</label>
            <Input
              type="number"
              min="0"
              value={monthlyPassages}
              onChange={(e) => setMonthlyPassages(e.target.value)}
              placeholder="Aylık geçiş sayısı"
            />
          </div>
        </div>

        <Card variant="highlighted" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-slate-900">Geçiş Ücreti</h2>
            </div>
            <ConfidenceBadge level="yaklaşık" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Tek Geçiş</p>
              <p className="text-2xl font-bold text-slate-900">
                {singlePassageFee.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>
            <div className="bg-white bg-opacity-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Aylık ({monthlyPassages} geçiş)</p>
              <p className="text-2xl font-bold text-slate-900">
                {monthlyFee.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>
            <div className="bg-white bg-opacity-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Yıllık Tahmini</p>
              <p className="text-2xl font-bold text-slate-900">
                {annualFee.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Seçili Rota Bilgileri</h2>
          {selectedRouteData && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Adı</p>
                <p className="font-semibold text-slate-900">{selectedRouteData.displayName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Tür</p>
                <p className="font-semibold text-slate-900">
                  {selectedRouteData.type === 'highway' ? 'Otoyol' : selectedRouteData.type === 'bridge' ? 'Köprü' : 'Tünel'}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Bölge</p>
                <p className="font-semibold text-slate-900">{selectedRouteData.region}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Sprint D P11: Hardcoded "Bilgilendirme" Card removed.
            Vehicle class legend preserved as compact prose. */}
        <div className="mb-4 text-sm text-slate-600">
          <p className="mb-2">
            Köprü ve tünel ücretleri sabit tarifedir (HGS/OGS ayrımı yoktur).
            Otoyol segment ücretleri gişe-gişe mesafeye göre değişebilir.
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-xs text-slate-500">
            <li>Araç Sınıfı 1: Otomobil, SUV, Coupe</li>
            <li>Araç Sınıfı 2: Minibüs (7-8 kişi)</li>
            <li>Araç Sınıfı 3: Otobüs (9+ kişi)</li>
            <li>Araç Sınıfı 4: Kamyonet, Pickup</li>
            <li>Araç Sınıfı 5: Kamyon/Tır (&gt;3.5 ton)</li>
            <li className="text-red-600 font-medium">Avrasya Tüneli: 3, 4, 5. sınıf araçlar geçemez</li>
          </ul>
        </div>

        {/* Sprint C P7 + D P11: data manifest footer — single source of truth */}
        <DataSourceFooter manifestKey="otoyol-segments" />

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
