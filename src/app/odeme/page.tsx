'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  CreditCard,
  User,
  ShoppingCart,
  Loader2,
  Info,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PRODUCTS } from '@/lib/payment/products';
import type { PaymentProduct } from '@/lib/payment/types';
import {
  derivePaymentState,
  isCheckoutActive,
  isCallbackLanding,
  type PaymentState,
} from '@/lib/payment/state-machine';

/** Step indicator at the top of the flow */
function StepIndicator({ current }: { current: number }) {
  const steps = [
    { num: 1, label: 'Paket Secimi', icon: ShoppingCart },
    { num: 2, label: 'Bilgileriniz', icon: User },
    { num: 3, label: 'Odeme', icon: CreditCard },
  ];
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, idx) => {
        const Icon = s.icon;
        const active = current === s.num;
        const done = current > s.num;
        return (
          <React.Fragment key={s.num}>
            {idx > 0 && (
              <div
                className={`h-0.5 w-8 sm:w-12 ${done ? 'bg-orange-500' : 'bg-gray-600'}`}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  active
                    ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                    : done
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-gray-600 text-gray-500'
                }`}
              >
                {done ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs ${active ? 'text-orange-400' : done ? 'text-orange-400' : 'text-gray-500'}`}
              >
                {s.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/** Step 1: Product selection */
function ProductSelection({
  onSelect,
}: {
  onSelect: (p: PaymentProduct) => void;
}) {
  const featureMap: Record<string, string[]> = {
    tekli: [
      'Detayli maliyet analizi',
      '12 ve 36 ay secenegi',
      'KM basi maliyet hesaplamasi',
      'Finansal oneriler',
    ],
    karsilastirma: [
      'Tum tekli rapor ozellikleri',
      'Araclarin yan yana karsilastirmasi',
      'Al/Kirala/Bekle analizi',
      'En uygun secim onerisi',
    ],
    ticari: [
      'Tum karsilastirma paketi ozellikleri',
      'Kurumsal raporlama',
      'Filo analizi',
      'Oncelikli destek',
    ],
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6 text-center">
        Paketinizi Secin
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRODUCTS.map((product) => (
          <button
            key={product.id}
            onClick={() => onSelect(product)}
            className="border border-gray-700 bg-[#1B2A4A]/50 rounded-lg p-6 text-left hover:border-orange-500/50 hover:bg-[#1B2A4A]/80 transition-all group cursor-pointer"
          >
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
              {product.name}
            </h3>
            <p className="text-gray-400 text-sm mb-3">{product.description}</p>
            <p className="text-3xl font-bold text-orange-400 mb-4">
              &#8378;{product.price}
            </p>
            <ul className="space-y-2 text-sm text-gray-300 mb-4">
              {(featureMap[product.id] || []).map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">&#8226;</span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-center gap-2 bg-orange-500/10 text-orange-400 rounded-lg py-2 text-sm font-semibold group-hover:bg-orange-500 group-hover:text-white transition-colors">
              Sec
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Step 2: Customer info form */
function CustomerForm({
  onSubmit,
  onBack,
  selectedProduct,
}: {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => void;
  onBack: () => void;
  selectedProduct: PaymentProduct;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Ad gerekli';
    if (!lastName.trim()) errs.lastName = 'Soyad gerekli';
    if (!email.trim() || !email.includes('@')) errs.email = 'Gecerli e-posta gerekli';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10)
      errs.phone = 'Gecerli telefon gerekli';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim() });
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold text-white mb-2 text-center">
        Iletisim Bilgileri
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6">
        Secilen paket:{' '}
        <span className="text-orange-400 font-semibold">
          {selectedProduct.name} — &#8378;{selectedProduct.price}
        </span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Ad</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full px-3 py-2 bg-[#0F1722] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.firstName ? 'border-red-500' : 'border-gray-600'}`}
              placeholder="Adiniz"
            />
            {errors.firstName && (
              <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Soyad</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full px-3 py-2 bg-[#0F1722] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.lastName ? 'border-red-500' : 'border-gray-600'}`}
              placeholder="Soyadiniz"
            />
            {errors.lastName && (
              <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">E-posta</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 bg-[#0F1722] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.email ? 'border-red-500' : 'border-gray-600'}`}
            placeholder="ornek@mail.com"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Telefon</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full px-3 py-2 bg-[#0F1722] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.phone ? 'border-red-500' : 'border-gray-600'}`}
            placeholder="+90 5XX XXX XXXX"
          />
          {errors.phone && (
            <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-2 px-4 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Geri
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Devam Et
          </button>
        </div>
      </form>
    </div>
  );
}

/** Step 3: iyzico checkout form */
function CheckoutStep({
  product,
  customer,
  onBack,
}: {
  product: PaymentProduct;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formHtml, setFormHtml] = useState<string | null>(null);

  const initPayment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customer,
        }),
      });
      const data = await res.json();
      if (res.ok && data.checkoutFormContent) {
        setFormHtml(data.checkoutFormContent);
      } else {
        setError(data.error || 'Odeme formu yuklenemedi');
      }
    } catch {
      setError('Baglanti hatasi. Lutfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [product.id, customer]);

  useEffect(() => {
    initPayment();
  }, [initPayment]);

  // After iyzico form HTML is injected, run any script tags it contains
  useEffect(() => {
    if (!formHtml) return;
    const container = document.getElementById('iyzico-checkout-form');
    if (!container) return;
    const scripts = container.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [formHtml]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-300">Odeme formu hazirlaniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-300 mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onBack}
            className="py-2 px-6 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Geri Don
          </button>
          <button
            onClick={initPayment}
            className="py-2 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-white mb-2 text-center">
        Odeme
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6">
        {product.name} — &#8378;{product.price}
      </p>
      <div className="bg-[#0F1722] border border-gray-700 rounded-lg p-4">
        {formHtml && (
          <div
            id="iyzico-checkout-form"
            dangerouslySetInnerHTML={{ __html: formHtml }}
          />
        )}
      </div>
      <button
        onClick={onBack}
        className="mt-4 text-gray-400 hover:text-white text-sm flex items-center gap-1 mx-auto cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Geri don
      </button>
    </div>
  );
}

/** Callback result display */
function PaymentResult() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const paymentId = searchParams.get('paymentId');
  const message = searchParams.get('message');

  if (!status) return null;

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Odeme Basarili!
        </h2>
        <p className="text-gray-300 mb-2">
          Raporunuz hazirlanmaktadir.
        </p>
        {paymentId && (
          <p className="text-gray-500 text-sm mb-6">
            Islem No: {paymentId}
          </p>
        )}
        <Link
          href="/rapor"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Raporlara Git
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-8">
      <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">
        Odeme Basarisiz
      </h2>
      <p className="text-gray-300 mb-6">
        {message ? decodeURIComponent(message) : 'Bir hata olustu. Lutfen tekrar deneyin.'}
      </p>
      <Link
        href="/odeme"
        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
      >
        Tekrar Dene
      </Link>
    </div>
  );
}

/** Coming soon banner when payment is not enabled */
function ComingSoon() {
  const plans = PRODUCTS.filter((p) => p.id !== 'ticari').map((p) => ({
    name: p.name,
    price: String(p.price),
    description: p.description,
    features:
      p.id === 'tekli'
        ? [
            'Detayli maliyet analizi',
            '12 ve 36 ay secenegi',
            'KM basi maliyet hesaplamasi',
            'Finansal oneriler',
          ]
        : [
            'Tum tekli rapor ozellikleri',
            'Araclarin yan yana karsilastirmasi',
            'Al/Kirala/Bekle analizi',
            'En uygun secim onerisi',
          ],
  }));

  return (
    <>
      {/* Coming Soon Banner */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-8 text-center mb-10">
        <Clock className="w-16 h-16 text-orange-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">
          Odeme Sistemi Hazirlaniyor
        </h2>
        <p className="text-gray-300 max-w-lg mx-auto">
          Guvenli odeme altyapimiz uzerinde calisiyoruz. Kredi karti ve banka
          karti ile odeme secenekleri yakinda hizmetinizde olacak.
        </p>
      </div>

      {/* Plan Info */}
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
              &#8378;{plan.price}
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">&#8226;</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Free tools link */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
        <Info className="w-6 h-6 text-blue-400 mx-auto mb-3" />
        <p className="text-gray-300 text-sm mb-4">
          Odeme sistemi aktif olana kadar{' '}
          <strong className="text-white">5 ucretsiz aracimizi</strong>{' '}
          kullanarak MTV, yakit, otoyol, muayene ve rota maliyet
          hesaplamalarinizi yapabilirsiniz.
        </p>
        <Link
          href="/"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
        >
          Ucretsiz Araclara Git
        </Link>
      </div>
    </>
  );
}

/** Inner component that uses useSearchParams (must be wrapped in Suspense) */
function OdemeContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const callbackMessage = searchParams.get('message');
  const callbackPaymentId = searchParams.get('paymentId');

  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<PaymentProduct | null>(
    null
  );
  const [customer, setCustomer] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null>(null);

  // Payment state derived from /api/health + callback query params.
  // Null until /api/health fetch completes.
  const [paymentState, setPaymentState] = useState<PaymentState | null>(null);

  // Fetch /api/health to determine payment state (Sprint B: state machine wiring)
  useEffect(() => {
    let cancelled = false;

    async function detectState() {
      // If callback status present, derive state directly without /api/health
      if (status) {
        const state = derivePaymentState({
          paymentEnabled: true, // callback presence implies payment was enabled
          iyzicoMode: null,
          callbackStatus: status,
          callbackMessage,
          paymentId: callbackPaymentId,
        });
        if (!cancelled) setPaymentState(state);
        return;
      }

      // Fetch /api/health to get server-side flag state
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (!res.ok) throw new Error('health_fetch_failed');
        const health = await res.json();

        const state = derivePaymentState({
          paymentEnabled: health?.flags?.paymentEnabled?.enabled === true,
          iyzicoMode: health?.services?.iyzico?.mode ?? null,
          callbackStatus: null,
          callbackMessage: null,
          paymentId: null,
        });
        if (!cancelled) setPaymentState(state);
      } catch {
        // Fallback: if /api/health fails, treat as disabled_no_env (safe default)
        if (!cancelled) {
          setPaymentState(
            derivePaymentState({
              paymentEnabled: false,
              iyzicoMode: null,
              callbackStatus: null,
              callbackMessage: null,
              paymentId: null,
            }),
          );
        }
      }
    }

    void detectState();
    return () => {
      cancelled = true;
    };
  }, [status, callbackMessage, callbackPaymentId]);

  // Loading state while fetching /api/health
  if (paymentState === null) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Yukleniyor...</p>
      </div>
    );
  }

  // Callback landing (success / failed / callback_error)
  if (isCallbackLanding(paymentState)) {
    return <PaymentResult />;
  }

  // Payment not enabled — show coming soon
  if (!isCheckoutActive(paymentState)) {
    return <ComingSoon />;
  }

  // Payment flow (ready_sandbox or ready_production)
  return (
    <>
      <StepIndicator current={step} />

      {step === 1 && (
        <ProductSelection
          onSelect={(p) => {
            setSelectedProduct(p);
            setStep(2);
          }}
        />
      )}

      {step === 2 && selectedProduct && (
        <CustomerForm
          selectedProduct={selectedProduct}
          onBack={() => setStep(1)}
          onSubmit={(data) => {
            setCustomer(data);
            setStep(3);
          }}
        />
      )}

      {step === 3 && selectedProduct && customer && (
        <CheckoutStep
          product={selectedProduct}
          customer={customer}
          onBack={() => setStep(2)}
        />
      )}

      {/* Dev-only state indicator */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-8 text-center text-xs text-gray-600">
          <code>state: {paymentState.name}</code>
        </div>
      )}
    </>
  );
}

export default function OdemePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0F1722]">
      {/* Header */}
      <div className="bg-[#1B2A4A] border-b border-orange-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/rapor"
            className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Rapora Don
          </Link>
          <h1 className="text-3xl font-bold text-white">Premium Raporlar</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Suspense
          fallback={
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Yukleniyor...</p>
            </div>
          }
        >
          <OdemeContent />
        </Suspense>
      </div>
    </div>
  );
}
