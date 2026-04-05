'use client';

import React from 'react';
import { Clock, ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';

/**
 * Ödeme Sayfası — Henüz aktif değil
 * iyzico entegrasyonu tamamlandığında bu sayfa gerçek ödeme akışına dönüşecek.
 */
export default function OdemePage() {
  const plans = [
    {
      name: 'Tekli Rapor',
      price: '99',
      description: 'Tek bir araç için detaylı TCO analizi',
      features: [
        'Detaylı maliyet analizi',
        '12 ve 36 ay seçeneği',
        'KM başı maliyet hesaplaması',
        'Finansal öneriler',
      ],
    },
    {
      name: 'Karşılaştırma Paketi',
      price: '149',
      description: 'Birden fazla araç karşılaştırma raporu',
      features: [
        'Tüm tekli rapor özellikleri',
        'Araçların yan yana karşılaştırması',
        'Al/Kirala/Bekle analizi',
        'En uygun seçim önerisi',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0F1722]">
      {/* Header */}
      <div className="bg-[#1B2A4A] border-b border-orange-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/rapor" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Rapora Dön
          </Link>
          <h1 className="text-3xl font-bold text-white">
            Premium Raporlar
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Coming Soon Banner */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-8 text-center mb-10">
          <Clock className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">
            Ödeme Sistemi Hazırlanıyor
          </h2>
          <p className="text-gray-300 max-w-lg mx-auto">
            Güvenli ödeme altyapımız üzerinde çalışıyoruz.
            Kredi kartı ve banka kartı ile ödeme seçenekleri yakında hizmetinizde olacak.
          </p>
        </div>

        {/* Plan Info — bilgilendirme amaçlı, tıklanabilir değil */}
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          Planlanan Paketler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="border border-gray-700 bg-[#1B2A4A]/50 rounded-lg p-6 opacity-70"
            >
              <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
              <p className="text-gray-400 text-sm mb-3">{plan.description}</p>
              <p className="text-3xl font-bold text-orange-400 mb-4">
                ₺{plan.price}
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Ücretsiz araçlar yönlendirmesi */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
          <Info className="w-6 h-6 text-blue-400 mx-auto mb-3" />
          <p className="text-gray-300 text-sm mb-4">
            Ödeme sistemi aktif olana kadar{' '}
            <strong className="text-white">5 ücretsiz aracımızı</strong>{' '}
            kullanarak MTV, yakıt, otoyol, muayene ve rota maliyet hesaplamalarınızı yapabilirsiniz.
          </p>
          <Link
            href="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
          >
            Ücretsiz Araçlara Git
          </Link>
        </div>
      </div>
    </div>
  );
}
