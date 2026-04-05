/**
 * MTV (Motorlu Taşıtlar Vergisi) 2026 Tarifeleri
 * Kaynak: GİB (Gelir İdaresi Başkanlığı) Tebliğ - 2026 yılı
 * Veriler: 1 TL = sabit kur baz alınmıştır
 */

export interface MTVBracket {
  id: string;
  engineSizeMin: number; // cc
  engineSizeMax: number; // cc
  displayName: string;
  ageGroups: {
    [ageGroup: string]: number; // TL
  };
}

export interface MTVData {
  year: number;
  lastUpdated: string; // ISO date
  sourceLabel: string;
  sourceUrl: string;
  effectiveDate: string;
  confidence: 'kesin' | 'yaklaşık' | 'tahmini';
  gasoline: MTVBracket[];
  diesel: MTVBracket[];
  lpg: MTVBracket[];
  electric: {
    [ageGroup: string]: number; // TL - sabit EV rates
  };
  hybrid: MTVBracket[];
}

export const mtvData: MTVData = {
  year: 2026,
  lastUpdated: '2026-01-01',
  sourceLabel: 'GİB (Gelir İdaresi Başkanlığı) 2026 MTV Tebliği',
  sourceUrl: 'https://www.gib.gov.tr',
  effectiveDate: '2026-01-01',
  confidence: 'kesin' as const,
  gasoline: [
    {
      id: 'gas_1',
      engineSizeMin: 1,
      engineSizeMax: 1300,
      displayName: '1-1300cc',
      ageGroups: {
        '1-3': 3950,
        '4-6': 5200,
        '7-11': 7100,
        '12-15': 10200,
        '16+': 15800,
      },
    },
    {
      id: 'gas_2',
      engineSizeMin: 1301,
      engineSizeMax: 1600,
      displayName: '1301-1600cc',
      ageGroups: {
        '1-3': 6900,
        '4-6': 9100,
        '7-11': 12400,
        '12-15': 17900,
        '16+': 27600,
      },
    },
    {
      id: 'gas_3',
      engineSizeMin: 1601,
      engineSizeMax: 1800,
      displayName: '1601-1800cc',
      ageGroups: {
        '1-3': 8500,
        '4-6': 11200,
        '7-11': 15300,
        '12-15': 22100,
        '16+': 34100,
      },
    },
    {
      id: 'gas_4',
      engineSizeMin: 1801,
      engineSizeMax: 2000,
      displayName: '1801-2000cc',
      ageGroups: {
        '1-3': 10200,
        '4-6': 13400,
        '7-11': 18300,
        '12-15': 26500,
        '16+': 40900,
      },
    },
    {
      id: 'gas_5',
      engineSizeMin: 2001,
      engineSizeMax: 2500,
      displayName: '2001-2500cc',
      ageGroups: {
        '1-3': 14100,
        '4-6': 18600,
        '7-11': 25400,
        '12-15': 36800,
        '16+': 56700,
      },
    },
    {
      id: 'gas_6',
      engineSizeMin: 2501,
      engineSizeMax: 3000,
      displayName: '2501-3000cc',
      ageGroups: {
        '1-3': 18900,
        '4-6': 24900,
        '7-11': 34000,
        '12-15': 49200,
        '16+': 75900,
      },
    },
    {
      id: 'gas_7',
      engineSizeMin: 3001,
      engineSizeMax: 3500,
      displayName: '3001-3500cc',
      ageGroups: {
        '1-3': 23800,
        '4-6': 31400,
        '7-11': 42900,
        '12-15': 62100,
        '16+': 95700,
      },
    },
    {
      id: 'gas_8',
      engineSizeMin: 3501,
      engineSizeMax: 4000,
      displayName: '3501-4000cc',
      ageGroups: {
        '1-3': 29700,
        '4-6': 39200,
        '7-11': 53600,
        '12-15': 77600,
        '16+': 119600,
      },
    },
    {
      id: 'gas_9',
      engineSizeMin: 4001,
      engineSizeMax: 999999,
      displayName: '4001cc+',
      ageGroups: {
        '1-3': 35600,
        '4-6': 47000,
        '7-11': 64300,
        '12-15': 93100,
        '16+': 143500,
      },
    },
  ],
  diesel: [
    {
      id: 'diesel_1',
      engineSizeMin: 1,
      engineSizeMax: 1300,
      displayName: '1-1300cc',
      ageGroups: {
        '1-3': 3450,
        '4-6': 4550,
        '7-11': 6200,
        '12-15': 8900,
        '16+': 13700,
      },
    },
    {
      id: 'diesel_2',
      engineSizeMin: 1301,
      engineSizeMax: 1600,
      displayName: '1301-1600cc',
      ageGroups: {
        '1-3': 5100,
        '4-6': 6700,
        '7-11': 9200,
        '12-15': 13300,
        '16+': 20500,
      },
    },
    {
      id: 'diesel_3',
      engineSizeMin: 1601,
      engineSizeMax: 1800,
      displayName: '1601-1800cc',
      ageGroups: {
        '1-3': 6400,
        '4-6': 8400,
        '7-11': 11500,
        '12-15': 16600,
        '16+': 25600,
      },
    },
    {
      id: 'diesel_4',
      engineSizeMin: 1801,
      engineSizeMax: 2000,
      displayName: '1801-2000cc',
      ageGroups: {
        '1-3': 7700,
        '4-6': 10100,
        '7-11': 13800,
        '12-15': 19900,
        '16+': 30700,
      },
    },
    {
      id: 'diesel_5',
      engineSizeMin: 2001,
      engineSizeMax: 2500,
      displayName: '2001-2500cc',
      ageGroups: {
        '1-3': 10700,
        '4-6': 14100,
        '7-11': 19300,
        '12-15': 27900,
        '16+': 43000,
      },
    },
    {
      id: 'diesel_6',
      engineSizeMin: 2501,
      engineSizeMax: 3000,
      displayName: '2501-3000cc',
      ageGroups: {
        '1-3': 14400,
        '4-6': 18900,
        '7-11': 25900,
        '12-15': 37500,
        '16+': 57800,
      },
    },
    {
      id: 'diesel_7',
      engineSizeMin: 3001,
      engineSizeMax: 3500,
      displayName: '3001-3500cc',
      ageGroups: {
        '1-3': 18200,
        '4-6': 23900,
        '7-11': 32700,
        '12-15': 47300,
        '16+': 72900,
      },
    },
    {
      id: 'diesel_8',
      engineSizeMin: 3501,
      engineSizeMax: 4000,
      displayName: '3501-4000cc',
      ageGroups: {
        '1-3': 22800,
        '4-6': 30000,
        '7-11': 41000,
        '12-15': 59400,
        '16+': 91600,
      },
    },
    {
      id: 'diesel_9',
      engineSizeMin: 4001,
      engineSizeMax: 999999,
      displayName: '4001cc+',
      ageGroups: {
        '1-3': 27400,
        '4-6': 36100,
        '7-11': 49400,
        '12-15': 71600,
        '16+': 110400,
      },
    },
  ],
  lpg: [
    {
      id: 'lpg_1',
      engineSizeMin: 1,
      engineSizeMax: 1300,
      displayName: '1-1300cc',
      ageGroups: {
        '1-3': 2800,
        '4-6': 3700,
        '7-11': 5100,
        '12-15': 7300,
        '16+': 11300,
      },
    },
    {
      id: 'lpg_2',
      engineSizeMin: 1301,
      engineSizeMax: 1600,
      displayName: '1301-1600cc',
      ageGroups: {
        '1-3': 4200,
        '4-6': 5500,
        '7-11': 7500,
        '12-15': 10800,
        '16+': 16700,
      },
    },
    {
      id: 'lpg_3',
      engineSizeMin: 1601,
      engineSizeMax: 1800,
      displayName: '1601-1800cc',
      ageGroups: {
        '1-3': 5200,
        '4-6': 6800,
        '7-11': 9300,
        '12-15': 13500,
        '16+': 20800,
      },
    },
    {
      id: 'lpg_4',
      engineSizeMin: 1801,
      engineSizeMax: 2000,
      displayName: '1801-2000cc',
      ageGroups: {
        '1-3': 6300,
        '4-6': 8300,
        '7-11': 11400,
        '12-15': 16500,
        '16+': 25400,
      },
    },
    {
      id: 'lpg_5',
      engineSizeMin: 2001,
      engineSizeMax: 2500,
      displayName: '2001-2500cc',
      ageGroups: {
        '1-3': 8900,
        '4-6': 11700,
        '7-11': 16000,
        '12-15': 23200,
        '16+': 35700,
      },
    },
    {
      id: 'lpg_6',
      engineSizeMin: 2501,
      engineSizeMax: 3000,
      displayName: '2501-3000cc',
      ageGroups: {
        '1-3': 11900,
        '4-6': 15700,
        '7-11': 21500,
        '12-15': 31200,
        '16+': 48100,
      },
    },
    {
      id: 'lpg_7',
      engineSizeMin: 3001,
      engineSizeMax: 3500,
      displayName: '3001-3500cc',
      ageGroups: {
        '1-3': 15100,
        '4-6': 19900,
        '7-11': 27200,
        '12-15': 39500,
        '16+': 60900,
      },
    },
    {
      id: 'lpg_8',
      engineSizeMin: 3501,
      engineSizeMax: 4000,
      displayName: '3501-4000cc',
      ageGroups: {
        '1-3': 18900,
        '4-6': 24900,
        '7-11': 34100,
        '12-15': 49400,
        '16+': 76100,
      },
    },
    {
      id: 'lpg_9',
      engineSizeMin: 4001,
      engineSizeMax: 999999,
      displayName: '4001cc+',
      ageGroups: {
        '1-3': 22700,
        '4-6': 29900,
        '7-11': 40900,
        '12-15': 59300,
        '16+': 91400,
      },
    },
  ],
  electric: {
    '1-3': 0,
    '4-6': 0,
    '7-11': 0,
    '12-15': 0,
    '16+': 0,
  },
  hybrid: [
    {
      id: 'hybrid_1',
      engineSizeMin: 1,
      engineSizeMax: 1300,
      displayName: '1-1300cc',
      ageGroups: {
        '1-3': 1975,
        '4-6': 2600,
        '7-11': 3550,
        '12-15': 5100,
        '16+': 7900,
      },
    },
    {
      id: 'hybrid_2',
      engineSizeMin: 1301,
      engineSizeMax: 1600,
      displayName: '1301-1600cc',
      ageGroups: {
        '1-3': 3450,
        '4-6': 4550,
        '7-11': 6200,
        '12-15': 8900,
        '16+': 13800,
      },
    },
    {
      id: 'hybrid_3',
      engineSizeMin: 1601,
      engineSizeMax: 1800,
      displayName: '1601-1800cc',
      ageGroups: {
        '1-3': 4250,
        '4-6': 5600,
        '7-11': 7650,
        '12-15': 11050,
        '16+': 17050,
      },
    },
    {
      id: 'hybrid_4',
      engineSizeMin: 1801,
      engineSizeMax: 2000,
      displayName: '1801-2000cc',
      ageGroups: {
        '1-3': 5100,
        '4-6': 6700,
        '7-11': 9150,
        '12-15': 13250,
        '16+': 20450,
      },
    },
    {
      id: 'hybrid_5',
      engineSizeMin: 2001,
      engineSizeMax: 2500,
      displayName: '2001-2500cc',
      ageGroups: {
        '1-3': 7050,
        '4-6': 9300,
        '7-11': 12700,
        '12-15': 18400,
        '16+': 28350,
      },
    },
  ],
};
