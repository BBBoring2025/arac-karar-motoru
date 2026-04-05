/**
 * Payment Modülü — Tip Tanımları
 *
 * iyzico entegrasyonu tamamlandığında bu tipler kullanılacak.
 * Şu an stub olarak hazır — processPayment() henüz gerçek ödeme yapmaz.
 */

export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failure' | 'refunded';

export type ProductId = 'tekli' | 'karsilastirma' | 'ticari';

export interface PaymentProduct {
  id: ProductId;
  name: string;
  price: number; // TL
  description: string;
}

export interface PaymentRequest {
  product: PaymentProduct;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  // iyzico entegrasyonunda eklenecek:
  // cardNumber, expiry, cvc vb. burada TUTULMAZ
  // iyzico checkout form kullanılacak (PCI DSS uyumlu)
}

export interface PaymentResult {
  success: boolean;
  status: PaymentStatus;
  transactionId?: string;
  errorMessage?: string;
  errorCode?: string;
}

export interface PaymentConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string; // sandbox vs production
  isSandbox: boolean;
}
