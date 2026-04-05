/**
 * Sigorta Referans Semasi
 * Canonical veri: src/data/araclar.ts (insurancePriceRange)
 * Kaynak: OYDER sigorta benchmark ortalamalari
 */

import type { ReferenceMeta } from '../types';

/** Kasko fiyat araligi */
export interface KaskoRate {
  segmentId: string;          // orn. "sedan", "suv", "premium"
  segmentName: string;
  minPremiumTL: number;       // yillik min prim (TL)
  maxPremiumTL: number;       // yillik max prim (TL)
  avgPremiumTL: number;       // yillik ortalama prim (TL)
}

/** Trafik sigortasi (zorunlu) */
export interface TrafficInsuranceRate {
  vehicleClass: string;       // orn. "Otomobil", "Minibus", "Kamyonet"
  basePremiumTL: number;      // yillik baz prim (TL)
}

/** Segment carpanlari (arac tipi/marka etkisi) */
export interface InsuranceSegmentMultiplier {
  segmentId: string;
  multiplier: number;         // 1.0 = baz
}

export interface InsuranceSchema {
  year: number;
  meta: ReferenceMeta;
  kaskoRates: KaskoRate[];
  trafficInsurance: TrafficInsuranceRate[];
  segmentMultipliers: InsuranceSegmentMultiplier[];
}

/*
 * Dogrulama kurallari:
 * - minPremiumTL <= avgPremiumTL <= maxPremiumTL olmalidir
 * - Tum prim degerleri > 0 olmalidir
 * - multiplier > 0 olmalidir
 * - Trafik sigortasi tum standart arac siniflari icin tanimlanmalidir
 */
