'use client';

import React, { useState } from 'react';
import { Check, Lock, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

type ProductType = 'tekli' | 'karsilastirma' | 'ticari';
type PaymentStep = 'selection' | 'contact' | 'payment' | 'success';

interface Product {
  id: ProductType;
  name: string;
  price: number;
  description: string;
  features: string[];
}

const PRODUCTS: Product[] = [
  {
    id: 'tekli',
    name: 'Tekli Rapor',
    price: 99,
    description: 'Tek bir araç için detaylı TCO analizi',
    features: [
      'Detaylı maliyet analizi',
      '12 ve 36 ay seçeneği',
      'KM başı maliyet hesaplaması',
      'Finansal öneriler',
    ],
  },
  {
    id: 'karsilastirma',
    name: 'Karşılaştırma Paketi',
    price: 149,
    description: '3 araç karşılaştırma raporu',
    features: [
      'Tüm tekli rapor özellikleri',
      '3 aracın yan yana karşılaştırması',
      'Al/Kirala/Bekle analizi',
      'Senaryo simülasyonu',
      'En uygun seçim önerisi',
    ],
  },
  {
    id: 'ticari',
    name: 'Ticari Paket',
    price: 249,
    description: 'İşletmeler için unlimited rapor',
    features: [
      'Tüm karşılaştırma paketi özellikleri',
      'Sınırsız rapor oluşturma (30 gün)',
      'Müşteri raporları ihraç etme',
      'Özel brandinglı raporlar',
      'Email desteği',
      'API erişimi',
    ],
  },
];

interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// PaymentData arayüzü iyzico entegrasyonu sonrası aktif olacak

export default function OdemePage() {
  const [step, setStep] = useState<PaymentStep>('selection');
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [contactData, setContactData] = useState<ContactData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  // paymentData state'i iyzico entegrasyonu sonrası aktif olacak

  const selectedProductInfo = PRODUCTS.find(p => p.id === selectedProduct);

  const handleSelectProduct = (productId: ProductType) => {
    setSelectedProduct(productId);
    setStep('contact');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactData.firstName && contactData.lastName && contactData.email && contactData.phone) {
      setStep('payment');
    }
  };

  // handlePaymentSubmit, formatCardNumber, formatExpiryDate
  // iyzico entegrasyonu sonrası aktif olacak

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
            Siparişi Tamamla
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12 gap-4">
          {[
            { num: 1, label: 'Paket Seçimi', done: step !== 'selection' },
            { num: 2, label: 'Bilgiler', done: ['payment', 'success'].includes(step) },
            { num: 3, label: 'Ödeme', done: step === 'success' },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                s.done ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
              }`}>
                {s.done ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-sm font-medium ${s.done ? 'text-green-400' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {idx < 2 && <div className={`h-1 w-12 ${s.done ? 'bg-green-500' : 'bg-gray-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: Product Selection */}
        {step === 'selection' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Hangi Paketi İstiyorsunuz?
              </h2>
              <p className="text-gray-400">
                Özel ihtiyaçlarınız için en uygun paketi seçin
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRODUCTS.map((product) => (
                <div
                  key={product.id}
                  className={`relative rounded-lg p-6 transition-all cursor-pointer border-2 ${
                    selectedProduct === product.id
                      ? 'border-orange-500 bg-[#1B2A4A]/80'
                      : 'border-gray-700 bg-[#1B2A4A]/50 hover:border-gray-600'
                  }`}
                  onClick={() => handleSelectProduct(product.id)}
                >
                  {product.id === 'karsilastirma' && (
                    <div className="absolute -top-3 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Popüler
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-white mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {product.description}
                  </p>

                  <div className="mb-6 py-4 border-y border-gray-700">
                    <p className="text-4xl font-bold text-orange-400">
                      ₺{product.price}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {product.id === 'ticari' ? '30 gün' : 'Bir kerelik'}
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full mt-6 py-3 rounded-lg font-bold transition-all ${
                      selectedProduct === product.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {selectedProduct === product.id ? 'Seçili' : 'Seç'}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => selectedProduct && setStep('contact')}
              disabled={!selectedProduct}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all text-lg"
            >
              Devam Et
            </button>
          </div>
        )}

        {/* STEP 2: Contact Information */}
        {step === 'contact' && selectedProductInfo && (
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Sipariş Özeti</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Paket</p>
                  <p className="text-white font-semibold">{selectedProductInfo.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Toplam</p>
                  <p className="text-2xl font-bold text-orange-400">
                    ₺{selectedProductInfo.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleContactSubmit} className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8 space-y-6">
              <h2 className="text-2xl font-bold text-white">
                İletişim Bilgileri
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Ad
                  </label>
                  <input
                    type="text"
                    value={contactData.firstName}
                    onChange={(e) => setContactData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Soyadı
                  </label>
                  <input
                    type="text"
                    value={contactData.lastName}
                    onChange={(e) => setContactData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={contactData.email}
                    onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={contactData.phone}
                    onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all"
              >
                Ödeme Bilgilerine Geç
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Payment — iyzico entegrasyonu bekliyor */}
        {step === 'payment' && selectedProductInfo && (
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Sipariş Özeti</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <p className="text-gray-400">{selectedProductInfo.name}</p>
                  <p className="text-white">₺{selectedProductInfo.price}</p>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                <p className="text-white font-semibold">Toplam Tutar</p>
                <p className="text-2xl font-bold text-orange-400">
                  ₺{selectedProductInfo.price}
                </p>
              </div>
            </div>

            {/* iyzico Entegrasyonu Bilgi Alanı */}
            <div className="bg-[#1B2A4A]/50 border border-orange-500/20 rounded-lg p-8 space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Ödeme Yöntemi
              </h2>

              {/* Coming Soon Banner */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6 text-center">
                <Clock className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  iyzico Entegrasyonu Yakında Aktif Olacak
                </h3>
                <p className="text-gray-300 mb-4">
                  Güvenli ödeme altyapımız iyzico ile entegre ediliyor.
                  Kredi kartı, banka kartı ve taksitli ödeme seçenekleri çok yakında hizmetinizde olacak.
                </p>
                <p className="text-sm text-gray-400">
                  Bilgilendirilmek isterseniz{' '}
                  <span className="text-orange-400 font-medium">{contactData.email}</span>{' '}
                  adresine haber vereceğiz.
                </p>
              </div>

              {/* Trust Signals */}
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Lock className="w-4 h-4 text-orange-500" />
                  <span>256-bit SSL Şifrelemeleri</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-orange-500" />
                  <span>Para İade Garantisi (30 gün)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-orange-500" />
                  <span>iyzico Güvencesi</span>
                </div>
              </div>

              <button
                type="button"
                disabled
                className="w-full bg-gray-700 text-gray-400 font-bold py-4 rounded-lg cursor-not-allowed text-lg"
              >
                Çok Yakında Hizmetinizde
              </button>

              <p className="text-xs text-gray-400 text-center">
                Ödeme sistemi aktif olduğunda{' '}
                <span className="underline">Kullanıcı Koşulları</span> ve{' '}
                <span className="underline">Gizlilik Politikası</span>&apos;nı kabul etmiş olursunuz.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 'success' && selectedProductInfo && (
          <div className="text-center space-y-8">
            <div className="bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/30 rounded-lg p-12">
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-2">
                Ödeme Başarılı!
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                {contactData.firstName} {contactData.lastName}, siparişiniz için teşekkürler.
              </p>

              <div className="bg-[#1B2A4A]/50 border border-gray-700 rounded-lg p-6 mb-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <p className="text-gray-400">Paket</p>
                    <p className="text-white font-semibold">{selectedProductInfo.name}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">Tutar</p>
                    <p className="text-white font-semibold">₺{selectedProductInfo.price}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">E-posta</p>
                    <p className="text-white font-semibold">{contactData.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <p className="text-gray-300 text-sm">
                  <strong>Raporunuz hazırlanıyor...</strong><br />
                  Yakında e-posta adresinize erişim linkini göndereceğiz. Lütfen spam klasörünü kontrol edin.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/rapor"
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all text-center"
              >
                Yeni Rapor Oluştur
              </Link>
              <Link
                href="/"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all text-center"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
