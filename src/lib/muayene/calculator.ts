/**
 * Muayene Maliyeti Hesaplama Modulu
 * TUVTURK 2026 resmi ucretleri
 */

import { MuayeneInput, MuayeneResult } from "./types";
import { inspectionData } from "@/data/muayene";

/**
 * Tek bir arac tipi icin muayene ucretini hesapla (yardimci)
 */
function calculateInspectionCostForType(
  vehicleType: { fees: { inspectionType: string; amount: number }[] },
  aracYasi: number,
  yakitTupu: string
): number {
  // Periyodik muayene ucreti (yasa gore)
  const inspectionType =
    aracYasi <= 3
      ? "Periyodik Muayene (1-3 yas)"
      : "Periyodik Muayene (4+ yas)";

  const fee = vehicleType.fees.find((f) => f.inspectionType === inspectionType);
  let total = fee?.amount || 150;

  // Egzoz emisyon olcum ucreti (elektrikli araclar haric)
  if (yakitTupu !== "elektrik") {
    const emissionType =
      yakitTupu === "dizel"
        ? "Egzoz Emisyon Olcum (Dizel)"
        : "Egzoz Emisyon Olcum (Benzin)";
    const emissionFee = vehicleType.fees.find(
      (f) => f.inspectionType === emissionType
    );
    if (emissionFee) {
      total += emissionFee.amount;
    }
  }

  return total;
}

/**
 * Muayene hesapla --- detayli sonuc dondurur
 */
export function calculateMuayeneDetailed(input: MuayeneInput): MuayeneResult {
  const kaynak = inspectionData.sourceLabel;

  // Sifir km araclar ilk 3 yil muayeneden muaf
  if (input.aracYasi <= 0) {
    return {
      tekMuayeneUcreti: 0,
      periyotAy: 0,
      yillikMaliyet: 0,
      muafMi: true,
      muafNedeni: "Sifir km araclar ilk 3 yil muayeneden muaf",
      confidence: "kesin",
      kaynak,
      sourceUrl: inspectionData.sourceUrl || 'https://www.tuvturk.com.tr',
      effectiveDate: inspectionData.effectiveDate || '2026-01-01',
    };
  }

  // Periyot: 0-3 yas muaf, 3-7 yas 24 ay, 7+ yas 12 ay
  let periyotAy: number;
  let muafMi = false;
  let muafNedeni: string | undefined;

  if (input.aracYasi <= 3) {
    periyotAy = 0;
    muafMi = true;
    muafNedeni = "3 yas alti araclar muayeneden muaf";
  } else if (input.aracYasi <= 7) {
    periyotAy = 24;
  } else {
    periyotAy = 12;
  }

  // Elektrikli araclar ayri kategori
  const vehicleTypeId =
    input.yakitTupu === "elektrik"
      ? "elektrik_arac"
      : input.aracTipi || "otomobil";

  const vehicleType = inspectionData.vehicleTypes.find(
    (v) => v.id === vehicleTypeId
  );

  let tekMuayeneUcreti: number;
  if (!vehicleType) {
    // Fallback: otomobil
    const defaultType = inspectionData.vehicleTypes.find(
      (v) => v.id === "otomobil"
    );
    tekMuayeneUcreti = defaultType
      ? calculateInspectionCostForType(defaultType, input.aracYasi, input.yakitTupu)
      : 150;
  } else {
    tekMuayeneUcreti = calculateInspectionCostForType(
      vehicleType,
      input.aracYasi,
      input.yakitTupu
    );
  }

  // Yillik maliyet: muaf ise 0, degilse periyoda gore hesapla
  const yillikMaliyet = muafMi
    ? 0
    : periyotAy > 0
      ? tekMuayeneUcreti * (12 / periyotAy)
      : 0;

  return {
    tekMuayeneUcreti,
    periyotAy,
    yillikMaliyet,
    muafMi,
    muafNedeni,
    confidence: "kesin",
    kaynak,
    sourceUrl: inspectionData.sourceUrl || 'https://www.tuvturk.com.tr',
    effectiveDate: inspectionData.effectiveDate || '2026-01-01',
  };
}

/**
 * Muayene maliyeti hesapla --- TUVTURK 2026 resmi ucretleri
 * Geriye uyumluluk icin basit arayuz
 *
 * @param aracTipi Arac tipi ID'si (otomobil, kamyonet, vb.)
 * @param aracYasi Arac yasi
 * @param yakitTupu Yakit tipi (emisyon olcum ucreti icin)
 * @returns Yillik muayene maliyeti (TL)
 */
export function calculateMuayeneMaliyeti(
  aracTipi: string,
  aracYasi: number,
  yakitTupu: string
): number {
  // Sifir km araclar ilk 3 yil muayeneden muaf
  if (aracYasi <= 0) return 0;

  // Elektrikli araclar ayri kategori
  const vehicleTypeId =
    yakitTupu === "elektrik" ? "elektrik_arac" : aracTipi || "otomobil";

  const vehicleType = inspectionData.vehicleTypes.find(
    (v) => v.id === vehicleTypeId
  );
  if (!vehicleType) {
    // Fallback: otomobil
    const defaultType = inspectionData.vehicleTypes.find(
      (v) => v.id === "otomobil"
    );
    if (!defaultType) return 150;
    return calculateInspectionCostForType(defaultType, aracYasi, yakitTupu);
  }

  return calculateInspectionCostForType(vehicleType, aracYasi, yakitTupu);
}
