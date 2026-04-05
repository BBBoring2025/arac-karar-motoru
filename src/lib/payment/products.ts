/**
 * Ürün Kataloğu
 * Satışa sunulan rapor paketleri
 */

import type { PaymentProduct } from './types';

export const PRODUCTS: PaymentProduct[] = [
  {
    id: 'tekli',
    name: 'Tekli Rapor',
    price: 99,
    description: 'Tek bir araç için detaylı TCO analizi',
  },
  {
    id: 'karsilastirma',
    name: 'Karşılaştırma Paketi',
    price: 149,
    description: 'Birden fazla araç karşılaştırma raporu',
  },
  {
    id: 'ticari',
    name: 'Ticari Paket',
    price: 249,
    description: 'Kurumsal kullanım paketi',
  },
];

export function getProduct(id: string): PaymentProduct | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
