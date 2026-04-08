'use client';

/**
 * Sprint D P4 — Early Access / Waitlist Form
 *
 * Public beta doesn't accept payments — instead we capture interested
 * users via this form. Posts to /api/early-access (Sprint D P3).
 *
 * Reused from:
 *   - /odeme public variant (when paymentMode === paymentSandbox && !isAdminTestMode)
 *   - Homepage premium preview section (future)
 *   - Calculator page footers (future)
 *
 * Props allow the caller to tag submissions with a source_page for
 * attribution, and optionally pre-select an interest tier.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { trackEvent, trackError } from '@/lib/analytics';

type IlgiEnum = 'tekli' | 'karsilastirma' | 'ticari' | 'genel' | 'b2b_widget';

const ILGI_OPTIONS: Array<{ value: IlgiEnum; label: string }> = [
  { value: 'tekli', label: 'Tekli Rapor' },
  { value: 'karsilastirma', label: 'Karşılaştırma Raporu' },
  { value: 'ticari', label: 'Ticari Paket' },
  { value: 'b2b_widget', label: 'B2B Widget' },
  { value: 'genel', label: 'Genel ilgi' },
];

export interface EarlyAccessFormProps {
  source: 'odeme' | 'home_premium' | 'araclar_footer' | string;
  defaultIlgi?: IlgiEnum;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FormState {
  ad: string;
  email: string;
  ilgi: IlgiEnum;
  not_metni: string;
}

export default function EarlyAccessForm({
  source,
  defaultIlgi = 'genel',
}: EarlyAccessFormProps) {
  const [form, setForm] = useState<FormState>({
    ad: '',
    email: '',
    ilgi: defaultIlgi,
    not_metni: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (status === 'error') {
      setStatus('idle');
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad: form.ad,
          email: form.email,
          ilgi: form.ilgi,
          not_metni: form.not_metni || undefined,
          source_page: source,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        const errCode = json.error ?? 'server_error';
        setStatus('error');
        setErrorMsg(translateError(errCode));
        trackError('waitlist', errCode);
        return;
      }

      setStatus('success');
      trackEvent({
        category: 'premium',
        action: 'waitlist_signup',
        label: form.ilgi,
        metadata: { source, id: json.id },
      });
    } catch (err) {
      setStatus('error');
      setErrorMsg('Bağlantı hatası. Lütfen tekrar deneyin.');
      trackError('waitlist', err instanceof Error ? err.name : 'network');
    }
  };

  // Success state
  if (status === 'success') {
    return (
      <Card className="bg-green-50 border-green-200">
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-900 mb-2">
            Kaydınızı aldık 🎉
          </h3>
          <p className="text-green-800 max-w-md mb-4">
            Public beta sırasında sandbox ödeme testleri yapıyoruz. Gerçek
            ödeme açıldığında (ya da erken erişim başladığında) sizinle{' '}
            <strong>{form.email}</strong> üzerinden iletişime geçeceğiz.
          </p>
          <p className="text-sm text-green-700">
            Bu arada ücretsiz araçlarımızı deneyin →
          </p>
          <Link
            href="/araclar"
            className="mt-4 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Ücretsiz Araçlar
          </Link>
        </div>
      </Card>
    );
  }

  // Form state (idle / submitting / error)
  return (
    <Card>
      <div className="mb-6 flex items-center gap-3">
        <Mail className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-bold text-slate-900">
          Erken Erişim Listesi
        </h3>
      </div>

      <p className="text-sm text-slate-600 mb-6">
        Public beta'dayız — ödeme henüz aktif değil. Haber almak için
        e-posta adresinizi bırakın.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Ad Soyad *"
          type="text"
          value={form.ad}
          onChange={(e) => handleChange('ad', e.target.value)}
          placeholder="Adınız Soyadınız"
          required
          maxLength={100}
          disabled={status === 'submitting'}
        />

        <Input
          label="E-posta *"
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="ornek@example.com"
          required
          maxLength={200}
          disabled={status === 'submitting'}
        />

        <Select
          label="İlgilendiğiniz ürün *"
          options={ILGI_OPTIONS}
          value={form.ilgi}
          onChange={(e) => handleChange('ilgi', e.target.value as IlgiEnum)}
          required
          disabled={status === 'submitting'}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Not (opsiyonel)
          </label>
          <textarea
            value={form.not_metni}
            onChange={(e) => handleChange('not_metni', e.target.value)}
            placeholder="Özel bir ihtiyacınız varsa..."
            maxLength={1000}
            rows={3}
            disabled={status === 'submitting'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            Maksimum 1000 karakter. {form.not_metni.length}/1000
          </p>
        </div>

        {status === 'error' && errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={
            status === 'submitting' ||
            form.ad.trim().length < 2 ||
            form.email.trim().length === 0
          }
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Gönderiliyor...
            </>
          ) : (
            'Listeye Katıl'
          )}
        </Button>
      </form>

      <p className="mt-4 text-xs text-slate-500 text-center">
        Sprint D public beta —{' '}
        <Link
          href="/public-beta-policy"
          className="text-orange-600 hover:text-orange-700 underline"
        >
          Public Beta Policy
        </Link>
      </p>
    </Card>
  );
}

/**
 * Translates API validation error codes into user-friendly messages.
 */
function translateError(code: string): string {
  const map: Record<string, string> = {
    missing_ad: 'Lütfen adınızı girin.',
    ad_too_short: 'Ad en az 2 karakter olmalı.',
    ad_too_long: 'Ad en fazla 100 karakter olabilir.',
    missing_email: 'Lütfen e-posta adresinizi girin.',
    invalid_email: 'Geçerli bir e-posta adresi girin.',
    email_too_long: 'E-posta adresi çok uzun.',
    missing_ilgi: 'Lütfen bir ürün seçin.',
    invalid_ilgi: 'Geçersiz ürün seçimi.',
    note_too_long: 'Not en fazla 1000 karakter olabilir.',
    source_page_too_long: 'Kaynak sayfa bilgisi çok uzun.',
    db_error: 'Kaydınız alınamadı. Lütfen tekrar deneyin.',
    admin_client_unavailable:
      'Sunucu yapılandırma hatası. Lütfen yönetici ile iletişime geçin.',
    invalid_json: 'Form gönderme hatası.',
    server_error: 'Sunucu hatası. Lütfen tekrar deneyin.',
  };
  return map[code] ?? 'Bir hata oluştu. Lütfen tekrar deneyin.';
}
