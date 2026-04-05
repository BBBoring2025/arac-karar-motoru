/**
 * Odeme Islemcisi — iyzico Entegrasyonu
 *
 * iyzico checkout form API kullanarak PCI DSS uyumlu odeme islemleri.
 * Kart bilgileri sunucuya gelmez, iyzico'nun guvenli formu kullanilir.
 */

import type { PaymentRequest, PaymentResult, PaymentProduct } from './types';
import { isPaymentEnabled, getPaymentConfig } from './config';

/**
 * iyzipay instance'ı lazy oluştur — top-level require yapılmaz.
 * Bu sayede Turbopack client bundle'a iyzipay'i dahil etmez.
 */
function getIyzipayInstance() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Iyzipay = require('iyzipay');
  const config = getPaymentConfig();
  return new Iyzipay({
    apiKey: config.apiKey,
    secretKey: config.secretKey,
    uri: config.baseUrl,
  });
}

/**
 * iyzico checkout form olustur (PCI DSS uyumlu)
 * Kart bilgisi sunucuya gelmez, iyzico'nun guvenli formu kullanilir.
 */
export async function initializeCheckoutForm(params: {
  product: PaymentProduct;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  conversationId: string;
  callbackUrl: string;
}): Promise<{
  success: boolean;
  checkoutFormContent?: string;
  token?: string;
  errorMessage?: string;
}> {
  if (!isPaymentEnabled()) {
    return { success: false, errorMessage: 'Odeme sistemi yapilandirilmamis.' };
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const IyzipayModule = require('iyzipay');
  const iyzipay = getIyzipayInstance();

  const request = {
    locale: IyzipayModule.LOCALE.TR,
    conversationId: params.conversationId,
    price: String(params.product.price),
    paidPrice: String(params.product.price),
    currency: IyzipayModule.CURRENCY.TRY,
    basketId: `B-${params.conversationId}`,
    paymentGroup: IyzipayModule.PAYMENT_GROUP.PRODUCT,
    callbackUrl: params.callbackUrl,
    buyer: {
      id: `BY-${params.conversationId}`,
      name: params.customer.firstName,
      surname: params.customer.lastName,
      email: params.customer.email,
      gsmNumber: params.customer.phone,
      identityNumber: '11111111111', // Required by iyzico sandbox
      registrationAddress: 'Istanbul, Turkiye',
      city: 'Istanbul',
      country: 'Turkiye',
      ip: '127.0.0.1', // Will be overridden by server
    },
    shippingAddress: {
      contactName: `${params.customer.firstName} ${params.customer.lastName}`,
      city: 'Istanbul',
      country: 'Turkiye',
      address: 'Istanbul, Turkiye',
    },
    billingAddress: {
      contactName: `${params.customer.firstName} ${params.customer.lastName}`,
      city: 'Istanbul',
      country: 'Turkiye',
      address: 'Istanbul, Turkiye',
    },
    basketItems: [
      {
        id: params.product.id,
        name: params.product.name,
        category1: 'Rapor',
        itemType: IyzipayModule.BASKET_ITEM_TYPE.VIRTUAL,
        price: String(params.product.price),
      },
    ],
  };

  return new Promise((resolve) => {
    iyzipay.checkoutFormInitialize.create(
      request,
      (err: unknown, result: Record<string, unknown>) => {
        if (err) {
          const message =
            err instanceof Error ? err.message : 'iyzico baglanti hatasi';
          resolve({ success: false, errorMessage: message });
          return;
        }
        if (result.status === 'success') {
          resolve({
            success: true,
            checkoutFormContent: result.checkoutFormContent as string,
            token: result.token as string,
          });
        } else {
          resolve({
            success: false,
            errorMessage:
              (result.errorMessage as string) || 'Odeme formu olusturulamadi',
          });
        }
      }
    );
  });
}

/**
 * iyzico callback sonrasi odeme sonucunu sorgula
 */
export async function retrieveCheckoutForm(token: string): Promise<{
  success: boolean;
  paymentId?: string;
  conversationId?: string;
  price?: number;
  cardLastFour?: string;
  cardType?: string;
  errorMessage?: string;
  rawResponse?: Record<string, unknown>;
}> {
  if (!isPaymentEnabled()) {
    return { success: false, errorMessage: 'Odeme sistemi yapilandirilmamis.' };
  }

  const iyzipay = getIyzipayInstance();

  return new Promise((resolve) => {
    iyzipay.checkoutForm.retrieve(
      { token },
      (err: unknown, result: Record<string, unknown>) => {
        if (err) {
          const message =
            err instanceof Error ? err.message : 'iyzico baglanti hatasi';
          resolve({ success: false, errorMessage: message });
          return;
        }
        if (
          result.status === 'success' &&
          result.paymentStatus === 'SUCCESS'
        ) {
          resolve({
            success: true,
            paymentId: result.paymentId as string,
            conversationId: result.conversationId as string,
            price: parseFloat(result.price as string),
            cardLastFour: result.lastFourDigits as string,
            cardType: result.cardAssociation as string,
            rawResponse: result,
          });
        } else {
          resolve({
            success: false,
            errorMessage:
              (result.errorMessage as string) || 'Odeme basarisiz',
            rawResponse: result,
          });
        }
      }
    );
  });
}

// ---------------------------------------------------------------
// Eski (deprecated) fonksiyonlar — geriye uyumluluk icin korunuyor
// ---------------------------------------------------------------

/**
 * @deprecated initializeCheckoutForm() kullanin
 */
export async function processPayment(
  _request: PaymentRequest
): Promise<PaymentResult> {
  if (!isPaymentEnabled()) {
    return {
      success: false,
      status: 'failure',
      errorMessage:
        'Odeme sistemi henuz aktif degil. Yakinda hizmetinizde olacak.',
      errorCode: 'PAYMENT_NOT_CONFIGURED',
    };
  }

  console.warn(
    '[Payment] processPayment deprecated — initializeCheckoutForm() kullanin'
  );

  return {
    success: false,
    status: 'failure',
    errorMessage: 'processPayment deprecated. initializeCheckoutForm kullanin.',
    errorCode: 'DEPRECATED',
  };
}

/**
 * @deprecated retrieveCheckoutForm() kullanin
 */
export async function getPaymentStatus(
  transactionId: string
): Promise<PaymentResult> {
  if (!isPaymentEnabled()) {
    return {
      success: false,
      status: 'failure',
      errorMessage: 'Odeme sistemi aktif degil.',
      errorCode: 'PAYMENT_NOT_CONFIGURED',
    };
  }

  console.warn(
    `[Payment] getPaymentStatus(${transactionId}) deprecated — retrieveCheckoutForm() kullanin`
  );

  return {
    success: false,
    status: 'pending',
    transactionId,
  };
}

/**
 * @deprecated iyzico refund API henuz entegre degil
 */
export async function processRefund(
  transactionId: string,
  _amount?: number
): Promise<PaymentResult> {
  if (!isPaymentEnabled()) {
    return {
      success: false,
      status: 'failure',
      errorMessage: 'Odeme sistemi aktif degil.',
      errorCode: 'PAYMENT_NOT_CONFIGURED',
    };
  }

  console.warn(
    `[Payment] processRefund(${transactionId}) — henuz entegre degil`
  );

  return {
    success: false,
    status: 'failure',
    errorCode: 'NOT_IMPLEMENTED',
  };
}
