/**
 * Bakim Maliyeti Referans Semasi
 * Canonical veri: src/data/araclar.ts (maintenanceCostYearly)
 * Kaynak: OYDER bakim benchmark verileri
 */

import type { ReferenceMeta } from '../types';

/** Marka bazli yillik bakim maliyet araligi */
export interface BrandMaintenanceCost {
  brand: string;
  avgYearlyCostTL: number;  // TL/yil ortalama
}

/** Yas ve km'ye gore bakim maliyet carpanlari */
export interface MaintenanceAdjustments {
  ageMultipliers: {
    year: number;       // arac yasi
    multiplier: number; // 1.0 = baz (0-3 yas)
  }[];
  kmAdjustments: {
    kmThreshold: number;    // km esik degeri
    additionalCostTL: number; // ek yillik maliyet (TL)
  }[];
}

export interface MaintenanceSchema {
  year: number;
  meta: ReferenceMeta;
  brandCosts: BrandMaintenanceCost[];
  adjustments: MaintenanceAdjustments;
}

/*
 * Dogrulama kurallari:
 * - avgYearlyCostTL > 0 olmalidir
 * - ageMultipliers year=0'dan baslamali ve multiplier >= 1.0 olmalidir
 * - kmAdjustments esik degerleri artan sirada olmalidir
 * - Premium markalar (BMW, Mercedes, Audi) genellikle daha yuksek maliyet tasir
 */
