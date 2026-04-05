/**
 * Araç Karar Motoru - Type Definitions
 * Tüm tip tanımları ve arayüzler
 */

/**
 * Güven Seviyesi: hesaplamanın ne kadar kesin olduğunu belirtir
 * "kesin" = resmi tarife verisi (GİB, TÜVTÜRK, KGM, noter)
 * "yüksek" = doğrulanmış ancak değişkenlik gösterebilir
 * "yaklaşık" = referans değerlerden türetilmiş
 * "tahmini" = sektör benchmark'ları, ortalamalar
 */
export type GuvenSeviyesi = "kesin" | "tahmini";

/**
 * Veri güven seviyesi — daha ayrıntılı (yeni modüller için)
 */
export type DataConfidence = 'kesin' | 'yüksek' | 'yaklaşık' | 'tahmini';

/**
 * Referans veri metadata — her veri kaleminin kaynağı, tarihi ve güvenilirliği
 */
export interface ReferenceMeta {
  sourceLabel: string;
  sourceUrl?: string;
  effectiveDate: string;
  updatedAt: string;
  confidence: DataConfidence;
  notes?: string;
}

export interface GuvenBilgisi {
  seviye: GuvenSeviyesi;
  kaynak: string;
}

/**
 * Araç bilgisi
 */
export interface AracBilgisi {
  id: string;
  marka: string;
  model: string;
  yil: number;
  fiyat: number;
  motorHacmi: number; // cc
  yakitTupu: "benzin" | "dizel" | "lpg" | "hibrit" | "elektrik";
  tahminiYakitTuketimi: number; // L/100km
  yillikKmTahmini: number; // km
  segment: "kompakt" | "sedan" | "suv" | "minivan" | "kargo";
  kaskoTahmini?: number;
  trafikSigortasiTahmini?: number;
  bakimMaliyetiTahmini?: number;
  kullanilanMi: boolean; // Yeni mi, ikinci el mi
}

/**
 * TCO (Total Cost of Ownership) parametreleri
 */
export interface TCOParams {
  // Araç bilgileri
  aracFiyati: number;
  motorHacmi: number; // cc
  aracYasi: number; // 0 = yeni
  yapiYili: number;
  segment: "kompakt" | "sedan" | "suv" | "minivan" | "kargo";
  marka: string;
  yakitTupu: "benzin" | "dizel" | "lpg" | "hibrit" | "elektrik";

  // Kullanım bilgileri
  tahminiYakitTuketimi: number; // L/100km
  yillikKm: number;

  // Finansman bilgileri
  pesinOdeme: boolean;
  krediFaizi?: number; // % aylık
  krediVadesi?: number; // ay
  ilkOdeme?: number; // down payment

  // Yakıt bilgileri
  yakitFiyati: number; // ₺/L

  // Sigortacılık bilgileri
  kaskoTahmini?: number;
  trafikSigortasiTahmini?: number;

  // Diğer bilgiler
  periyot: "12ay" | "36ay" | "60ay";
}

/**
 * TCO Dökümü - Detaylı maliyet analizi
 */
export interface TCOBreakdown {
  // Satın alma maliyeti
  aracFiyati: number;
  ilkOdeme: number;

  // Kredi maliyeti
  krediMaliyeti: {
    anapara: number;
    aylikTaksit: number;
    toplamOdeme: number;
    toplamFaiz: number;
    faizOrani: number;
    vade: number;
  };

  // MTV (Motorlu Taşıt Vergisi)
  mtv: {
    aylikTutarlar: number[];
    toplam: number;
    guven: GuvenBilgisi;
  };

  // Yakıt maliyeti
  yakit: {
    aylikHarcama: number;
    toplam: number;
    guven: GuvenBilgisi;
  };

  // Sigortalar
  sigorta: {
    kasko: number;
    trafik: number;
    toplam: number;
    guven: GuvenBilgisi;
  };

  // Muayene
  muayene: {
    maliyeti: number;
    periyodu: number; // ay
    kaçKez: number;
    toplam: number;
    guven: GuvenBilgisi;
  };

  // Bakım ve onarım
  bakim: {
    aylikTahmini: number;
    toplam: number;
    guven: GuvenBilgisi;
  };

  // Amortisman / Değer kaybı
  amortisman: {
    yillikDegerKaybi: number;
    kalanDeger: number;
    toplamDegerKaybi: number;
    guven: GuvenBilgisi;
  };

  // Noter masrafı (ikinci el için)
  noter?: {
    toplam: number;
    guven: GuvenBilgisi;
  };
}

/**
 * TCO Sonuç
 */
export interface TCOResult {
  aracBilgisi: AracBilgisi;
  parameters: TCOParams;
  breakdown: TCOBreakdown;

  // Özet rakamlar
  toplamMaliyet: number;
  ortalamAylikMaliyet: number;
  kmBasiMaliyet: number; // ₺/km
  periyot: string;
  toplam12AyMaliyet?: number;
  toplam36AyMaliyet?: number;
}

/**
 * Karşılaştırma sonucu
 */
export interface KarsilastirmaResult {
  araclar: TCOResult[];
  enUcuzSonuc: TCOResult;
  enKomforluSonuc: TCOResult;
  enDusukKmBasiMaliyet: TCOResult;
  tavsiyelensinSirasi: TCOResult[];
}

/**
 * Karar özeti
 */
export interface KararOzeti {
  tavsiye: "AL" | "KIRALA" | "BEKLE";
  puanlar: {
    al: number;
    kirala: number;
    bekle: number;
  };
  nedenler: string[];
  riskler: string[];
  firsatlar: string[];
  beklentiler: {
    iyiSenaryo: string;
    kotiSenaryo: string;
  };
}

/**
 * Alternatif araç önerisi
 */
export interface AlternatifArac extends AracBilgisi {
  uyumlulukSkoru: number; // 0-100
  benzerlikler: string[];
  farklar: string[];
}

/**
 * MTV Bilgisi
 */
export interface MtvBilgisi {
  motorHacmi: number;
  aracYasi: number;
  aylikTutar: number;
  yillikTutar: number;
}

/**
 * Kredi Bilgisi
 */
export interface KrediBilgisi {
  anapara: number;
  faizOrani: number; // % aylık
  vade: number; // ay
  aylikTaksit: number;
  toplamOdeme: number;
  toplamFaiz: number;
  amortisman: AmortismanDetay[];
}

/**
 * Amortisman detayı
 */
export interface AmortismanDetay {
  ay: number;
  bakiye: number;
  taksit: number;
  faiz: number;
  anapara: number;
}

/**
 * Sigortacılık bilgisi
 */
export interface SigortaBilgisi {
  kaskoTahmini: number;
  trafikSigortasi: number;
  toplam: number;
}

/**
 * Bakım bilgisi
 */
export interface BakimBilgisi {
  marka: string;
  yillikKm: number;
  aracYasi: number;
  aylikTahmini: number;
  yillikTahmini: number;
}

/**
 * Amortisman bilgisi
 */
export interface AmortismanBilgisi {
  yillikDegerKaybi: number;
  kalanDeger: number;
  yuzde: number;
}

/**
 * Yakıt maliyeti bilgisi
 */
export interface YakitMaliyetiBilgisi {
  tuketim: number; // L/100km
  yillikKm: number;
  yakitFiyati: number; // ₺/L
  yillikMaliyet: number;
  aylikMaliyet: number;
}
