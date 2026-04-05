/**
 * Kredi / Finansman Referans Semasi
 * Canonical veri: Kullanici girdisi (referans oran bilgilendirme amaclidir)
 * Kaynak: TCMB politika faizi ve banka ortalama oranlari
 */

import type { ReferenceMeta } from '../types';

/** Referans faiz orani */
export interface ReferenceInterestRate {
  id: string;
  label: string;              // orn. "TCMB Politika Faizi", "Tasit Kredisi Ort."
  annualRate: number;         // yillik faiz orani (%)
  source: string;
}

/** Kredi vade secenegi */
export interface CreditTermOption {
  months: number;             // vade suresi (ay)
  typicalRateRange: {
    min: number;              // yillik min faiz (%)
    max: number;              // yillik max faiz (%)
  };
}

export interface CreditSchema {
  year: number;
  meta: ReferenceMeta;
  referenceRates: ReferenceInterestRate[];
  termOptions: CreditTermOption[];
}

/*
 * Dogrulama kurallari:
 * - annualRate >= 0 olmalidir
 * - typicalRateRange.min <= typicalRateRange.max olmalidir
 * - months > 0 olmalidir
 * - Bu veriler bilgilendirme amaclidir; gercek oranlar bankadan bankaya degisir
 * - Kullanici her zaman kendi banka teklifini girebilmelidir
 */
