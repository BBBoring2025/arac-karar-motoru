/**
 * Muayene (Arac Teknik Muayene) Referans Semasi
 * Canonical veri: src/data/muayene.ts
 * Kaynak: TUVTURK yillik ucret tarifesi
 */

import type { ReferenceMeta } from '../types';

/** Tek bir muayene ucret kalemi */
export interface InspectionFeeItem {
  inspectionType: string;   // orn. "Periyodik Muayene (4+ yas)"
  amount: number;           // TL
}

/** Arac turune gore muayene ucretleri */
export interface VehicleTypeInspectionEntry {
  id: string;
  vehicleType: string;
  displayName: string;
  description: string;
  minYear?: number;
  maxYear?: number;
  fees: InspectionFeeItem[];
}

export interface MuayeneReferenceSchema {
  year: number;
  meta: ReferenceMeta;
  vehicleTypes: VehicleTypeInspectionEntry[];
  additionalFees: Record<string, number>;  // ek hizmet ucretleri
}

/*
 * Dogrulama kurallari:
 * - Her vehicleType icin en az 1 fee olmalidir
 * - amount >= 0 olmalidir
 * - id alanlari benzersiz olmalidir
 * - inspectionType standart degerler: "Ilk Muayene", "Periyodik Muayene", "Tekrar Muayene", "Egzoz Emisyon"
 */
