'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { Zap, Info } from 'lucide-react';
import { inspectionData } from '@/data/muayene';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';

export default function MuayeneUcreti() {
  const [selectedVehicleType, setSelectedVehicleType] = useState('otomobil');
  const [selectedInspectionType, setSelectedInspectionType] = useState('Periyodik Muayene (1-3 yaş)');
  const [vehicleAge, setVehicleAge] = useState('2');

  const selectedVehicle = useMemo(() => {
    return inspectionData.vehicleTypes.find(v => v.id === selectedVehicleType);
  }, [selectedVehicleType]);

  const inspectionFee = useMemo(() => {
    return selectedVehicle?.fees.find(f => f.inspectionType === selectedInspectionType)?.amount || 0;
  }, [selectedVehicle, selectedInspectionType]);

  const emissionFee = useMemo(() => {
    const isGasoline = selectedInspectionType.includes('Benzin');
    const isDiesel = selectedInspectionType.includes('Dizel');

    if (selectedVehicleType === 'otomobil' || selectedVehicleType === 'kamyonet') {
      if (isGasoline) return 50;
      if (isDiesel) return 60;
    } else if (selectedVehicleType === 'kamyon') {
      if (isDiesel) return 70;
    } else if (selectedVehicleType === 'tirlar') {
      if (isDiesel) return 80;
    }
    return 0;
  }, [selectedVehicleType, selectedInspectionType]);

  const totalCost = inspectionFee + emissionFee;

  const nextInspectionDate = useMemo(() => {
    const vehicleAgeNum = parseInt(vehicleAge) || 0;
    if (vehicleAgeNum <= 3) return '1 yıl sonra';
    if (vehicleAgeNum <= 10) return '2 yıl sonra';
    return 'Yıllık';
  }, [vehicleAge]);

  const vehicleTypes = inspectionData.vehicleTypes;
  const inspectionTypes = selectedVehicle?.fees.map(f => f.inspectionType) || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Muayene Ücreti Hesaplama</h1>
          <p className="text-lg text-slate-600">TÜVTÜRK 2026 tarife ücretleri</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Select
            label="Araç Tipi"
            options={vehicleTypes.map(vt => ({ value: vt.id, label: vt.displayName }))}
            value={selectedVehicleType}
            onChange={(e) => setSelectedVehicleType(e.target.value)}
          />

          <Select
            label="Muayene Türü"
            options={inspectionTypes.map(type => ({ value: type, label: type }))}
            value={selectedInspectionType}
            onChange={(e) => setSelectedInspectionType(e.target.value)}
          />

          <Select
            label="Araç Yaşı (Yıl)"
            options={Array.from({ length: 31 }, (_, i) => i).map(age => ({
              value: age.toString(),
              label: age === 0 ? 'Yeni araç' : `${age} yaş`
            }))}
            value={vehicleAge}
            onChange={(e) => setVehicleAge(e.target.value)}
          />
        </div>

        <Card variant="highlighted" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-slate-900">Toplam Muayene Ücreti</h2>
            </div>
            <ConfidenceBadge level="kesin" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Muayene Ücreti</p>
              <p className="text-2xl font-bold text-slate-900">
                {inspectionFee.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>
            <div className="bg-white bg-opacity-50 p-4 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Egzoz Ölçüm Ücreti</p>
              <p className="text-2xl font-bold text-slate-900">
                {emissionFee.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>
            <div className="bg-white bg-opacity-50 p-4 rounded-lg border-2 border-green-300">
              <p className="text-xs text-slate-600 mb-1 font-semibold">TOPLAM</p>
              <p className="text-3xl font-bold text-slate-900">
                {totalCost.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Sonraki Muayene Tarihi</h2>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-slate-600 text-sm mb-2">Araç yaşına göre sonraki muayene tahmini:</p>
            <p className="text-2xl font-bold text-slate-900">{nextInspectionDate}</p>
          </div>
        </Card>

        <Card className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Muayene Bilgileri</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Araç Tipi</p>
              <p className="font-semibold text-slate-900">{selectedVehicle?.displayName}</p>
              <p className="text-xs text-slate-600 mt-1">{selectedVehicle?.description}</p>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-slate-600 mb-1">Muayene Türü</p>
              <p className="font-semibold text-slate-900">{selectedInspectionType}</p>
            </div>
          </div>
        </Card>

        <Card className="mb-8 bg-blue-50 border border-blue-200">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-900 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Bilgilendirme</h3>
              <p className="text-sm text-blue-900 mb-3">
                <strong>Kaynak:</strong> TÜVTÜRK 2026 Tarifesi
              </p>
              <p className="text-sm text-blue-900 mb-3">
                Motorlu Taşıtlar Muayenesi, araçların teknik şartlarını ve emisyon ölçümlerini kontrol eden zorunlu bir prosedürdür. Muayene başarısız olan araçlar için tekrar muayene ücretinin ödenmesi gerekir.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-blue-900">
                <li>İlk muayene: Yeni araçlar için yapılan ilk muayene</li>
                <li>Periyodik muayene: Düzenli aralıklarla yapılan muayene</li>
                <li>Tekrar muayene: Başarısız olan araçlar için tekrarlanan muayene</li>
                <li>Egzoz ölçüm: Emisyon standartlarının kontrolü</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Güncellik İbaresi */}
        <div className="text-center text-xs text-gray-500 py-3 border-t border-gray-200">
          <p>Kaynak: TÜVTÜRK 2026 Tarifesi | Son güncelleme: 5 Nisan 2026</p>
          <p className="mt-1">Veriler 5 Nisan 2026 itibarıyla günceldir.</p>
        </div>

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
