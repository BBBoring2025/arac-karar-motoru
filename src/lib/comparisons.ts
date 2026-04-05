/**
 * Araç Karar Motoru - Karşılaştırma ve Tavsiye Motoru
 * Araçları karşılaştırma ve karar verme analizi
 */

import {
  AracBilgisi,
  KarsilastirmaResult,
  KararOzeti,
  TCOResult,
  AlternatifArac,
} from "./types";
import { calculateTCO } from "./calculations";
import { vehicleDatabase, Vehicle } from "@/data/araclar";

/**
 * Alternatif araçlar bul
 * @param arac Referans araç
 * @param budget Bütçe sınırı (₺)
 * @returns En uygun 3 alternatif araç
 */
export function findAlternatifler(
  arac: AracBilgisi,
  budget: number
): AlternatifArac[] {
  // Simule edilmiş araç veritabanı
  const veriTabani = generateAracDatabase();

  // Filtreleme kriteri
  const filtreliAraclar = veriTabani.filter((alt) => {
    return (
      alt.fiyat <= budget &&
      alt.segment === arac.segment &&
      Math.abs(alt.motorHacmi - arac.motorHacmi) <= 500
    );
  });

  // Uyumluluk puanı hesapla ve sırala
  const onerilen = filtreliAraclar
    .map((alt) => ({
      ...alt,
      uyumlulukSkoru: calculateCompatibilityScore(arac, alt),
      benzerlikler: findSimilarities(arac, alt),
      farklar: findDifferences(arac, alt),
    }))
    .sort((a, b) => b.uyumlulukSkoru - a.uyumlulukSkoru)
    .slice(0, 3);

  return onerilen;
}

/**
 * Araçları karşılaştır
 * @param araclar Karşılaştırılacak araçlar (en fazla 3)
 * @returns Karşılaştırma sonucu
 */
export function karsilastir(araclar: AracBilgisi[]): KarsilastirmaResult {
  if (araclar.length === 0) {
    throw new Error("En az bir araç seçilmelidir");
  }

  if (araclar.length > 3) {
    throw new Error("En fazla 3 araç karşılaştırılabilir");
  }

  // Her araç için TCO hesapla
  const tcoSonuclari: TCOResult[] = araclar.map((arac) => {
    const params = {
      aracFiyati: arac.fiyat,
      motorHacmi: arac.motorHacmi,
      aracYasi: new Date().getFullYear() - arac.yil,
      yapiYili: arac.yil,
      segment: arac.segment,
      marka: arac.marka,
      yakitTupu: arac.yakitTupu,
      tahminiYakitTuketimi: arac.tahminiYakitTuketimi,
      yillikKm: arac.yillikKmTahmini,
      pesinOdeme: true,
      yakitFiyati: getYakitFiyati(arac.yakitTupu),
      kaskoTahmini: arac.kaskoTahmini,
      trafikSigortasiTahmini: arac.trafikSigortasiTahmini,
      periyot: "36ay" as const,
    };

    return calculateTCO(params);
  });

  // En ucuz araç
  const enUcuzSonuc = tcoSonuclari.reduce((min, current) =>
    current.toplamMaliyet < min.toplamMaliyet ? current : min
  );

  // En düşük KM başına maliyet
  const enDusukKmBasiMaliyet = tcoSonuclari.reduce((min, current) =>
    current.kmBasiMaliyet < min.kmBasiMaliyet ? current : min
  );

  // En komforlu (en yüksek fiyat = daha iyi donanım)
  const enKomforluSonuc = tcoSonuclari.reduce((max, current) =>
    current.aracBilgisi.fiyat > max.aracBilgisi.fiyat ? current : max
  );

  // Tavsiye sırası
  const tavsiyelensinSirasi = tcoSonuclari.sort((a, b) => {
    const scoreA = calculateRecommendationScore(a);
    const scoreB = calculateRecommendationScore(b);
    return scoreB - scoreA;
  });

  return {
    araclar: tcoSonuclari,
    enUcuzSonuc,
    enKomforluSonuc,
    enDusukKmBasiMaliyet,
    tavsiyelensinSirasi,
  };
}

/**
 * Karar özeti oluştur
 * @param tco TCO sonucu
 * @param aracFiyati Araç fiyatı
 * @param kiralikFiyat Kira fiyatı (opsiyonel)
 * @returns Karar özeti
 */
export function generateKararOzeti(
  tco: TCOResult,
  aracFiyati: number,
  kiralikFiyat?: number
): KararOzeti {
  const puanlar = {
    al: 0,
    kirala: 0,
    bekle: 0,
  };

  const nedenler: string[] = [];
  const riskler: string[] = [];
  const firsatlar: string[] = [];

  // AL puanlaması
  if (tco.kmBasiMaliyet < 1.5) {
    puanlar.al += 30;
    firsatlar.push("Düşük KM başına maliyet");
  } else {
    puanlar.al -= 10;
    riskler.push("Yüksek KM başına maliyet");
  }

  if (tco.aracBilgisi.kullanilanMi) {
    puanlar.al += 20;
    firsatlar.push("İkinci el araç (daha ucuz)");
  } else {
    puanlar.al -= 15;
    riskler.push("Yeni araç (yüksek fiyat)");
  }

  if (tco.ortalamAylikMaliyet < 5000) {
    puanlar.al += 25;
    nedenler.push("Uygun aylık maliyet");
  } else {
    puanlar.al -= 20;
    riskler.push("Yüksek aylık maliyet");
  }

  // KIRALA puanlaması
  if (kiralikFiyat && kiralikFiyat < tco.ortalamAylikMaliyet) {
    puanlar.kirala += 35;
    firsatlar.push("Kiralama fiyatı daha uygun");
  } else if (kiralikFiyat) {
    puanlar.kirala -= 10;
  }

  if (tco.aracBilgisi.kullanilanMi) {
    puanlar.kirala += 15;
    nedenler.push("Kiralama ile eski araç sorunu ortadan kalkar");
  }

  // BEKLE puanlaması
  if (tco.aracBilgisi.kullanilanMi && tco.aracBilgisi.kullanilanMi) {
    puanlar.bekle += 20;
    firsatlar.push("Teknoloji geliştikçe daha iyi seçenekler çıkacak");
  }

  if (tco.toplamMaliyet > 300000) {
    puanlar.bekle += 15;
    nedenler.push("Büyük yatırım - düşünmeye değer");
  }

  // Normalizasyon ve karar verme
  const totalPuan = puanlar.al + puanlar.kirala + puanlar.bekle;
  const normalizedPuanlar = {
    al: Math.max(0, (puanlar.al / Math.max(totalPuan, 1)) * 100),
    kirala: Math.max(0, (puanlar.kirala / Math.max(totalPuan, 1)) * 100),
    bekle: Math.max(0, (puanlar.bekle / Math.max(totalPuan, 1)) * 100),
  };

  let tavsiye: "AL" | "KIRALA" | "BEKLE" = "AL";
  const maxPuan = Math.max(normalizedPuanlar.al, normalizedPuanlar.kirala, normalizedPuanlar.bekle);

  if (maxPuan === normalizedPuanlar.kirala) {
    tavsiye = "KIRALA";
  } else if (maxPuan === normalizedPuanlar.bekle) {
    tavsiye = "BEKLE";
  } else {
    tavsiye = "AL";
  }

  // Beklentiler
  const beklentiler = {
    iyiSenaryo: `${tco.aracBilgisi.marka} ile ${Math.ceil(tco.breakdown.amortisman.kalanDeger / 1000)}k₺ değerinde bir araç kalacaktır.`,
    kotiSenaryo: `Beklenenden fazla bakım maliyeti ile aylık harcama ₺${Math.round(tco.ortalamAylikMaliyet * 1.3)} olabilir.`,
  };

  return {
    tavsiye,
    puanlar: normalizedPuanlar,
    nedenler,
    riskler,
    firsatlar,
    beklentiler,
  };
}

/**
 * Yardımcı fonksiyonlar
 */

/**
 * Segment mapping: Vehicle.segment → AracBilgisi.segment
 * Vehicle DB'deki segment tipi (A/B/C/SUV/Sedan vb.) → TCO segmenti (kompakt/sedan/suv vb.)
 */
function mapSegment(vehicleSegment: string): AracBilgisi['segment'] {
  const mapping: Record<string, AracBilgisi['segment']> = {
    'A': 'kompakt', 'B': 'kompakt', 'Hatchback': 'kompakt',
    'C': 'sedan', 'D': 'sedan', 'Sedan': 'sedan',
    'E': 'sedan', 'F': 'sedan',
    'SUV': 'suv',
    'Ticari': 'kargo',
  };
  return mapping[vehicleSegment] || 'sedan';
}

/**
 * Gerçek araç veritabanından AracBilgisi[] oluştur
 * 161 araçlık vehicleDatabase'den çeker (mock veri YOK)
 */
function generateAracDatabase(): AracBilgisi[] {
  return vehicleDatabase.vehicles.map((v: Vehicle) => ({
    id: v.id,
    marka: v.brand,
    model: v.model,
    yil: v.yearRange.max,
    fiyat: v.avgMarketPrice,
    motorHacmi: v.engineSize,
    yakitTupu: v.fuelType,
    tahminiYakitTuketimi: v.avgConsumption,
    yillikKmTahmini: 15000, // TÜİK ortalaması — referans: src/lib/calculations.ts
    segment: mapSegment(v.segment),
    kaskoTahmini: v.insurancePriceRange.min,
    trafikSigortasiTahmini: 500,
    bakimMaliyetiTahmini: v.maintenanceCostYearly,
    kullanilanMi: false,
  }));
}

/**
 * Uyumluluk puanı hesapla
 */
function calculateCompatibilityScore(
  arac1: AracBilgisi,
  arac2: AracBilgisi
): number {
  let skor = 100;

  // Segment uyumu
  if (arac1.segment !== arac2.segment) {
    skor -= 20;
  }

  // Motor hacmi farkı
  const motorFarki = Math.abs(arac1.motorHacmi - arac2.motorHacmi);
  skor -= (motorFarki / 1000) * 10;

  // Yakıt tüketimi karşılaştırması
  const tuketimFarki = Math.abs(
    arac1.tahminiYakitTuketimi - arac2.tahminiYakitTuketimi
  );
  skor -= tuketimFarki * 5;

  // Fiyat yakınlığı
  const fiyatFarki = Math.abs(arac1.fiyat - arac2.fiyat);
  skor -= (fiyatFarki / 100000) * 8;

  return Math.max(0, skor);
}

/**
 * Benzerlikler bul
 */
function findSimilarities(arac1: AracBilgisi, arac2: AracBilgisi): string[] {
  const benzerlikler: string[] = [];

  if (arac1.segment === arac2.segment) {
    benzerlikler.push(`Aynı segment (${arac1.segment})`);
  }

  if (Math.abs(arac1.motorHacmi - arac2.motorHacmi) <= 300) {
    benzerlikler.push("Benzer motor hacmi");
  }

  if (Math.abs(arac1.fiyat - arac2.fiyat) <= 100000) {
    benzerlikler.push("Benzer fiyat aralığı");
  }

  if (arac1.yakitTupu === arac2.yakitTupu) {
    benzerlikler.push(`Aynı yakıt türü (${arac1.yakitTupu})`);
  }

  return benzerlikler;
}

/**
 * Farkları bul
 */
function findDifferences(arac1: AracBilgisi, arac2: AracBilgisi): string[] {
  const farklar: string[] = [];

  const motorFarki = arac2.motorHacmi - arac1.motorHacmi;
  if (motorFarki > 300) {
    farklar.push(`Daha güçlü motor (${motorFarki} cc daha)`);
  } else if (motorFarki < -300) {
    farklar.push(`Daha zayıf motor (${Math.abs(motorFarki)} cc daha az)`);
  }

  const fiyatFarki = arac2.fiyat - arac1.fiyat;
  if (fiyatFarki > 50000) {
    farklar.push(`Daha pahalı (${(fiyatFarki / 1000).toFixed(0)}k₺ daha)`);
  } else if (fiyatFarki < -50000) {
    farklar.push(`Daha ucuz (₺${Math.abs(fiyatFarki / 1000).toFixed(0)}k daha az)`);
  }

  if (arac1.kullanilanMi !== arac2.kullanilanMi) {
    farklar.push(
      arac2.kullanilanMi ? "İkinci el araç" : "Yeni araç"
    );
  }

  const tuketimFarki = arac2.tahminiYakitTuketimi - arac1.tahminiYakitTuketimi;
  if (Math.abs(tuketimFarki) > 1) {
    if (tuketimFarki > 0) {
      farklar.push(`Daha fazla yakıt tüketimi (${tuketimFarki.toFixed(1)} L/100km)`);
    } else {
      farklar.push(`Daha az yakıt tüketimi (${Math.abs(tuketimFarki).toFixed(1)} L/100km)`);
    }
  }

  return farklar;
}

/**
 * Tavsiye puanı hesapla
 */
function calculateRecommendationScore(tco: TCOResult): number {
  let skor = 100;

  // Maliyet etkinliği
  if (tco.kmBasiMaliyet < 1.0) skor += 30;
  else if (tco.kmBasiMaliyet < 1.5) skor += 15;
  else skor -= 10;

  // Aylık ödeme gücü
  if (tco.ortalamAylikMaliyet < 3000) skor += 25;
  else if (tco.ortalamAylikMaliyet < 5000) skor += 10;
  else skor -= 15;

  // Değer saklama
  const valueLoss = (
    (tco.breakdown.amortisman.toplamDegerKaybi /
      tco.aracBilgisi.fiyat) *
    100
  );
  if (valueLoss < 40) skor += 20;
  else if (valueLoss < 60) skor += 5;
  else skor -= 10;

  return skor;
}

/**
 * Yakıt türüne göre fiyat getir (2024 ortalama)
 */
function getYakitFiyati(yakitTupu: string): number {
  const fiyatlar: Record<string, number> = {
    benzin: 30.5,
    dizel: 28.5,
    lpg: 15.0,
    hibrit: 30.0,
    elektrik: 0, // Elektrik ücretine göre hesaplanır
  };

  return fiyatlar[yakitTupu] || 30.5;
}
