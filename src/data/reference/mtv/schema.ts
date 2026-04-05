/**
 * MTV (Motorlu Tasitlar Vergisi) Referans Semasi
 * Canonical veri: src/data/mtv.ts
 * Kaynak: GIB (Gelir Idaresi Baskanligi) yillik teblig
 */

import type { ReferenceMeta } from '../types';

/** Motor hacmi araligi (cc) ve yas gruplarina gore vergi tutari */
export interface MTVEngineBracket {
  id: string;
  engineSizeMin: number;           // cc alt sinir (dahil)
  engineSizeMax: number;           // cc ust sinir (dahil)
  displayName: string;             // orn. "1301-1600cc"
  ageGroups: Record<string, number>; // yas grubu -> TL (orn. "1-3": 6900)
}

/** Yakit turune gore MTV tarife dizisi */
export type MTVFuelType = 'gasoline' | 'diesel' | 'lpg' | 'hybrid';

/** Elektrik araclar icin sabit yas grubu -> TL eslesmesi */
export type MTVElectricRates = Record<string, number>;

export interface MTVReferenceSchema {
  year: number;
  meta: ReferenceMeta;

  // Yakit turune gore motor hacmi dilimleri
  gasoline: MTVEngineBracket[];
  diesel: MTVEngineBracket[];
  lpg: MTVEngineBracket[];
  hybrid: MTVEngineBracket[];

  // Elektrik araclar motor hacmi yerine sabit oran
  electric: MTVElectricRates;
}

/*
 * Dogrulama kurallari:
 * - engineSizeMin < engineSizeMax olmalidir
 * - ageGroups anahtarlari: "1-3", "4-6", "7-11", "12-15", "16+" standart set
 * - Tum tutarlar >= 0 olmalidir
 * - Her yakit turunde en az 1 bracket bulunmalidir
 * - Hybrid dilimleri genellikle benzin tarifesinin %50'si civarindadir
 */
