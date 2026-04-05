/**
 * MTV Modulu --- Tip Tanimlari
 */

export interface MTVInput {
  motorHacmi: number; // cc (0 for electric)
  aracYasi: number; // yil (0 = sifir km)
  yakitTupu: "benzin" | "dizel" | "lpg" | "hibrit" | "elektrik";
}

export interface MTVResult {
  yillikTutar: number; // TL/yil
  aylikTutar: number; // TL/ay
  tabloAdi: string; // Kullanilan tarife tablosu adi
  yasGrubu: string; // "1-3", "4-6", etc.
  motorHacmiBandi: string; // "1-1300cc", etc.
  confidence: "kesin"; // MTV her zaman kesin (resmi tarife)
  kaynak: string;
  sourceUrl: string;
  effectiveDate: string;
}
