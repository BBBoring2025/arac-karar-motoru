/**
 * TÜVTÜRK Muayene Ücretleri 2026
 * Kaynak: TÜVTÜRK (Türkiye Araştırmaları ve Kalite Kontrol Enstitüsü)
 * Muayene ve Emisyon Ölçüm Ücretleri
 */

export interface InspectionFee {
  inspectionType: string;
  amount: number; // TL
}

export interface VehicleTypeInspection {
  id: string;
  vehicleType: string;
  displayName: string;
  description: string;
  minYear?: number;
  maxYear?: number;
  fees: InspectionFee[];
}

export interface InspectionData {
  year: number;
  lastUpdated: string;
  sourceLabel: string;
  sourceUrl: string;
  effectiveDate: string;
  confidence: 'kesin' | 'yaklaşık' | 'tahmini';
  vehicleTypes: VehicleTypeInspection[];
  additionalFees: {
    [key: string]: number;
  };
}

export const inspectionData: InspectionData = {
  year: 2026,
  lastUpdated: '2026-01-01',
  sourceLabel: 'TÜVTÜRK 2026 Muayene Ücret Tarifesi',
  sourceUrl: 'https://www.tuvturk.com.tr',
  effectiveDate: '2026-01-01',
  confidence: 'kesin' as const,
  vehicleTypes: [
    {
      id: 'otomobil',
      vehicleType: 'Otomobil',
      displayName: 'Otomobil (Sedan, Hatchback, SUV)',
      description: 'Yolcu taşıması için imal edilen araçlar',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 175.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 125.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 150.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 100.00,
        },
        {
          inspectionType: 'Egzoz Emisyon Ölçüm (Benzin)',
          amount: 50.00,
        },
        {
          inspectionType: 'Egzoz Emisyon Ölçüm (Dizel)',
          amount: 60.00,
        },
      ],
    },
    {
      id: 'minibus',
      vehicleType: 'Minibüs',
      displayName: 'Minibüs (7-8 Kişi)',
      description: 'Sınırlı sayıda yolcu taşıması için imal edilen araçlar',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 220.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 160.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 190.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 120.00,
        },
      ],
    },
    {
      id: 'otobüs',
      vehicleType: 'Otobüs',
      displayName: 'Otobüs (>9 Kişi)',
      description: 'Çok sayıda yolcu taşıması için imal edilen araçlar',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 300.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 200.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 240.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 150.00,
        },
      ],
    },
    {
      id: 'kamyonet',
      vehicleType: 'Kamyonet',
      displayName: 'Kamyonet (Açık Platform)',
      description: 'Eşya ve yük taşıması için imal edilen hafif araçlar',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 200.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 150.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 175.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 110.00,
        },
        {
          inspectionType: 'Egzoz Emisyon Ölçüm (Benzin)',
          amount: 50.00,
        },
        {
          inspectionType: 'Egzoz Emisyon Ölçüm (Dizel)',
          amount: 60.00,
        },
      ],
    },
    {
      id: 'kamyon',
      vehicleType: 'Kamyon',
      displayName: 'Kamyon (Kapalı Platform)',
      description: 'Eşya ve yük taşıması için imal edilen ağır araçlar',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 350.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 220.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 260.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 160.00,
        },
        {
          inspectionType: 'Egzoz Emisyon Ölçüm (Dizel)',
          amount: 70.00,
        },
      ],
    },
    {
      id: 'tirlar',
      vehicleType: 'Tırlar',
      displayName: 'Tırlar (Çekici + Dorse)',
      description: 'Yol çekicilik veya tren şeklinde taşıt oluşturmak için tasarlanan araçlar',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 400.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 250.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 300.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 180.00,
        },
        {
          inspectionType: 'Egzoz Emisyon Ölçüm (Dizel)',
          amount: 80.00,
        },
      ],
    },
    {
      id: 'motosiklet',
      vehicleType: 'Motosiklet',
      displayName: 'Motosiklet / Scooter',
      description: 'İki tekerlekli motorlu araçlar',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 75.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 60.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 75.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 45.00,
        },
      ],
    },
    {
      id: 'elektrik_arac',
      vehicleType: 'Elektrik Araç',
      displayName: 'Elektrik Araç (EV)',
      description: 'Tamamen elektrik enerjisiyle çalışan araçlar',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 150.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 100.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 125.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 80.00,
        },
      ],
    },
  ],
  additionalFees: {
    'Teknik Kontrol Sertifikası (İlk Defa)': 50.00,
    'Teknik Kontrol Sertifikası (Yenileme)': 30.00,
    'Araç Kimlik Belgesi Çıkarma': 40.00,
    'İtfaiye İnceleme Ücreti': 50.00,
    'Hususi Araç İncelemesi': 150.00,
    'Araç Tasarım Değişikliği Müdür İncelemesi': 200.00,
  },
};
