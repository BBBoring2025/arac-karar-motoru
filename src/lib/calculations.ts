/**
 * Araç Karar Motoru - Hesaplama Motoru
 * Tüm TCO (Toplam Sahip Olma Maliyeti) hesaplamaları
 *
 * Resmi veri kaynakları:
 * - MTV: GİB 2026 tarife tablosu (src/data/mtv.ts)
 * - Muayene: TÜVTÜRK 2026 ücretleri (src/data/muayene.ts)
 * - Noter: Adalet Bakanlığı 2026 tarifesi (src/data/noter.ts)
 * - Otoyol: KGM 2026 HGS/OGS ücretleri (src/data/otoyol.ts)
 * - Yakıt: PETDER fiyatları + WLTP tüketim (src/data/yakit.ts)
 * - Amortisman: OYDER sektör verileri (src/data/amortisman.ts)
 * - Araçlar: OYDER popüler araç DB (src/data/araclar.ts)
 */

import {
  TCOParams,
  TCOResult,
  TCOBreakdown,
  AracBilgisi,
  KrediBilgisi,
  AmortismanDetay,
  SigortaBilgisi,
  AmortismanBilgisi,
} from "./types";

import { mtvData, MTVBracket } from "@/data/mtv";
import { inspectionData } from "@/data/muayene";
import { calculateTotalNoterCost } from "@/data/noter";
import { fuelData } from "@/data/yakit";
import { amortismanData } from "@/data/amortisman";
import { vehicleDatabase } from "@/data/araclar";

// ─── MTV (Motorlu Taşıt Vergisi) ─────────────────────────────────────────────

/**
 * Araç yaşını MTV yaş grubuna çevir
 */
function getAgeGroup(aracYasi: number): string {
  if (aracYasi <= 3) return "1-3";
  if (aracYasi <= 6) return "4-6";
  if (aracYasi <= 11) return "7-11";
  if (aracYasi <= 15) return "12-15";
  return "16+";
}

/**
 * Motor hacmine göre doğru MTV bracket'ını bul
 */
function findMtvBracket(
  brackets: MTVBracket[],
  motorHacmi: number
): MTVBracket | undefined {
  return brackets.find(
    (b) => motorHacmi >= b.engineSizeMin && motorHacmi <= b.engineSizeMax
  );
}

/**
 * MTV (Motorlu Taşıt Vergisi) hesapla
 * Resmi GİB 2026 tarife tablosundan, yaklaşık formül YOK
 *
 * @param motorHacmi Motor hacmi (cc) — elektrikli araçlar için 0
 * @param aracYasi Araç yaşı (yıl, 0 = sıfır km)
 * @param yakitTupu Yakıt tipi
 * @returns Yıllık MTV tutarı (₺)
 */
export function calculateMTV(
  motorHacmi: number,
  aracYasi: number,
  yakitTupu: string
): number {
  const ageGroup = getAgeGroup(Math.max(1, aracYasi || 1));

  // Elektrikli araçlar: MTV muaf (2026 itibariyle)
  if (yakitTupu === "elektrik") {
    return mtvData.electric[ageGroup] || 0;
  }

  // Hibrit araçlar: ayrı tarife (%50 indirimli benzin tarifesi)
  if (yakitTupu === "hibrit") {
    const bracket = findMtvBracket(mtvData.hybrid, motorHacmi);
    if (bracket) {
      return bracket.ageGroups[ageGroup] || 0;
    }
    // Hibrit tarife tablosunda bulunamazsa benzin tarifesinin yarısı
    const gasBracket = findMtvBracket(mtvData.gasoline, motorHacmi);
    return gasBracket ? (gasBracket.ageGroups[ageGroup] || 0) / 2 : 0;
  }

  // Yakıt tipine göre tarife tablosunu seç
  let brackets: MTVBracket[];
  switch (yakitTupu) {
    case "dizel":
      brackets = mtvData.diesel;
      break;
    case "lpg":
      brackets = mtvData.lpg;
      break;
    default:
      brackets = mtvData.gasoline;
      break;
  }

  const bracket = findMtvBracket(brackets, motorHacmi);
  if (!bracket) {
    // Edge case: motor hacmi hiçbir bracket'a uymuyorsa son bracket
    const lastBracket = brackets[brackets.length - 1];
    return lastBracket?.ageGroups[ageGroup] || 0;
  }

  return bracket.ageGroups[ageGroup] || 0;
}

// ─── MUAYENE ──────────────────────────────────────────────────────────────────

/**
 * Muayene maliyeti hesapla — TÜVTÜRK 2026 resmi ücretleri
 *
 * @param aracTipi Araç tipi ID'si (otomobil, kamyonet, vb.)
 * @param aracYasi Araç yaşı
 * @param yakitTupu Yakıt tipi (emisyon ölçüm ücreti için)
 * @returns Yıllık muayene maliyeti (₺)
 */
export function calculateMuayeneMaliyeti(
  aracTipi: string,
  aracYasi: number,
  yakitTupu: string
): number {
  // Sıfır km araçlar ilk 3 yıl muayeneden muaf
  if (aracYasi <= 0) return 0;

  // Elektrikli araçlar ayrı kategori
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

function calculateInspectionCostForType(
  vehicleType: { fees: { inspectionType: string; amount: number }[] },
  aracYasi: number,
  yakitTupu: string
): number {
  // Periyodik muayene ücreti (yaşa göre)
  const inspectionType =
    aracYasi <= 3
      ? "Periyodik Muayene (1-3 yaş)"
      : "Periyodik Muayene (4+ yaş)";

  const fee = vehicleType.fees.find((f) => f.inspectionType === inspectionType);
  let total = fee?.amount || 150;

  // Egzoz emisyon ölçüm ücreti (elektrikli araçlar hariç)
  if (yakitTupu !== "elektrik") {
    const emissionType =
      yakitTupu === "dizel"
        ? "Egzoz Emisyon Ölçüm (Dizel)"
        : "Egzoz Emisyon Ölçüm (Benzin)";
    const emissionFee = vehicleType.fees.find(
      (f) => f.inspectionType === emissionType
    );
    if (emissionFee) {
      total += emissionFee.amount;
    }
  }

  return total;
}

// ─── NOTER ────────────────────────────────────────────────────────────────────

/**
 * Noter masrafını hesapla — Adalet Bakanlığı 2026 tarifesi
 * Sadece ikinci el araç alımlarında uygulanır
 *
 * @param aracFiyati Araç fiyatı (₺)
 * @param kullanilanMi İkinci el mi?
 * @returns Toplam noter masrafı (KDV dahil, ₺)
 */
export function calculateNoterMasrafi(
  aracFiyati: number,
  kullanilanMi: boolean
): number {
  if (!kullanilanMi) return 0;
  const result = calculateTotalNoterCost(aracFiyati, true);
  return result.total;
}

// ─── YAKIT ────────────────────────────────────────────────────────────────────

/**
 * Yakıt maliyeti hesapla
 * Gerçek PETDER fiyatları + WLTP tüketim verileri
 *
 * @param tuketim Yakıt tüketimi (L/100km veya kWh/100km)
 * @param yillikKm Yıllık km
 * @param yakitFiyati Yakıt fiyatı (₺/L veya ₺/kWh) — 0 ise güncel fiyat kullanılır
 * @param yakitTupu Yakıt tipi
 * @returns Yıllık yakıt maliyeti (₺)
 */
export function calculateYakitMaliyeti(
  tuketim: number,
  yillikKm: number,
  yakitFiyati: number,
  yakitTupu?: string
): number {
  // Yakıt fiyatı verilmemişse güncel veriyi kullan
  let fiyat = yakitFiyati;
  if (!fiyat && yakitTupu) {
    const fuelType = fuelData.fuelTypes.find((f) => f.id === yakitTupu);
    fiyat = fuelType?.price || 44.25;
  }
  if (!fiyat) fiyat = 44.25;

  const yillikTuketim = (yillikKm / 100) * tuketim;
  return yillikTuketim * fiyat;
}

// ─── AMORTİSMAN (Değer Kaybı) ────────────────────────────────────────────────

/**
 * Segment ID'sini amortisman veri yapısındaki segment'e eşle
 */
function mapSegmentToAmortismanId(
  segment: string,
  yakitTupu: string,
  marka: string
): string {
  // Elektrikli araçlar ayrı amortisman tablosu
  if (yakitTupu === "elektrik") return "elektrik";

  // Premium markalar
  const premiumBrands = [
    "bmw",
    "mercedes",
    "mercedes-benz",
    "audi",
    "volvo",
    "lexus",
    "porsche",
    "jaguar",
    "land rover",
  ];
  if (premiumBrands.includes(marka.toLowerCase())) return "premium";

  // Ticari araçlar
  if (segment === "kargo" || segment === "minivan") return "ticari";

  // SUV
  if (segment === "suv") return "suv";

  // Kompakt → hatchback
  if (segment === "kompakt") return "hatchback";

  // Sedan default
  return "sedan";
}

/**
 * Amortisman / Değer kaybı hesapla — OYDER sektör verileri
 *
 * @param aracFiyati Araç fiyatı (₺)
 * @param yil Sahiplik süresi (yıl)
 * @param segment Araç segmenti
 * @param yakitTupu Yakıt tipi (fuel multiplier için)
 * @param marka Araç markası (premium tespiti için)
 * @param yillikKm Yıllık km (km bazlı ayarlama için)
 * @returns Amortisman bilgisi
 */
export function calculateAmortisman(
  aracFiyati: number,
  yil: number,
  segment: string,
  yakitTupu: string = "benzin",
  marka: string = "",
  yillikKm: number = 15000
): AmortismanBilgisi {
  const segmentId = mapSegmentToAmortismanId(segment, yakitTupu, marka);
  const segmentData = amortismanData.segments.find((s) => s.id === segmentId);

  if (!segmentData) {
    // Fallback: sedan
    return calculateAmortismanFallback(aracFiyati, yil);
  }

  // Yılı en yakın tam sayıya yuvarla, max 15
  const targetYear = Math.min(Math.round(yil), 15);

  // Kümülatif amortisman yüzdesi
  const depRate = segmentData.baseDepreciation.find(
    (d) => d.year === targetYear
  );
  let depPercent = depRate?.depreciation || targetYear * 5;

  // 15 yıldan eski araçlar: son veri noktasını kullan
  if (targetYear >= 15 && !depRate) {
    const last = segmentData.baseDepreciation[segmentData.baseDepreciation.length - 1];
    depPercent = last?.depreciation || 75;
  }

  // Yakıt tipi çarpanı uygula
  if (segmentData.adjustments?.fuelTypeMultiplier) {
    const multiplier =
      segmentData.adjustments.fuelTypeMultiplier[
        yakitTupu as keyof typeof segmentData.adjustments.fuelTypeMultiplier
      ] || 1.0;
    // Multiplier > 1 = değer kaybı daha az (daha iyi tutar)
    // retention *= multiplier → depreciation = 100 - (retention * multiplier)
    const baseRetention = 100 - depPercent;
    const adjustedRetention = Math.min(baseRetention * multiplier, 100);
    depPercent = 100 - adjustedRetention;
  }

  // Km bazlı ayarlama
  if (segmentData.adjustments) {
    const avgKm = amortismanData.assumptions.averageKmPerYear;
    if (yillikKm > avgKm * 1.3) {
      depPercent = Math.min(depPercent - segmentData.adjustments.highMileage, 95);
    } else if (yillikKm < avgKm * 0.7) {
      depPercent = Math.max(depPercent + segmentData.adjustments.lowMileage, 0);
    }
  }

  // Minimum %5 hurda değeri korunur
  depPercent = Math.min(depPercent, 95);

  const toplamDegerKaybi = aracFiyati * (depPercent / 100);
  const kalanDeger = aracFiyati - toplamDegerKaybi;
  const yillikDegerKaybi = yil > 0 ? toplamDegerKaybi / yil : 0;

  return {
    yillikDegerKaybi,
    kalanDeger: Math.max(kalanDeger, aracFiyati * 0.05),
    yuzde: depPercent,
  };
}

function calculateAmortismanFallback(
  aracFiyati: number,
  yil: number
): AmortismanBilgisi {
  // Basit fallback: yıllık %15 azalan
  let kalanDeger = aracFiyati;
  for (let i = 0; i < yil; i++) {
    kalanDeger *= 0.85;
  }
  kalanDeger = Math.max(kalanDeger, aracFiyati * 0.05);
  const toplamKayip = aracFiyati - kalanDeger;
  return {
    yillikDegerKaybi: yil > 0 ? toplamKayip / yil : 0,
    kalanDeger,
    yuzde: (toplamKayip / aracFiyati) * 100,
  };
}

// ─── SİGORTA ──────────────────────────────────────────────────────────────────

/**
 * Sigorta maliyeti tahmin et — araç veritabanındaki benchmark veriler
 *
 * @param aracFiyati Araç fiyatı (₺)
 * @param aracYasi Araç yaşı
 * @param segment Araç segmenti
 * @param marka Araç markası
 * @returns Kasko ve trafik sigortası tahminleri
 */
export function calculateSigortaMaliyeti(
  aracFiyati: number,
  aracYasi: number,
  segment: string,
  marka?: string
): SigortaBilgisi {
  // Araç veritabanında marka bilgisi varsa oradan çek
  if (marka) {
    const vehicle = vehicleDatabase.vehicles.find(
      (v) => v.brand.toLowerCase() === marka.toLowerCase()
    );
    if (vehicle) {
      const kaskoTahmini =
        (vehicle.insurancePriceRange.min + vehicle.insurancePriceRange.max) / 2;
      // Yaşa göre ayarla: eski araçlarda kasko daha ucuz
      const yasMultiplier =
        aracYasi <= 1 ? 1.2 : aracYasi <= 3 ? 1.0 : aracYasi <= 7 ? 0.85 : 0.7;
      const adjustedKasko = kaskoTahmini * yasMultiplier;

      // Trafik sigortası: fiyat bazlı benchmark
      const trafikSigortasi = calculateTrafikSigortasi(aracFiyati);

      return {
        kaskoTahmini: adjustedKasko,
        trafikSigortasi,
        toplam: adjustedKasko + trafikSigortasi,
      };
    }
  }

  // Veritabanında bulunamazsa fiyat bazlı tahmin
  // OYDER benchmark kasko oranları — segment ve yaş bazlı ortalamalar
  let kaskoOrani = 0.015;
  if (aracYasi === 0) kaskoOrani = 0.025;
  else if (aracYasi <= 3) kaskoOrani = 0.02;
  else if (aracYasi <= 7) kaskoOrani = 0.015;
  else kaskoOrani = 0.01;

  const segmentOrani: Record<string, number> = {
    kompakt: 0.9,
    sedan: 1.0,
    suv: 1.15,
    minivan: 1.0,
    kargo: 1.05,
  };
  kaskoOrani *= segmentOrani[segment] || 1.0;

  const kaskoTahmini = aracFiyati * kaskoOrani;
  const trafikSigortasi = calculateTrafikSigortasi(aracFiyati);

  return {
    kaskoTahmini,
    trafikSigortasi,
    toplam: kaskoTahmini + trafikSigortasi,
  };
}

function calculateTrafikSigortasi(aracFiyati: number): number {
  if (aracFiyati > 1000000) return 1200;
  if (aracFiyati > 500000) return 900;
  if (aracFiyati > 250000) return 650;
  return 450;
}

// ─── BAKIM ────────────────────────────────────────────────────────────────────

/**
 * Bakım maliyeti hesapla — araç veritabanı benchmark verileri
 *
 * @param marka Araç markası
 * @param yillikKm Yıllık km
 * @param aracYasi Araç yaşı
 * @param yakitTupu Yakıt tipi
 * @returns Yıllık bakım maliyeti tahmini (₺)
 */
export function calculateBakimMaliyeti(
  marka: string,
  yillikKm: number,
  aracYasi: number,
  yakitTupu: string = "benzin"
): number {
  // Araç veritabanından marka bazlı bakım maliyeti çek
  const vehicle = vehicleDatabase.vehicles.find(
    (v) => v.brand.toLowerCase() === marka.toLowerCase()
  );

  let baseMaliyet: number;
  if (vehicle) {
    baseMaliyet = vehicle.maintenanceCostYearly;
  } else {
    // Bilinmeyen markalar için varsayılan yıllık bakım maliyeti (TL)
    baseMaliyet = 3500;
  }

  // Elektrikli araçlar: bakım maliyeti çok daha düşük
  if (yakitTupu === "elektrik") {
    baseMaliyet *= 0.4;
  }

  // Hibrit: hafif düşük
  if (yakitTupu === "hibrit") {
    baseMaliyet *= 0.85;
  }

  // OYDER bakım maliyet çarpanları — garanti döneminde düşük, yaşlandıkça artan
  let yasMultiplier = 1.0;
  if (aracYasi <= 2) yasMultiplier = 0.6; // Garanti kapsamında
  else if (aracYasi <= 5) yasMultiplier = 1.0;
  else if (aracYasi <= 10) yasMultiplier = 1.3;
  else yasMultiplier = 1.6;

  // Km çarpanı: çok kullanan araçlarda bakım artar
  // Referans: TÜİK ortalama yıllık araç km verisi (15.000 km/yıl)
  const kmMultiplier = yillikKm / 15000;

  return baseMaliyet * yasMultiplier * Math.max(kmMultiplier, 0.5);
}

// ─── KREDİ ────────────────────────────────────────────────────────────────────

/**
 * Kredi maliyeti hesapla (Amortisman tablosu ile)
 */
export function calculateKrediMaliyeti(
  anapara: number,
  faizOrani: number,
  vade: number
): KrediBilgisi {
  const aylikFaiz = faizOrani / 100;

  if (aylikFaiz === 0) {
    return {
      anapara,
      faizOrani,
      vade,
      aylikTaksit: anapara / vade,
      toplamOdeme: anapara,
      toplamFaiz: 0,
      amortisman: [],
    };
  }

  const payda = Math.pow(1 + aylikFaiz, vade) - 1;
  const pay = aylikFaiz * Math.pow(1 + aylikFaiz, vade);
  const aylikTaksit = anapara * (pay / payda);

  const toplamOdeme = aylikTaksit * vade;
  const toplamFaiz = toplamOdeme - anapara;

  const amortisman: AmortismanDetay[] = [];
  let bakiye = anapara;

  for (let ay = 1; ay <= vade; ay++) {
    const faiz = bakiye * aylikFaiz;
    const anaparaTaksit = aylikTaksit - faiz;
    bakiye -= anaparaTaksit;

    amortisman.push({
      ay,
      bakiye: Math.max(0, bakiye),
      taksit: aylikTaksit,
      faiz,
      anapara: anaparaTaksit,
    });
  }

  return {
    anapara,
    faizOrani,
    vade,
    aylikTaksit,
    toplamOdeme,
    toplamFaiz,
    amortisman,
  };
}

// ─── TCO (Toplam Sahip Olma Maliyeti) ─────────────────────────────────────────

/**
 * TCO hesapla — ana fonksiyon, tüm hesaplamaları koordine eder
 * Her kalem için güven seviyesi döndürür
 */
export function calculateTCO(params: TCOParams): TCOResult {
  const aylarHesapla = getPeriodMonths(params.periyot);
  const yillerHesapla = aylarHesapla / 12;
  const kullanilanMi = params.aracYasi > 0;

  // Araç bilgisi
  const aracBilgisi: AracBilgisi = {
    id: generateId(),
    marka: params.marka,
    model: "",
    yil: params.yapiYili,
    fiyat: params.aracFiyati,
    motorHacmi: params.motorHacmi,
    yakitTupu: params.yakitTupu,
    tahminiYakitTuketimi: params.tahminiYakitTuketimi,
    yillikKmTahmini: params.yillikKm,
    segment: params.segment,
    kaskoTahmini: params.kaskoTahmini,
    trafikSigortasiTahmini: params.trafikSigortasiTahmini,
    kullanilanMi,
  };

  // ── MTV hesapla (resmi GİB tarifesi) ──
  const yillikMTV = calculateMTV(
    params.motorHacmi,
    params.aracYasi || 1,
    params.yakitTupu
  );
  const aylikMTV = yillikMTV / 12;
  const toplam_MTV = yillikMTV * yillerHesapla;

  // ── Yakıt maliyeti ──
  const yillikYakitMaliyet = calculateYakitMaliyeti(
    params.tahminiYakitTuketimi,
    params.yillikKm,
    params.yakitFiyati,
    params.yakitTupu
  );
  const aylikYakitMaliyet = yillikYakitMaliyet / 12;
  const toplam_Yakit = yillikYakitMaliyet * yillerHesapla;

  // ── Kredi hesapla ──
  let krediMaliyet = {
    anapara: 0,
    aylikTaksit: 0,
    toplamOdeme: 0,
    toplamFaiz: 0,
    faizOrani: 0,
    vade: 0,
  };

  const ilkOdeme = params.ilkOdeme || 0;

  if (!params.pesinOdeme && params.krediFaizi && params.krediVadesi) {
    const anapara = params.aracFiyati - ilkOdeme;
    krediMaliyet = calculateKrediMaliyeti(
      anapara,
      params.krediFaizi / 12,
      params.krediVadesi
    );
  }

  // ── Sigorta maliyeti ──
  const sigortaBilgisi = calculateSigortaMaliyeti(
    params.aracFiyati,
    params.aracYasi,
    params.segment,
    params.marka
  );
  const kaskoTahmini = params.kaskoTahmini || sigortaBilgisi.kaskoTahmini;
  const trafikSigortasi =
    params.trafikSigortasiTahmini || sigortaBilgisi.trafikSigortasi;
  const toplam_Sigorta = (kaskoTahmini + trafikSigortasi) * yillerHesapla;

  // ── Bakım maliyeti ──
  const yillikBakimMaliyet = calculateBakimMaliyeti(
    params.marka,
    params.yillikKm,
    params.aracYasi,
    params.yakitTupu
  );
  const aylikBakimMaliyet = yillikBakimMaliyet / 12;
  const toplam_Bakim = yillikBakimMaliyet * yillerHesapla;

  // ── Muayene maliyeti (TÜVTÜRK resmi) ──
  const yillikMuayene = calculateMuayeneMaliyeti(
    "otomobil",
    params.aracYasi,
    params.yakitTupu
  );
  // Muayene periyodu: 3 yaşına kadar yok, 3-7 yaş arası 2 yılda bir, 7+ her yıl
  const muayenePeriyodu =
    params.aracYasi <= 3 ? 0 : params.aracYasi <= 7 ? 24 : 12;
  const muayeneKacKez =
    muayenePeriyodu > 0 ? Math.floor(aylarHesapla / muayenePeriyodu) : 0;
  const toplam_Muayene = yillikMuayene * Math.max(muayeneKacKez, 0);

  // ── Amortisman ──
  const amortismanBilgisi = calculateAmortisman(
    params.aracFiyati,
    yillerHesapla,
    params.segment,
    params.yakitTupu,
    params.marka,
    params.yillikKm
  );
  const toplam_DegerKaybi = amortismanBilgisi.yillikDegerKaybi * yillerHesapla;

  // ── Noter masrafı (ikinci el ise) ──
  const noterMasrafi = calculateNoterMasrafi(params.aracFiyati, kullanilanMi);

  // ── Toplam maliyet ──
  const toplamMaliyet =
    (params.pesinOdeme ? params.aracFiyati : ilkOdeme) +
    (krediMaliyet.toplamFaiz || 0) +
    toplam_MTV +
    toplam_Yakit +
    toplam_Sigorta +
    toplam_Bakim +
    toplam_Muayene +
    toplam_DegerKaybi +
    noterMasrafi;

  const ortalamAylikMaliyet = toplamMaliyet / aylarHesapla;
  const toplam_Km = params.yillikKm * yillerHesapla;
  const kmBasiMaliyet = toplam_Km > 0 ? toplamMaliyet / toplam_Km : 0;

  // ── Breakdown ──
  const breakdown: TCOBreakdown = {
    aracFiyati: params.aracFiyati,
    ilkOdeme,
    krediMaliyeti: {
      anapara: krediMaliyet.anapara,
      aylikTaksit: krediMaliyet.aylikTaksit,
      toplamOdeme: krediMaliyet.toplamOdeme,
      toplamFaiz: krediMaliyet.toplamFaiz,
      faizOrani: krediMaliyet.faizOrani,
      vade: krediMaliyet.vade,
    },
    mtv: {
      aylikTutarlar: Array(aylarHesapla).fill(aylikMTV),
      toplam: toplam_MTV,
      guven: {
        seviye: "kesin",
        kaynak: "GİB 2026 MTV Tarife Tablosu",
      },
    },
    yakit: {
      aylikHarcama: aylikYakitMaliyet,
      toplam: toplam_Yakit,
      guven: {
        seviye: "tahmini",
        kaynak: "PETDER fiyatları + WLTP tüketim verileri",
      },
    },
    sigorta: {
      kasko: kaskoTahmini,
      trafik: trafikSigortasi,
      toplam: toplam_Sigorta,
      guven: {
        seviye: "tahmini",
        kaynak: "OYDER araç veritabanı benchmark ortalamaları",
      },
    },
    muayene: {
      maliyeti: yillikMuayene,
      periyodu: muayenePeriyodu,
      kaçKez: muayeneKacKez,
      toplam: toplam_Muayene,
      guven: {
        seviye: "kesin",
        kaynak: "TÜVTÜRK 2026 Muayene Ücret Tarifesi",
      },
    },
    bakim: {
      aylikTahmini: aylikBakimMaliyet,
      toplam: toplam_Bakim,
      guven: {
        seviye: "tahmini",
        kaynak: "OYDER araç bakım maliyeti benchmark verileri",
      },
    },
    amortisman: {
      yillikDegerKaybi: amortismanBilgisi.yillikDegerKaybi,
      kalanDeger: amortismanBilgisi.kalanDeger,
      toplamDegerKaybi: toplam_DegerKaybi,
      guven: {
        seviye: "tahmini",
        kaynak: "OYDER sektör verileri — segment ve yakıt bazlı amortisman",
      },
    },
    ...(kullanilanMi && noterMasrafi > 0
      ? {
          noter: {
            toplam: noterMasrafi,
            guven: {
              seviye: "kesin" as const,
              kaynak: "Adalet Bakanlığı 2026 Noter Ücret Tarifesi",
            },
          },
        }
      : {}),
  };

  return {
    aracBilgisi,
    parameters: params,
    breakdown,
    toplamMaliyet,
    ortalamAylikMaliyet,
    kmBasiMaliyet,
    periyot: params.periyot,
  };
}

// ─── YARDIMCI FONKSİYONLAR ───────────────────────────────────────────────────

/**
 * KM başına maliyet hesapla
 */
export function calculateKmBasiMaliyet(tco: number, km: number): number {
  if (km === 0) return 0;
  return tco / km;
}

/**
 * Aylık taksit hesapla (sabit oran)
 */
export function calculateMonthlPayment(
  anapara: number,
  faizOrani: number,
  vade: number
): number {
  if (faizOrani === 0) {
    return anapara / vade;
  }

  const r = faizOrani / 100;
  const numerator = r * Math.pow(1 + r, vade);
  const denominator = Math.pow(1 + r, vade) - 1;

  return anapara * (numerator / denominator);
}

function getPeriodMonths(periyot: string): number {
  const periods: Record<string, number> = {
    "12ay": 12,
    "36ay": 36,
    "60ay": 60,
  };
  return periods[periyot] || 12;
}

function generateId(): string {
  return `arac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
