/**
 * KGM Geçiş Ücretleri 2026
 * Köprü, tünel ve otoyol segment ücretleri
 * Kaynak: KGM Resmi Tarifesi, 1 Ocak 2026
 * Son güncelleme: 5 Nisan 2026
 */

import { TollSegment } from '@/lib/route/types';

export const tollSegments: TollSegment[] = [
  // ─── Köprüler ───────────────────────────────────────────────────────────────

  {
    id: 'osmangazi-koprusu',
    name: 'Osmangazi Köprüsü',
    type: 'köprü',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'kesin',
    vehicleClassFees: {
      motosiklet: 695,
      '1': 995,
      '2': 1590,
      '3': 1890,
      '4': 2505,
      '5': 3165,
    },
  },

  {
    id: '1915-canakkale-koprusu',
    name: '1915 Çanakkale Köprüsü',
    type: 'köprü',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'kesin',
    vehicleClassFees: {
      motosiklet: 250,
      '1': 995,
      '2': 1245,
      '3': 2240,
      '4': 2490,
      '5': 3755,
    },
  },

  {
    id: '15-temmuz-koprusu',
    name: '15 Temmuz Şehitler Köprüsü',
    type: 'köprü',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'kesin',
    vehicleClassFees: {
      motosiklet: 25,
      '1': 59,
      '2': 88,
      '3': 118,
      '4': 147,
      '5': 206,
    },
  },

  {
    id: 'fsm-koprusu',
    name: 'Fatih Sultan Mehmet Köprüsü',
    type: 'köprü',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'kesin',
    vehicleClassFees: {
      motosiklet: 25,
      '1': 59,
      '2': 88,
      '3': 118,
      '4': 147,
      '5': 206,
    },
  },

  {
    id: 'yss-koprusu',
    name: 'Yavuz Sultan Selim Köprüsü',
    type: 'köprü',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'kesin',
    vehicleClassFees: {
      motosiklet: 65,
      '1': 95,
      '2': 143,
      '3': 190,
      '4': 238,
      '5': 333,
    },
  },

  // ─── Tünel ──────────────────────────────────────────────────────────────────

  {
    id: 'avrasya-tuneli',
    name: 'Avrasya Tüneli',
    type: 'tünel',
    effectiveDate: '2026-01-01',
    sourceLabel: 'Avrasya Tüneli İşletmesi 2026',
    sourceUrl: 'https://www.avrasyatuneli.com.tr',
    confidence: 'kesin',
    vehicleClassFees: {
      motosiklet: 218,
      '1': 280,
      '2': 420,
      // Sınıf 3, 4, 5 tünele giremez
    },
    nightDiscount: {
      startHour: 0,
      endHour: 5,
      discountPercent: 50,
    },
  },

  // ─── Otoyol Segmentleri (tahmini KM bazlı ücretler) ─────────────────────────

  {
    id: 'o4-istanbul-gebze',
    name: 'O-4 İstanbul-Gebze',
    type: 'otoyol',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'tahmini',
    vehicleClassFees: {
      '1': 20,
      '2': 30,
      '3': 40,
      '4': 50,
      '5': 70,
    },
  },

  {
    id: 'o4-gebze-izmit',
    name: 'O-4 Gebze-İzmit',
    type: 'otoyol',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'tahmini',
    vehicleClassFees: {
      '1': 18,
      '2': 27,
      '3': 36,
      '4': 45,
      '5': 63,
    },
  },

  {
    id: 'o4-izmit-bolu',
    name: 'O-4 İzmit-Bolu',
    type: 'otoyol',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'tahmini',
    vehicleClassFees: {
      '1': 55,
      '2': 83,
      '3': 110,
      '4': 138,
      '5': 193,
    },
  },

  {
    id: 'o4-bolu-ankara',
    name: 'O-4 Bolu-Ankara',
    type: 'otoyol',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'tahmini',
    vehicleClassFees: {
      '1': 60,
      '2': 90,
      '3': 120,
      '4': 150,
      '5': 210,
    },
  },

  {
    id: 'o5-izmir-afyon',
    name: 'O-5 İzmir-Afyon',
    type: 'otoyol',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'tahmini',
    vehicleClassFees: {
      '1': 90,
      '2': 135,
      '3': 180,
      '4': 225,
      '5': 315,
    },
  },

  {
    id: 'o5-afyon-ankara',
    name: 'O-5 Afyon-Ankara',
    type: 'otoyol',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'tahmini',
    vehicleClassFees: {
      '1': 65,
      '2': 98,
      '3': 130,
      '4': 163,
      '5': 228,
    },
  },

  {
    id: 'o3-ankara-adana',
    name: 'O-3 Ankara-Adana',
    type: 'otoyol',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'tahmini',
    vehicleClassFees: {
      '1': 120,
      '2': 180,
      '3': 240,
      '4': 300,
      '5': 420,
    },
  },

  {
    id: 'o6-adana-mersin',
    name: 'O-6 Adana-Mersin',
    type: 'otoyol',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'tahmini',
    vehicleClassFees: {
      '1': 22,
      '2': 33,
      '3': 44,
      '4': 55,
      '5': 77,
    },
  },

  {
    id: 'o7-adana-gaziantep',
    name: 'O-7 Adana-Gaziantep',
    type: 'otoyol',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'tahmini',
    vehicleClassFees: {
      '1': 65,
      '2': 98,
      '3': 130,
      '4': 163,
      '5': 228,
    },
  },

  {
    id: 'o4-ankara-samsun',
    name: 'O-4 Ankara-Samsun',
    type: 'otoyol',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'tahmini',
    vehicleClassFees: {
      '1': 100,
      '2': 150,
      '3': 200,
      '4': 250,
      '5': 350,
    },
  },

  {
    id: 'osmangazi-koprusu-otoyol',
    name: 'Osmangazi Köprüsü Bağlantı Otoyolu (Bursa-Yalova)',
    type: 'otoyol',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'tahmini',
    vehicleClassFees: {
      '1': 25,
      '2': 38,
      '3': 50,
      '4': 63,
      '5': 88,
    },
  },

  {
    id: 'bursa-eskisehir-otoyol',
    name: 'Bursa-Eskişehir Otoyolu',
    type: 'otoyol',
    effectiveDate: '2026-01-01',
    sourceLabel: 'KGM 2026 Tarifesi',
    sourceUrl: 'https://www.kgm.gov.tr/Sayfalar/KGM/SiteEng/Root/Otoyollar.aspx',
    confidence: 'tahmini',
    vehicleClassFees: {
      '1': 50,
      '2': 75,
      '3': 100,
      '4': 125,
      '5': 175,
    },
  },
];

export function findTollSegment(id: string): TollSegment | undefined {
  return tollSegments.find(s => s.id === id);
}

export function getTollsByType(type: TollSegment['type']): TollSegment[] {
  return tollSegments.filter(s => s.type === type);
}
