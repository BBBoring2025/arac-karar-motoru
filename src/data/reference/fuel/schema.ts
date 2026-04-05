/**
 * Yakit Fiyatlari Referans Semasi
 * Canonical veri: src/data/yakit.ts
 * Kaynak: PETDER (Petrol Federasyonu) ortalama fiyatlar
 */

import type { ReferenceMeta } from '../types';

/** Yakit turu tanimi */
export interface FuelTypeEntry {
  id: string;           // orn. "benzin", "dizel", "lpg", "elektrik"
  name: string;
  displayName: string;
  symbol: string;       // orn. "BZN", "DZL", "LPG", "EL"
  price: number;        // TL / birim
  unit: string;         // "lt" veya "kWh"
  pricePerUnit: string; // gorunum icin, orn. "TL/lt"
}

export interface FuelReferenceSchema {
  year: number;
  meta: ReferenceMeta;
  fuelTypes: FuelTypeEntry[];
}

/*
 * Dogrulama kurallari:
 * - En az 4 yakit turu tanimlanmalidir (benzin, dizel, lpg, elektrik)
 * - price > 0 olmalidir
 * - unit yalnizca "lt" veya "kWh" olabilir
 * - Fiyatlar referans niteliktedir; guncel pompa fiyatlari farklilik gosterebilir
 */
