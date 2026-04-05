/**
 * Araç Karar Motoru - Biçimlendirme Yardımcıları
 * Para, sayı, ve metin biçimlendirme fonksiyonları
 */

/**
 * Tutarı Türk Lirası olarak biçimlendir
 * @param amount Tutar (sayı)
 * @param showSymbol Sembolü göster (varsayılan: true)
 * @returns Biçimlendirilmiş tutar (örn: ₺1.234,56)
 */
export function formatTL(amount: number, showSymbol: boolean = true): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return showSymbol ? "₺0,00" : "0,00";
  }

  const formatted = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  // Türk Lirası sembolü ekle
  return showSymbol ? formatted : formatted.replace("₺", "").trim();
}

/**
 * Yüzdeyi biçimlendir
 * @param value Yüzde değeri (0-100 arası veya 0-1 arası)
 * @param decimals Ondalık basamak sayısı (varsayılan: 1)
 * @returns Biçimlendirilmiş yüzde (örn: 25,5%)
 */
export function formatPercent(
  value: number,
  decimals: number = 1
): string {
  if (typeof value !== "number" || isNaN(value)) {
    return "0%";
  }

  // 0-1 arası değerleri yüzdeye çevir
  const percentValue = value > 1 ? value : value * 100;

  return new Intl.NumberFormat("tr-TR", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(percentValue / 100);
}

/**
 * KM'yi biçimlendir
 * @param km Kilometre
 * @returns Biçimlendirilmiş km (örn: 15.000 km)
 */
export function formatKm(km: number): string {
  if (typeof km !== "number" || isNaN(km)) {
    return "0 km";
  }

  return `${new Intl.NumberFormat("tr-TR").format(Math.round(km))} km`;
}

/**
 * Rakamı binlik ayırıcı ile biçimlendir
 * @param number Sayı
 * @param decimals Ondalık basamak sayısı (varsayılan: 0)
 * @returns Biçimlendirilmiş sayı (örn: 1.234.567,89)
 */
export function formatNumber(number: number, decimals: number = 0): string {
  if (typeof number !== "number" || isNaN(number)) {
    return "0";
  }

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}

/**
 * Aylık taksiti biçimlendir
 * @param aylikTaksit Aylık taksit (₺)
 * @returns Biçimlendirilmiş taksit (örn: ₺1.234,56/ay)
 */
export function formatMontlyPayment(aylikTaksit: number): string {
  return `${formatTL(aylikTaksit)}/ay`;
}

/**
 * Toplam faiz oranını biçimlendir
 * @param faizOrani Faiz oranı (%)
 * @returns Biçimlendirilmiş oran (örn: %8,5 yıllık)
 */
export function formatFaizOrani(faizOrani: number): string {
  return `%${formatNumber(faizOrani, 2)} yıllık`;
}

/**
 * KM başına maliyeti biçimlendir
 * @param kmBasiMaliyet KM başına maliyet (₺/km)
 * @returns Biçimlendirilmiş maliyet (örn: ₺1,23/km)
 */
export function formatKmBasiMaliyet(kmBasiMaliyet: number): string {
  return `${formatTL(kmBasiMaliyet, false)}/km`;
}

/**
 * Aylık maliyeti biçimlendir
 * @param aylikMaliyet Aylık maliyet (₺)
 * @returns Biçimlendirilmiş maliyet (örn: ₺5.678,90/ay)
 */
export function formatAylikMaliyet(aylikMaliyet: number): string {
  return `${formatTL(aylikMaliyet)}/ay`;
}

/**
 * Yakıt tüketimini biçimlendir
 * @param tuketim Tüketim (L/100km)
 * @returns Biçimlendirilmiş tüketim (örn: 6,5 L/100km)
 */
export function formatYakitTuketimi(tuketim: number): string {
  if (typeof tuketim !== "number" || isNaN(tuketim)) {
    return "0 L/100km";
  }

  return `${tuketim.toFixed(1)} L/100km`;
}

/**
 * Yaşını biçimlendir
 * @param yil Yapı yılı
 * @returns Biçimlendirilmiş yaş (örn: 2 yıl veya Yeni)
 */
export function formatAracYasi(yil: number): string {
  const currentYear = new Date().getFullYear();
  const yas = currentYear - yil;

  if (yas === 0) {
    return "Yeni";
  } else if (yas === 1) {
    return "1 yıl";
  } else {
    return `${yas} yıl`;
  }
}

/**
 * Segment adını Türkçeleştir
 * @param segment Segment İngilizce adı
 * @returns Türkçe segment adı
 */
export function formatSegment(segment: string): string {
  const segmentler: Record<string, string> = {
    kompakt: "Kompakt",
    sedan: "Sedan",
    suv: "SUV",
    minivan: "Minivan",
    kargo: "Kargo",
  };

  return segmentler[segment] || segment;
}

/**
 * Yakıt türünü biçimlendir
 * @param yakitTupu Yakıt türü
 * @returns Biçimlendirilmiş yakıt türü
 */
export function formatYakitTupu(yakitTupu: string): string {
  const yakitlar: Record<string, string> = {
    benzin: "Benzin",
    dizel: "Dizel",
    lpg: "LPG",
    hibrit: "Hibrit",
    elektrik: "Elektrik",
  };

  return yakitlar[yakitTupu] || yakitTupu;
}

/**
 * Periyodu biçimlendir
 * @param periyot Periyot (12ay, 36ay vb)
 * @returns Biçimlendirilmiş periyot
 */
export function formatPeriod(periyot: string): string {
  const periytlar: Record<string, string> = {
    "12ay": "1 Yıl",
    "36ay": "3 Yıl",
    "60ay": "5 Yıl",
  };

  return periytlar[periyot] || periyot;
}

/**
 * Tavsiye tipini biçimlendir
 * @param tavsiye Tavsiye tipi
 * @returns Biçimlendirilmiş tavsiye
 */
export function formatTavsiye(tavsiye: string): string {
  const tavsiylr: Record<string, string> = {
    AL: "Satın Al",
    KIRALA: "Kirala",
    BEKLE: "Bekle",
  };

  return tavsiylr[tavsiye] || tavsiye;
}

/**
 * SEO dostu slug oluştur
 * @param text Metin
 * @returns URL-safe slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Araç slug'ı oluştur (marka-model-yıl)
 * @param marka Marka
 * @param model Model
 * @param yil Yapı yılı
 * @returns SEO friendly slug
 */
export function createAracSlug(marka: string, model: string, yil: number): string {
  return createSlug(`${marka} ${model} ${yil}`);
}

/**
 * Tarihi Türkçe biçimde göster
 * @param date Tarih
 * @returns Biçimlendirilmiş tarih
 */
export function formatTarih(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Saat biçimlendirme
 * @param date Tarih
 * @returns Biçimlendirilmiş saat
 */
export function formatSaat(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

/**
 * Kısa tutar biçimlendirme (K = 1000, M = milyon)
 * @param amount Tutar
 * @returns Kısa biçim (örn: 1,2M₺, 500K₺)
 */
export function formatShortTL(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M₺`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K₺`;
  } else {
    return `${amount.toFixed(0)}₺`;
  }
}

/**
 * Fark analizi biçimlendirme
 * @param değer1 Birinci değer
 * @param değer2 İkinci değer
 * @param biçim Biçim tipi (default "tutar")
 * @returns Fark ve yüzde
 */
export function formatFark(
  değer1: number,
  değer2: number,
  biçim: "tutar" | "yuzde" | "km" = "tutar"
): string {
  const fark = değer2 - değer1;
  const yuzde = değer1 !== 0 ? (fark / değer1) * 100 : 0;
  const isaret = fark > 0 ? "+" : "";

  let farkMetni = "";
  if (biçim === "tutar") {
    farkMetni = `${isaret}${formatTL(fark)}`;
  } else if (biçim === "km") {
    farkMetni = `${isaret}${formatKm(fark)}`;
  } else {
    farkMetni = `${isaret}${yuzde.toFixed(1)}%`;
  }

  return `${farkMetni} (${yuzde.toFixed(1)}%)`;
}

/**
 * Özet paragrafı oluştur
 * @param baslik Başlık
 * @param deger Değer
 * @returns Biçimlendirilmiş özet
 */
export function formatOzet(baslik: string, deger: string | number): string {
  if (typeof deger === "number") {
    return `${baslik}: ${formatTL(deger)}`;
  }
  return `${baslik}: ${deger}`;
}

/**
 * Renkli durum etiketi (Yeşil/Sarı/Kırmızı)
 * @param deger Karşılaştırma değeri
 * @param yi Iyi limit
 * @param koti Kötü limit
 * @returns Durum ve renk sınıfı
 */
export function formatDurum(
  deger: number,
  yi: number,
  koti: number
): { durum: string; renkSinifi: string } {
  if (deger <= yi) {
    return {
      durum: "Iyi",
      renkSinifi: "text-green-600 bg-green-50",
    };
  } else if (deger <= koti) {
    return {
      durum: "Orta",
      renkSinifi: "text-yellow-600 bg-yellow-50",
    };
  } else {
    return {
      durum: "Kotu",
      renkSinifi: "text-red-600 bg-red-50",
    };
  }
}

/**
 * Motor hacmini biçimlendir
 * @param motorHacmi Motor hacmi (cc)
 * @returns Biçimlendirilmiş motor hacmi
 */
export function formatMotorHacmi(motorHacmi: number): string {
  return `${(motorHacmi / 1000).toFixed(1)}L`;
}

/**
 * Kredi bilgisini özet olarak göster
 * @param aylikTaksit Aylık taksit
 * @param vade Vade (ay)
 * @param toplamFaiz Toplam faiz
 * @returns Özet metin
 */
export function formatKrediOzet(
  aylikTaksit: number,
  vade: number,
  toplamFaiz: number
): string {
  const vadeSene = (vade / 12).toFixed(1);
  return `${formatMontlyPayment(aylikTaksit)} x ${vade} ay (${vadeSene} yıl), toplam faiz: ${formatTL(toplamFaiz)}`;
}
