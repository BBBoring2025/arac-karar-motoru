/**
 * Arac Tuketim Verileri Referans Semasi
 * Canonical veri: src/data/yakit.ts (vehicleConsumption), src/data/araclar.ts
 * Kaynak: Uretici WLTP test sonuclari
 */

import type { ReferenceMeta } from '../types';

/** Tek bir arac modeli icin tuketim verisi */
export interface VehicleConsumptionEntry {
  id: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;         // "benzin" | "dizel" | "lpg" | "elektrik" | "hibrit"
  engineSize: number;       // cc (elektrik icin 0)
  power: number;            // bhp
  consumption: number;      // L/100km veya kWh/100km
  co2: number;              // g/km (elektrik icin 0)
}

export interface VehicleConsumptionSchema {
  year: number;
  meta: ReferenceMeta;
  entries: VehicleConsumptionEntry[];
}

/*
 * Dogrulama kurallari:
 * - consumption > 0 olmalidir
 * - fuelType "elektrik" ise engineSize = 0 ve co2 = 0 olmalidir
 * - fuelType "elektrik" ise consumption birimi kWh/100km'dir
 * - Diger yakit turleri icin consumption birimi L/100km'dir
 * - id alanlari benzersiz olmalidir
 */
