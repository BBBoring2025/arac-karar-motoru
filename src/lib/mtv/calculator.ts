/**
 * MTV (Motorlu Tasit Vergisi) Hesaplama Modulu
 * Resmi GIB 2026 tarife tablosundan hesaplama yapar
 */

import { MTVInput, MTVResult } from "./types";
import { mtvData, MTVBracket } from "@/data/mtv";

// ---- Yardimci fonksiyonlar (private) ----

/**
 * Arac yasini MTV yas grubuna cevir
 */
function getAgeGroup(aracYasi: number): string {
  if (aracYasi <= 3) return "1-3";
  if (aracYasi <= 6) return "4-6";
  if (aracYasi <= 11) return "7-11";
  if (aracYasi <= 15) return "12-15";
  return "16+";
}

/**
 * Motor hacmine gore dogru MTV bracket'ini bul
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
 * MTV hesapla --- detayli sonuc dondurur
 */
export function calculateMTVDetailed(input: MTVInput): MTVResult {
  const ageGroup = getAgeGroup(Math.max(1, input.aracYasi || 1));

  // Elektrikli araclar: MTV muaf (2026 itibariyle)
  if (input.yakitTupu === "elektrik") {
    const tutar = mtvData.electric[ageGroup] || 0;
    return {
      yillikTutar: tutar,
      aylikTutar: tutar / 12,
      tabloAdi: "Elektrikli Araclar Tarifesi",
      yasGrubu: ageGroup,
      motorHacmiBandi: "N/A (Elektrikli)",
      confidence: "kesin",
      kaynak: mtvData.sourceLabel,
    };
  }

  // Hibrit araclar: ayri tarife (%50 indirimli benzin tarifesi)
  if (input.yakitTupu === "hibrit") {
    const bracket = findMtvBracket(mtvData.hybrid, input.motorHacmi);
    if (bracket) {
      const tutar = bracket.ageGroups[ageGroup] || 0;
      return {
        yillikTutar: tutar,
        aylikTutar: tutar / 12,
        tabloAdi: "Hibrit Araclar Tarifesi",
        yasGrubu: ageGroup,
        motorHacmiBandi: bracket.displayName,
        confidence: "kesin",
        kaynak: mtvData.sourceLabel,
      };
    }
    // Hibrit tarife tablosunda bulunamazsa benzin tarifesinin yarisi
    const gasBracket = findMtvBracket(mtvData.gasoline, input.motorHacmi);
    const tutar = gasBracket
      ? (gasBracket.ageGroups[ageGroup] || 0) / 2
      : 0;
    return {
      yillikTutar: tutar,
      aylikTutar: tutar / 12,
      tabloAdi: "Hibrit Araclar Tarifesi (Benzin %50)",
      yasGrubu: ageGroup,
      motorHacmiBandi: gasBracket?.displayName || "Bilinmiyor",
      confidence: "kesin",
      kaynak: mtvData.sourceLabel,
    };
  }

  // Yakit tipine gore tarife tablosunu sec
  let brackets: MTVBracket[];
  let tabloAdi: string;
  switch (input.yakitTupu) {
    case "dizel":
      brackets = mtvData.diesel;
      tabloAdi = "Dizel Araclar Tarifesi";
      break;
    case "lpg":
      brackets = mtvData.lpg;
      tabloAdi = "LPG Araclar Tarifesi";
      break;
    default:
      brackets = mtvData.gasoline;
      tabloAdi = "Benzinli Araclar Tarifesi";
      break;
  }

  const bracket = findMtvBracket(brackets, input.motorHacmi);
  if (!bracket) {
    // Edge case: motor hacmi hicbir bracket'a uymuyorsa son bracket
    const lastBracket = brackets[brackets.length - 1];
    const tutar = lastBracket?.ageGroups[ageGroup] || 0;
    return {
      yillikTutar: tutar,
      aylikTutar: tutar / 12,
      tabloAdi,
      yasGrubu: ageGroup,
      motorHacmiBandi: lastBracket?.displayName || "Bilinmiyor",
      confidence: "kesin",
      kaynak: mtvData.sourceLabel,
    };
  }

  const tutar = bracket.ageGroups[ageGroup] || 0;
  return {
    yillikTutar: tutar,
    aylikTutar: tutar / 12,
    tabloAdi,
    yasGrubu: ageGroup,
    motorHacmiBandi: bracket.displayName,
    confidence: "kesin",
    kaynak: mtvData.sourceLabel,
  };
}

/**
 * MTV hesapla --- basit yillik tutar (geriye uyumluluk)
 */
export function calculateMTV(
  motorHacmi: number,
  aracYasi: number,
  yakitTupu: string
): number {
  return calculateMTVDetailed({
    motorHacmi,
    aracYasi,
    yakitTupu: yakitTupu as MTVInput["yakitTupu"],
  }).yillikTutar;
}
