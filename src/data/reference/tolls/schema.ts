/**
 * Otoyol / Kopru / Tunel Ucret Referans Semasi
 * Canonical veri: src/data/otoyol.ts, src/data/routes/toll-segments.ts
 * Kaynak: KGM (Karayollari Genel Mudurlugu) HGS/OGS tarife tablolari
 */

import type { ReferenceMeta } from '../types';

/** HGS ve OGS gecis ucretleri */
export interface TollPriceEntry {
  hgs: number;  // TL
  ogs: number;  // TL
}

/** Gecis segmenti turu */
export type TollSegmentType = 'highway' | 'bridge' | 'tunnel';

/** Tek bir otoyol/kopru/tunel rotasi */
export interface TollRouteEntry {
  id: string;
  name: string;
  displayName: string;
  type: TollSegmentType;
  region: string;
  vehicleClasses: Record<string, TollPriceEntry>; // sinif id -> fiyat
}

/** Arac sinifi tanimi */
export interface TollVehicleClass {
  id: string;
  name: string;
  examples: string;
}

export interface TollReferenceSchema {
  year: number;
  meta: ReferenceMeta;
  vehicleClasses: Record<string, TollVehicleClass>;
  routes: TollRouteEntry[];
}

/*
 * Dogrulama kurallari:
 * - Her route icin vehicleClasses anahtarlari "1"-"5" standart settir
 * - hgs ve ogs >= 0 olmalidir
 * - type yalnizca 'highway' | 'bridge' | 'tunnel' olabilir
 * - Kopru/tunel ucretleri resmi (kesin), otoyol segment tahminleri (yaklasik) olabilir
 */
