/**
 * TÜVTÜRK Muayene Ücretleri 2026
 * Kaynak: TÜVTÜRK 2026 Resmi Fiyat Tarifesi
 *         (27 Kasım 2025 tarihli Resmi Gazete — %25.49 yeniden değerleme oranı)
 *
 * 2026 TARIFE YAPISI:
 * - 3 araç kategorisi: Hafif (otomobil/minibüs/kamyonet), Ağır (otobüs/kamyon),
 *   Motosiklet/Traktör
 * - Periyodik muayene tek fiyat (yaş ayrımı yok)
 * - 0-3 yaş yeni araçlar muayeneden muaf
 * - Tekrar muayene yaklaşık yarı fiyat
 * - Egzoz emisyon ölçümü tüm araçlar için sabit (elektrikli hariç)
 *
 * Doğrulanmış kaynaklar:
 * - https://www.sozcu.com.tr/tuvturk-2026-muayene-ucretleri-belli-oldu-...
 * - https://bigpara.hurriyet.com.tr/ekonomi-haberleri/galeri-arac-muayene-ucreti-2026-...
 * - https://www.tuvturk.com.tr/arac-muayene-fiyat-listesi.aspx
 * - https://www.iscihaber.net/otomobil/arac-muayene-ucretlerine-yuzde-2549-zam-...
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
      description: 'Yolcu taşıması için imal edilen araçlar — TÜVTÜRK kategorisi: Otomobil/Minibüs/Kamyonet/SUV (3.288 TL)',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 3288.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 3288.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 3288.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 1644.00,
        },
        {
          inspectionType: 'Egzoz Emisyon Ölçüm (Benzin)',
          amount: 460.00,
        },
        {
          inspectionType: 'Egzoz Emisyon Ölçüm (Dizel)',
          amount: 460.00,
        },
      ],
    },
    {
      id: 'minibus',
      vehicleType: 'Minibüs',
      displayName: 'Minibüs (7-8 Kişi)',
      description: 'Hafif yolcu araçları — TÜVTÜRK aynı kategoride (3.288 TL)',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 3288.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 3288.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 3288.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 1644.00,
        },
      ],
    },
    {
      id: 'otobüs',
      vehicleType: 'Otobüs',
      displayName: 'Otobüs (>9 Kişi)',
      description: 'Ağır vasıta — TÜVTÜRK kategorisi: Otobüs/Kamyon/Çekici/Tanker (4.446 TL)',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 4446.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 4446.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 4446.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 2223.00,
        },
      ],
    },
    {
      id: 'kamyonet',
      vehicleType: 'Kamyonet',
      displayName: 'Kamyonet (Açık Platform)',
      description: 'Hafif ticari araç — TÜVTÜRK aynı kategoride (3.288 TL)',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 3288.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 3288.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 3288.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 1644.00,
        },
        {
          inspectionType: 'Egzoz Emisyon Ölçüm (Benzin)',
          amount: 460.00,
        },
        {
          inspectionType: 'Egzoz Emisyon Ölçüm (Dizel)',
          amount: 460.00,
        },
      ],
    },
    {
      id: 'kamyon',
      vehicleType: 'Kamyon',
      displayName: 'Kamyon (Kapalı Platform)',
      description: 'Ağır vasıta — TÜVTÜRK kategorisi: Otobüs/Kamyon/Çekici/Tanker (4.446 TL)',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 4446.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 4446.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 4446.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 2223.00,
        },
        {
          inspectionType: 'Egzoz Emisyon Ölçüm (Dizel)',
          amount: 460.00,
        },
      ],
    },
    {
      id: 'tirlar',
      vehicleType: 'Tırlar',
      displayName: 'Tırlar (Çekici + Dorse)',
      description: 'Ağır vasıta — TÜVTÜRK kategorisi: Çekici/Tanker (4.446 TL)',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 4446.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 4446.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 4446.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 2223.00,
        },
        {
          inspectionType: 'Egzoz Emisyon Ölçüm (Dizel)',
          amount: 460.00,
        },
      ],
    },
    {
      id: 'motosiklet',
      vehicleType: 'Motosiklet',
      displayName: 'Motosiklet / Scooter',
      description: 'İki tekerlekli motorlu araç — TÜVTÜRK kategorisi: Motosiklet/Traktör (1.674 TL)',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 1674.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 1674.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 1674.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 837.00,
        },
      ],
    },
    {
      id: 'elektrik_arac',
      vehicleType: 'Elektrik Araç',
      displayName: 'Elektrik Araç (EV)',
      description: 'Elektrikli araç — Otomobil kategorisinde, egzoz ölçümü yok (3.288 TL)',
      fees: [
        {
          inspectionType: 'İlk Muayene (Yeni Araç)',
          amount: 3288.00,
        },
        {
          inspectionType: 'Periyodik Muayene (1-3 yaş)',
          amount: 3288.00,
        },
        {
          inspectionType: 'Periyodik Muayene (4+ yaş)',
          amount: 3288.00,
        },
        {
          inspectionType: 'Muayeneden Kalma (Tekrar Muayene)',
          amount: 1644.00,
        },
      ],
    },
  ],
  additionalFees: {
    'Yola Elverişlilik Muayenesi (Otomobil)': 822.00,
    'Yola Elverişlilik Muayenesi (Ağır Vasıta)': 1111.50,
  },
};
