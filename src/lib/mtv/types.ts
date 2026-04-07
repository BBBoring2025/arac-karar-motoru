/**
 * MTV Modülü — Tip Tanımları
 *
 * NOT: Bu modül GİB tarife tablosu yapısını kullanır.
 * Confidence "yaklaşık" olarak işaretlenir çünkü:
 * - Kullanıcının tam motor hacmi belirsiz olabilir
 * - Yaş hesabı tescil tarihine göre değişir
 * - Tarife yıl içinde güncellenebilir
 * Kesin tutar için her zaman GİB MTV Hesaplama aracı kullanılmalıdır:
 * https://dijital.gib.gov.tr/hesaplamalar/MTVHesaplama
 */

import { DataConfidence } from "@/lib/types";

export interface MTVInput {
  motorHacmi: number; // cc (0 for electric)
  aracYasi: number; // yıl (0 = sıfır km)
  yakitTupu: "benzin" | "dizel" | "lpg" | "hibrit" | "elektrik";
}

export interface MTVResult {
  yillikTutar: number; // TL/yıl
  aylikTutar: number; // TL/ay
  tabloAdi: string; // Kullanılan tarife tablosu adı
  yasGrubu: string; // "1-3", "4-6", vb.
  motorHacmiBandi: string; // "1-1300cc", vb.
  confidence: DataConfidence; // Genelde "yaklaşık" — elektrikli için "kesin" (sıfır)
  kaynak: string;
  sourceUrl: string;
  effectiveDate: string;
  uyari?: string; // Kullanıcıya gösterilecek uyarı (örn. "GİB hesap makinesini doğrula")
}
