/**
 * Payment Modülü — Client-Safe Export'lar
 *
 * processor.ts ve config.ts Node.js-only (iyzipay, process.env).
 * API route'lar bunları doğrudan import eder:
 *   import { ... } from '@/lib/payment/processor'
 *   import { ... } from '@/lib/payment/config'
 *
 * Tipler doğrudan import edilir:
 *   import type { PaymentProduct } from '@/lib/payment/types'
 */

export { PRODUCTS, getProduct } from './products';
export type {
  PaymentStatus,
  ProductId,
  PaymentProduct,
  PaymentRequest,
  PaymentResult,
  PaymentConfig,
} from './types';
