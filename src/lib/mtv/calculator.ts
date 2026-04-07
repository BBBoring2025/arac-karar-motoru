/**
 * MTV (Motorlu Taşıt Vergisi) Hesaplama Modülü
 *
 * GİB tarife tablosu yapısını kullanır.
 *
 * ÖNEMLİ — CONFIDENCE POLITIKASI:
 * - Elektrikli araç → "kesin" (her zaman 0 TL, 2026 muafiyeti)
 * - Diğer yakıt tipleri → "yaklaşık"
 *
 * Sebep: Koddaki MTV tarife tablosu 2026 başında oluşturulmuş bir snapshot.
 * GİB tarifeleri yıl içinde güncellenebilir, kesin tutar için her zaman
 * GİB'in resmi MTV Hesaplama aracı kullanılmalıdır:
 * https://dijital.gib.gov.tr/hesaplamalar/MTVHesaplama
 */

import { MTVInput, MTVResult } from "./types";
import { mtvData, MTVBracket } from "@/data/mtv";

const GIB_DOGRULAMA_UYARISI =
  "Kesin tutar için GİB MTV Hesaplama aracını kullanın: https://dijital.gib.gov.tr/hesaplamalar/MTVHesaplama";

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
      sourceUrl: mtvData.sourceUrl || 'https://www.gib.gov.tr',
      effectiveDate: mtvData.effectiveDate || '2026-01-01',
    };
  }

  // Hibrit araçlar: ayrı tarife (%50 indirimli benzin tarifesi)
  if (input.yakitTupu === "hibrit") {
    const bracket = findMtvBracket(mtvData.hybrid, input.motorHacmi);
    if (bracket) {
      const tutar = bracket.ageGroups[ageGroup] || 0;
      return {
        yillikTutar: tutar,
        aylikTutar: tutar / 12,
        tabloAdi: "Hibrit Araçlar Tarifesi",
        yasGrubu: ageGroup,
        motorHacmiBandi: bracket.displayName,
        confidence: "yaklaşık",
        kaynak: mtvData.sourceLabel,
        sourceUrl: mtvData.sourceUrl || 'https://www.gib.gov.tr',
        effectiveDate: mtvData.effectiveDate || '2026-01-01',
        uyari: GIB_DOGRULAMA_UYARISI,
      };
    }
    // Hibrit tarife tablosunda bulunamazsa benzin tarifesinin yarısı
    const gasBracket = findMtvBracket(mtvData.gasoline, input.motorHacmi);
    const tutar = gasBracket
      ? (gasBracket.ageGroups[ageGroup] || 0) / 2
      : 0;
    return {
      yillikTutar: tutar,
      aylikTutar: tutar / 12,
      tabloAdi: "Hibrit Araçlar Tarifesi (Benzin %50)",
      yasGrubu: ageGroup,
      motorHacmiBandi: gasBracket?.displayName || "Bilinmiyor",
      confidence: "yaklaşık",
      kaynak: mtvData.sourceLabel,
      sourceUrl: mtvData.sourceUrl || 'https://www.gib.gov.tr',
      effectiveDate: mtvData.effectiveDate || '2026-01-01',
      uyari: GIB_DOGRULAMA_UYARISI,
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
    // Edge case: motor hacmi hiçbir bracket'a uymuyorsa son bracket
    const lastBracket = brackets[brackets.length - 1];
    const tutar = lastBracket?.ageGroups[ageGroup] || 0;
    return {
      yillikTutar: tutar,
      aylikTutar: tutar / 12,
      tabloAdi,
      yasGrubu: ageGroup,
      motorHacmiBandi: lastBracket?.displayName || "Bilinmiyor",
      confidence: "yaklaşık",
      kaynak: mtvData.sourceLabel,
      sourceUrl: mtvData.sourceUrl || 'https://www.gib.gov.tr',
      effectiveDate: mtvData.effectiveDate || '2026-01-01',
      uyari: GIB_DOGRULAMA_UYARISI,
    };
  }

  const tutar = bracket.ageGroups[ageGroup] || 0;
  return {
    yillikTutar: tutar,
    aylikTutar: tutar / 12,
    tabloAdi,
    yasGrubu: ageGroup,
    motorHacmiBandi: bracket.displayName,
    confidence: "yaklaşık",
    kaynak: mtvData.sourceLabel,
    sourceUrl: mtvData.sourceUrl || 'https://www.gib.gov.tr',
    effectiveDate: mtvData.effectiveDate || '2026-01-01',
    uyari: GIB_DOGRULAMA_UYARISI,
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
