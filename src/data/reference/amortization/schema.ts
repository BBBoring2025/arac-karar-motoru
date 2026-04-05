/**
 * Amortisman (Deger Kaybi) Referans Semasi
 * Canonical veri: src/data/amortisman.ts
 * Kaynak: OYDER sektor verileri ve ikinci el pazar analizi
 */

import type { ReferenceMeta } from '../types';

/** Belirli bir yas icin deger kaybi orani */
export interface DepreciationRate {
  year: number;           // arac yasi (0 = sifir km)
  depreciation: number;   // yuzde (%)
  retentionRate: number;  // kalma yuzdesi (100 - depreciation)
}

/** Yakit turu carpanlari */
export interface FuelTypeMultipliers {
  benzin: number;
  dizel: number;
  lpg: number;
  hibrit: number;
  elektrik: number;
}

/** Segment bazli deger kaybi verisi */
export interface SegmentDepreciation {
  id: string;
  segment: string;
  displayName: string;
  description: string;
  baseDepreciation: DepreciationRate[];
  adjustments?: {
    highMileage: number;              // fazla km icin ek azalis (negatif)
    lowMileage: number;               // az km icin ek kazanc (pozitif)
    fuelTypeMultiplier?: FuelTypeMultipliers;
  };
}

export interface AmortizationSchema {
  year: number;
  meta: ReferenceMeta;
  segments: SegmentDepreciation[];
  assumptions: {
    averageKmPerYear: number;
    calculationMethod: string;
  };
}

/*
 * Dogrulama kurallari:
 * - depreciation [0, 100] araliginda olmalidir
 * - retentionRate = 100 - depreciation olmalidir
 * - baseDepreciation year=0 ile baslamalidir (depreciation=0)
 * - fuelTypeMultiplier degerleri > 0 olmalidir
 * - Her segment icin en az 10 yillik veri bulunmalidir
 */
