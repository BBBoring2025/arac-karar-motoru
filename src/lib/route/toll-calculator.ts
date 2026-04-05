/**
 * Geçiş Ücreti Hesaplayıcı
 * Route edge'lerindeki toll segment'leri toplayarak toplam geçiş ücretini hesaplar.
 */

import { RouteEdge, TollSegment, TollBreakdownItem } from './types';
import { tollSegments } from '@/data/routes/toll-segments';

interface TollCalculationResult {
  total: number;
  breakdown: TollBreakdownItem[];
}

/**
 * Verilen edge listesindeki tüm geçiş ücretlerini hesaplar
 * @param edges - Rota edge'leri
 * @param vehicleClass - Araç sınıfı ('1', '2', '3', '4', '5', 'motosiklet')
 * @param useNightRate - Gece tarifesi kullanılsın mı (Avrasya Tüneli için)
 */
export function calculateTollCost(
  edges: RouteEdge[],
  vehicleClass: string,
  useNightRate: boolean = false
): TollCalculationResult {
  const breakdown: TollBreakdownItem[] = [];
  const processedSegments = new Set<string>();

  try {
    for (const edge of edges) {
      for (const segmentId of edge.tollSegmentIds) {
        // Aynı segment'i tekrar saymayı önle
        if (processedSegments.has(segmentId)) continue;
        processedSegments.add(segmentId);

        const segment = tollSegments.find((s: TollSegment) => s.id === segmentId);
        if (!segment) {
          console.warn(`[TollCalculator] Bilinmeyen toll segment: "${segmentId}" — 0 TL olarak atlandı`);
          continue;
        }

        const fee = getSegmentFee(segment, vehicleClass, useNightRate);
        if (fee > 0) {
          breakdown.push({
            segmentId: segment.id,
            name: segment.name,
            type: segment.type,
            amount: fee,
          });
        }
      }
    }
  } catch (err) {
    console.warn('[TollCalculator] Geçiş ücreti hesaplanırken hata:', err);
    return { total: 0, breakdown: [] };
  }

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return { total, breakdown };
}

/**
 * Tek bir segment için araç sınıfına göre ücreti döndürür
 */
function getSegmentFee(
  segment: TollSegment,
  vehicleClass: string,
  useNightRate: boolean
): number {
  const validClasses = ['motosiklet', '1', '2', '3', '4', '5'];
  if (!validClasses.includes(vehicleClass)) {
    console.warn(
      `[TollCalculator] Geçersiz araç sınıfı: "${vehicleClass}" — geçerli değerler: ${validClasses.join(', ')}. 0 TL döndürülüyor.`
    );
    return 0;
  }

  const fees = segment.vehicleClassFees;
  let fee: number;

  if (vehicleClass === 'motosiklet') {
    fee = fees.motosiklet ?? 0;
  } else {
    const classKey = vehicleClass as keyof typeof fees;
    fee = (fees[classKey] as number | undefined) ?? 0;
  }

  // Gece indirimi (Avrasya Tüneli gibi)
  if (useNightRate && segment.nightDiscount) {
    const discountRate = segment.nightDiscount.discountPercent / 100;
    fee = Math.round(fee * (1 - discountRate));
  }

  return fee;
}
