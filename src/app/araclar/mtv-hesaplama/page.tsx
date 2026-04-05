'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { Zap, Info } from 'lucide-react';
import { mtvData } from '@/data/mtv';
import ConfidenceBadge from '@/components/ui/ConfidenceBadge';

const engineSizes = ['1-1300cc', '1301-1600cc', '1601-1800cc', '1801-2000cc', '2001-2500cc', '2501-3000cc', '3001-3500cc', '3501-4000cc', '4001cc+'];
const fuelTypes = ['Benzin', 'Dizel', 'LPG', 'Hibrit', 'Elektrik'];
const currentYear = new Date().getFullYear();
const ageGroups = ['1-3', '4-6', '7-11', '12-15', '16+'];

export default function MTVHesaplama() {
  const [selectedEngine, setSelectedEngine] = useState('1601-1800cc');
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedFuel, setSelectedFuel] = useState('Benzin');

  const calculateMTV = useMemo(() => {
    const year = parseInt(selectedYear);
    const vehicleAge = currentYear - year;
    let ageGroup = '1-3';
    if (vehicleAge >= 4 && vehicleAge <= 6) ageGroup = '4-6';
    else if (vehicleAge >= 7 && vehicleAge <= 11) ageGroup = '7-11';
    else if (vehicleAge >= 12 && vehicleAge <= 15) ageGroup = '12-15';
    else if (vehicleAge >= 16) ageGroup = '16+';

    let bracket;
    if (selectedFuel === 'Benzin') {
      bracket = mtvData.gasoline.find(b => b.displayName === selectedEngine);
    } else if (selectedFuel === 'Dizel') {
      bracket = mtvData.diesel.find(b => b.displayName === selectedEngine);
    } else if (selectedFuel === 'LPG') {
      bracket = mtvData.lpg.find(b => b.displayName === selectedEngine);
    } else if (selectedFuel === 'Hibrit') {
      bracket = mtvData.hybrid.find(b => b.displayName === selectedEngine);
    }

    if (selectedFuel === 'Elektrik') {
      const mtvAmount = mtvData.electric[ageGroup as keyof typeof mtvData.electric] || 0;
      return { amount: mtvAmount, ageGroup };
    }

    const mtvAmount = bracket?.ageGroups[ageGroup] || 0;
    return { amount: mtvAmount, ageGroup };
  }, [selectedEngine, selectedYear, selectedFuel]);

  const comparisonTable = useMemo(() => {
    let bracket;
    if (selectedFuel === 'Benzin') {
      bracket = mtvData.gasoline.find(b => b.displayName === selectedEngine);
    } else if (selectedFuel === 'Dizel') {
      bracket = mtvData.diesel.find(b => b.displayName === selectedEngine);
    } else if (selectedFuel === 'LPG') {
      bracket = mtvData.lpg.find(b => b.displayName === selectedEngine);
    } else if (selectedFuel === 'Hibrit') {
      bracket = mtvData.hybrid.find(b => b.displayName === selectedEngine);
    }

    if (selectedFuel === 'Elektrik') {
      return ageGroups.map(group => ({
        ageGroup: group,
        amount: mtvData.electric[group as keyof typeof mtvData.electric]
      }));
    }

    if (!bracket) return [];
    return ageGroups.map(group => ({
      ageGroup: group,
      amount: bracket!.ageGroups[group] || 0
    }));
  }, [selectedEngine, selectedFuel]);

  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">MTV Hesaplama 2026</h1>
          <p className="text-lg text-slate-600">Araçınızın yıllık Motorlu Taşıtlar Vergisini hesaplayın</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Select
            label="Motor Hacmi"
            options={engineSizes.map(size => ({ value: size, label: size }))}
            value={selectedEngine}
            onChange={(e) => setSelectedEngine(e.target.value)}
          />

          <Select
            label="Yapım Yılı"
            options={years.map(year => ({ value: year.toString(), label: year.toString() }))}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          />

          <Select
            label="Yakıt Tipi"
            options={fuelTypes.map(fuel => ({ value: fuel, label: fuel }))}
            value={selectedFuel}
            onChange={(e) => setSelectedFuel(e.target.value)}
          />
        </div>

        <Card variant="highlighted" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold text-slate-900">Yıllık MTV Tutarı</h2>
            </div>
            <ConfidenceBadge level="kesin" />
          </div>
          <div className="text-5xl font-bold text-slate-900 mb-2">
            {calculateMTV.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </div>
          <p className="text-slate-600">
            {selectedEngine} • {selectedFuel} • {currentYear - parseInt(selectedYear)} yaşında
          </p>
        </Card>

        <Card className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Yaş Gruplarına Göre Karşılaştırma</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-900">Yaş Grubu</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-900">Yıllık Tutar</th>
                </tr>
              </thead>
              <tbody>
                {comparisonTable.map((row, idx) => (
                  <tr key={idx} className={`border-t ${calculateMTV.ageGroup === row.ageGroup ? 'bg-orange-50' : ''}`}>
                    <td className="px-4 py-3 text-slate-700">{row.ageGroup} yıl</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {row.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="mb-8 bg-blue-50 border border-blue-200">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-900 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Bilgilendirme</h3>
              <p className="text-sm text-blue-900 mb-2">
                <strong>Kaynak:</strong> GİB 2026 MTV Tebliği
              </p>
              <p className="text-sm text-blue-900">
                MTV (Motorlu Taşıtlar Vergisi), her yıl ödenmesi gereken bir vergisidir. Araç fiyatı, motor hacmi ve yaşı verginin miktarını belirler. Elektrik araçlar vergi muafiyetinden yararlanmaktadır.
              </p>
            </div>
          </div>
        </Card>

        {/* Güncellik İbaresi */}
        <div className="text-center text-xs text-gray-500 py-3 border-t border-gray-200">
          <p>Kaynak: {mtvData.sourceLabel} | Tarife tarihi: {mtvData.effectiveDate}</p>
          <p className="mt-1">Veriler {mtvData.lastUpdated} itibarıyla günceldir.</p>
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
