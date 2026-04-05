/**
 * Amortisman (Değer Kaybı) Verileri 2026
 * Araç segment ve yaşına göre yüzdesel değer kaybı
 * Kaynak: Sektör tahminleri ve OYDER verileri
 */

export interface AmortimanRate {
  year: number; // yaş
  depreciation: number; // Yüzde (%)
  retentionRate: number; // Kalma yüzdesi (100 - depreciation)
}

export interface SegmentAmortisman {
  id: string;
  segment: string;
  displayName: string;
  description: string;
  baseDepreciation: AmortimanRate[];
  adjustments?: {
    highMileage: number; // Fazla km için ek azalış
    lowMileage: number; // Az km için ek kazanç
    fuelTypeMultiplier?: {
      benzin: number;
      dizel: number;
      lpg: number;
      hibrit: number;
      elektrik: number;
    };
  };
}

export interface AmortismanData {
  year: number;
  lastUpdated: string;
  sourceLabel: string;
  sourceUrl: string;
  effectiveDate: string;
  confidence: 'kesin' | 'yaklaşık' | 'tahmini';
  notes?: string;
  segments: SegmentAmortisman[];
  assumptions: {
    averageKmPerYear: number;
    calculationMethod: string;
  };
}

export const amortismanData: AmortismanData = {
  year: 2026,
  lastUpdated: '2026-01-15',
  sourceLabel: 'OYDER Sektör Verileri ve İkinci El Pazar Analizi',
  sourceUrl: 'https://www.oyder.org.tr',
  effectiveDate: '2026-01-15',
  confidence: 'tahmini' as const,
  notes: 'Değer kaybı oranları sektör ortalamaları baz alınmıştır. Gerçek değer kaybı araca, kullanıma ve pazar koşullarına göre değişir.',
  segments: [
    {
      id: 'sedan',
      segment: 'Sedan',
      displayName: 'Sedan Araçlar',
      description:
        'Orta segment sedan araçlar (Toyota Corolla, Renault Megane, Fiat Egea, vb.)',
      baseDepreciation: [
        { year: 0, depreciation: 0, retentionRate: 100 },
        { year: 1, depreciation: 18, retentionRate: 82 },
        { year: 2, depreciation: 27, retentionRate: 73 },
        { year: 3, depreciation: 35, retentionRate: 65 },
        { year: 4, depreciation: 42, retentionRate: 58 },
        { year: 5, depreciation: 48, retentionRate: 52 },
        { year: 6, depreciation: 53, retentionRate: 47 },
        { year: 7, depreciation: 57, retentionRate: 43 },
        { year: 8, depreciation: 61, retentionRate: 39 },
        { year: 9, depreciation: 64, retentionRate: 36 },
        { year: 10, depreciation: 67, retentionRate: 33 },
        { year: 11, depreciation: 69, retentionRate: 31 },
        { year: 12, depreciation: 71, retentionRate: 29 },
        { year: 13, depreciation: 73, retentionRate: 27 },
        { year: 14, depreciation: 74, retentionRate: 26 },
        { year: 15, depreciation: 75, retentionRate: 25 },
      ],
      adjustments: {
        highMileage: -8,
        lowMileage: 5,
        fuelTypeMultiplier: {
          benzin: 1.0,
          dizel: 0.95,
          lpg: 0.88,
          hibrit: 1.12,
          elektrik: 1.05,
        },
      },
    },
    {
      id: 'hatchback',
      segment: 'Hatchback',
      displayName: 'Hatchback Araçlar',
      description: 'Kompakt hatchback araçlar (Renault Clio, Fiat 500, Hyundai i20, vb.)',
      baseDepreciation: [
        { year: 0, depreciation: 0, retentionRate: 100 },
        { year: 1, depreciation: 16, retentionRate: 84 },
        { year: 2, depreciation: 25, retentionRate: 75 },
        { year: 3, depreciation: 33, retentionRate: 67 },
        { year: 4, depreciation: 40, retentionRate: 60 },
        { year: 5, depreciation: 46, retentionRate: 54 },
        { year: 6, depreciation: 51, retentionRate: 49 },
        { year: 7, depreciation: 55, retentionRate: 45 },
        { year: 8, depreciation: 58, retentionRate: 42 },
        { year: 9, depreciation: 61, retentionRate: 39 },
        { year: 10, depreciation: 64, retentionRate: 36 },
        { year: 11, depreciation: 66, retentionRate: 34 },
        { year: 12, depreciation: 68, retentionRate: 32 },
        { year: 13, depreciation: 69, retentionRate: 31 },
        { year: 14, depreciation: 70, retentionRate: 30 },
        { year: 15, depreciation: 71, retentionRate: 29 },
      ],
      adjustments: {
        highMileage: -9,
        lowMileage: 6,
        fuelTypeMultiplier: {
          benzin: 1.0,
          dizel: 0.93,
          lpg: 0.85,
          hibrit: 1.1,
          elektrik: 1.08,
        },
      },
    },
    {
      id: 'suv',
      segment: 'SUV',
      displayName: 'SUV Araçlar',
      description: 'Compact ve orta SUV araçlar (Renault Duster, Hyundai Tucson, Honda CR-V, vb.)',
      baseDepreciation: [
        { year: 0, depreciation: 0, retentionRate: 100 },
        { year: 1, depreciation: 15, retentionRate: 85 },
        { year: 2, depreciation: 24, retentionRate: 76 },
        { year: 3, depreciation: 32, retentionRate: 68 },
        { year: 4, depreciation: 39, retentionRate: 61 },
        { year: 5, depreciation: 45, retentionRate: 55 },
        { year: 6, depreciation: 50, retentionRate: 50 },
        { year: 7, depreciation: 54, retentionRate: 46 },
        { year: 8, depreciation: 57, retentionRate: 43 },
        { year: 9, depreciation: 60, retentionRate: 40 },
        { year: 10, depreciation: 63, retentionRate: 37 },
        { year: 11, depreciation: 65, retentionRate: 35 },
        { year: 12, depreciation: 67, retentionRate: 33 },
        { year: 13, depreciation: 68, retentionRate: 32 },
        { year: 14, depreciation: 69, retentionRate: 31 },
        { year: 15, depreciation: 70, retentionRate: 30 },
      ],
      adjustments: {
        highMileage: -10,
        lowMileage: 7,
        fuelTypeMultiplier: {
          benzin: 1.0,
          dizel: 0.98,
          lpg: 0.90,
          hibrit: 1.15,
          elektrik: 1.12,
        },
      },
    },
    {
      id: 'premium',
      segment: 'Premium/Lüks',
      displayName: 'Premium ve Lüks Araçlar',
      description: 'BMW, Mercedes-Benz, Audi, Volvo gibi premium segment araçlar',
      baseDepreciation: [
        { year: 0, depreciation: 0, retentionRate: 100 },
        { year: 1, depreciation: 22, retentionRate: 78 },
        { year: 2, depreciation: 33, retentionRate: 67 },
        { year: 3, depreciation: 42, retentionRate: 58 },
        { year: 4, depreciation: 50, retentionRate: 50 },
        { year: 5, depreciation: 56, retentionRate: 44 },
        { year: 6, depreciation: 61, retentionRate: 39 },
        { year: 7, depreciation: 65, retentionRate: 35 },
        { year: 8, depreciation: 68, retentionRate: 32 },
        { year: 9, depreciation: 71, retentionRate: 29 },
        { year: 10, depreciation: 73, retentionRate: 27 },
        { year: 11, depreciation: 75, retentionRate: 25 },
        { year: 12, depreciation: 76, retentionRate: 24 },
        { year: 13, depreciation: 77, retentionRate: 23 },
        { year: 14, depreciation: 78, retentionRate: 22 },
        { year: 15, depreciation: 79, retentionRate: 21 },
      ],
      adjustments: {
        highMileage: -12,
        lowMileage: 4,
        fuelTypeMultiplier: {
          benzin: 1.0,
          dizel: 1.02,
          lpg: 0.78,
          hibrit: 1.18,
          elektrik: 1.25,
        },
      },
    },
    {
      id: 'ticari',
      segment: 'Ticari Araçlar',
      displayName: 'Ticari Araçlar',
      description: 'Kamyon, kamyonet, minibüs gibi ticari kullanıma yönelik araçlar',
      baseDepreciation: [
        { year: 0, depreciation: 0, retentionRate: 100 },
        { year: 1, depreciation: 20, retentionRate: 80 },
        { year: 2, depreciation: 30, retentionRate: 70 },
        { year: 3, depreciation: 38, retentionRate: 62 },
        { year: 4, depreciation: 45, retentionRate: 55 },
        { year: 5, depreciation: 51, retentionRate: 49 },
        { year: 6, depreciation: 56, retentionRate: 44 },
        { year: 7, depreciation: 60, retentionRate: 40 },
        { year: 8, depreciation: 63, retentionRate: 37 },
        { year: 9, depreciation: 66, retentionRate: 34 },
        { year: 10, depreciation: 68, retentionRate: 32 },
        { year: 11, depreciation: 70, retentionRate: 30 },
        { year: 12, depreciation: 72, retentionRate: 28 },
        { year: 13, depreciation: 73, retentionRate: 27 },
        { year: 14, depreciation: 74, retentionRate: 26 },
        { year: 15, depreciation: 75, retentionRate: 25 },
      ],
      adjustments: {
        highMileage: -15,
        lowMileage: 3,
        fuelTypeMultiplier: {
          benzin: 0.95,
          dizel: 1.0,
          lpg: 0.88,
          hibrit: 1.0,
          elektrik: 1.05,
        },
      },
    },
    {
      id: 'elektrik',
      segment: 'Elektrik',
      displayName: 'Elektrik Araçlar',
      description: 'Tamamen elektrik güçlü araçlar (TOGG T10X, Tesla, vb.)',
      baseDepreciation: [
        { year: 0, depreciation: 0, retentionRate: 100 },
        { year: 1, depreciation: 12, retentionRate: 88 },
        { year: 2, depreciation: 20, retentionRate: 80 },
        { year: 3, depreciation: 27, retentionRate: 73 },
        { year: 4, depreciation: 33, retentionRate: 67 },
        { year: 5, depreciation: 38, retentionRate: 62 },
        { year: 6, depreciation: 42, retentionRate: 58 },
        { year: 7, depreciation: 45, retentionRate: 55 },
        { year: 8, depreciation: 48, retentionRate: 52 },
        { year: 9, depreciation: 50, retentionRate: 50 },
        { year: 10, depreciation: 52, retentionRate: 48 },
        { year: 11, depreciation: 54, retentionRate: 46 },
        { year: 12, depreciation: 55, retentionRate: 45 },
        { year: 13, depreciation: 56, retentionRate: 44 },
        { year: 14, depreciation: 57, retentionRate: 43 },
        { year: 15, depreciation: 58, retentionRate: 42 },
      ],
      adjustments: {
        highMileage: -6,
        lowMileage: 8,
        fuelTypeMultiplier: {
          benzin: 0.5,
          dizel: 0.5,
          lpg: 0.5,
          hibrit: 0.8,
          elektrik: 1.0,
        },
      },
    },
  ],
  assumptions: {
    averageKmPerYear: 15000,
    calculationMethod:
      'Yüzdesel amortisman modeli - 1. yılda yüksek değer kaybı, sonraki yıllarda daha düşük oran',
  },
};
