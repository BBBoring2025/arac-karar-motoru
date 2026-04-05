/**
 * Payment Konfigürasyonu
 *
 * .env dosyasından iyzico anahtarlarını okur.
 * Anahtarlar yoksa ödeme sistemi devre dışıdır.
 */

import type { PaymentConfig } from './types';

/**
 * Ödeme sistemi aktif mi kontrol et
 * iyzico env değişkenleri tanımlanmamışsa false döner
 */
export function isPaymentEnabled(): boolean {
  return !!(
    process.env.IYZICO_API_KEY &&
    process.env.IYZICO_SECRET_KEY
  );
}

/**
 * iyzico konfigürasyonunu döndür
 * Sadece server-side kullanılmalı (API route içinde)
 *
 * @throws Error — env değişkenleri eksikse
 */
export function getPaymentConfig(): PaymentConfig {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error(
      'iyzico env değişkenleri eksik: IYZICO_API_KEY ve IYZICO_SECRET_KEY gerekli. ' +
      'Ödeme sistemi henüz yapılandırılmamış.'
    );
  }

  const isSandbox = baseUrl.includes('sandbox');

  return { apiKey, secretKey, baseUrl, isSandbox };
}
