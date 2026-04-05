/**
 * Ödeme İşlemcisi — iyzico Entegrasyonu
 *
 * DURUM: STUB — Gerçek ödeme işlemi henüz aktif değil.
 *
 * Entegrasyon adımları:
 * 1. iyzico merchant hesabı aç
 * 2. IYZICO_API_KEY ve IYZICO_SECRET_KEY .env'e ekle
 * 3. iyzico npm paketi kur: npm install iyzipay
 * 4. Bu dosyadaki TODO'ları tamamla
 * 5. Webhook endpoint oluştur (ödeme callback)
 * 6. Test ortamında (sandbox) doğrula
 * 7. Production'a geç
 */

import type { PaymentRequest, PaymentResult } from './types';
import { isPaymentEnabled } from './config';

/**
 * Ödeme işlemi başlat
 *
 * @param request Ödeme talebi (ürün + müşteri bilgisi)
 * @returns Ödeme sonucu
 *
 * TODO: iyzico checkout form entegrasyonu
 * - iyzico checkout form oluştur (PCI DSS uyumlu, kart bilgisi sunucuya gelmez)
 * - 3D Secure desteği ekle
 * - Callback URL yapılandır
 */
export async function processPayment(
  _request: PaymentRequest
): Promise<PaymentResult> {
  // Ödeme sistemi aktif değilse hata dön
  if (!isPaymentEnabled()) {
    return {
      success: false,
      status: 'failure',
      errorMessage: 'Ödeme sistemi henüz aktif değil. Yakında hizmetinizde olacak.',
      errorCode: 'PAYMENT_NOT_CONFIGURED',
    };
  }

  // TODO: Gerçek iyzico entegrasyonu burada yapılacak
  // const config = getPaymentConfig();
  // const iyzipay = new Iyzipay({ ...config });
  // const checkoutForm = await iyzipay.checkoutFormInitialize({ ... });
  // return { success: true, status: 'processing', transactionId: checkoutForm.token };

  console.warn('[Payment] processPayment çağrıldı ama henüz gerçek entegrasyon yok');

  return {
    success: false,
    status: 'failure',
    errorMessage: 'Ödeme sistemi yapılandırılmamış.',
    errorCode: 'NOT_IMPLEMENTED',
  };
}

/**
 * Ödeme durumunu sorgula
 *
 * TODO: iyzico payment retrieve API entegrasyonu
 */
export async function getPaymentStatus(
  transactionId: string
): Promise<PaymentResult> {
  if (!isPaymentEnabled()) {
    return {
      success: false,
      status: 'failure',
      errorMessage: 'Ödeme sistemi aktif değil.',
      errorCode: 'PAYMENT_NOT_CONFIGURED',
    };
  }

  // TODO: iyzipay.retrieve({ paymentId: transactionId })
  console.warn(`[Payment] getPaymentStatus(${transactionId}) — henüz entegre değil`);

  return {
    success: false,
    status: 'pending',
    transactionId,
  };
}

/**
 * Para iadesi başlat
 *
 * TODO: iyzico refund API entegrasyonu
 */
export async function processRefund(
  transactionId: string,
  _amount?: number
): Promise<PaymentResult> {
  if (!isPaymentEnabled()) {
    return {
      success: false,
      status: 'failure',
      errorMessage: 'Ödeme sistemi aktif değil.',
      errorCode: 'PAYMENT_NOT_CONFIGURED',
    };
  }

  // TODO: iyzipay.refund({ paymentTransactionId: transactionId, price: amount })
  console.warn(`[Payment] processRefund(${transactionId}) — henüz entegre değil`);

  return {
    success: false,
    status: 'failure',
    errorCode: 'NOT_IMPLEMENTED',
  };
}
