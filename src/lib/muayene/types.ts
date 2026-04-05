/**
 * Muayene Modulu --- Tip Tanimlari
 */

export interface MuayeneInput {
  aracTipi: string; // 'otomobil', 'kamyonet', etc.
  aracYasi: number;
  yakitTupu: string;
}

export interface MuayeneResult {
  tekMuayeneUcreti: number; // TL (tek seferlik)
  periyotAy: number; // Kac ayda bir (0 = muaf)
  yillikMaliyet: number; // TL/yil
  muafMi: boolean;
  muafNedeni?: string;
  confidence: "kesin";
  kaynak: string;
}
