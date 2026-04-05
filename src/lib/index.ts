/**
 * Araç Karar Motoru - Ana Index
 * Tüm fonksiyonları ve tipleri dış dünyadaki modüllere export eder
 */

// Type exports
export * from "./types";

// Calculation engine exports
export {
  calculateMTV,
  calculateYakitMaliyeti,
  calculateAmortisman,
  calculateKrediMaliyeti,
  calculateSigortaMaliyeti,
  calculateBakimMaliyeti,
  calculateMuayeneMaliyeti,
  calculateTCO,
  calculateKmBasiMaliyet,
  calculateMonthlPayment,
} from "./calculations";

// Comparison and recommendation engine exports
export {
  findAlternatifler,
  karsilastir,
  generateKararOzeti,
} from "./comparisons";

// Formatter exports
export {
  formatTL,
  formatPercent,
  formatKm,
  formatNumber,
  formatMontlyPayment,
  formatFaizOrani,
  formatKmBasiMaliyet,
  formatAylikMaliyet,
  formatYakitTuketimi,
  formatAracYasi,
  formatSegment,
  formatYakitTupu,
  formatPeriod,
  formatTavsiye,
  createSlug,
  createAracSlug,
  formatTarih,
  formatSaat,
  formatShortTL,
  formatFark,
  formatOzet,
  formatDurum,
  formatMotorHacmi,
  formatKrediOzet,
} from "./formatters";
