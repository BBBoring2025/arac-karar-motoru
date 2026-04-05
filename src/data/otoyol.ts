/**
 * KGM Otoyol ve Köprü Ücretleri 2026
 * Kaynak: Karayolları Genel Müdürlüğü (KGM)
 * HGS (Hızlı Geçiş Sistemi) ve OGS (Otomatik Geçiş Sistemi) fiyatları
 */

export interface TollPrice {
  hgs: number; // TL - HGS fiyatı (%10 indirim)
  ogs: number; // TL - OGS fiyatı
}

export interface TollRoute {
  id: string;
  name: string;
  displayName: string;
  type: 'highway' | 'bridge' | 'tunnel';
  region: string;
  vehicleClasses: {
    [key: string]: TollPrice;
  };
}

export interface TollData {
  year: number;
  lastUpdated: string;
  vehicleClasses: {
    [key: string]: {
      id: string;
      name: string;
      examples: string;
    };
  };
  routes: TollRoute[];
}

/**
 * Araç Sınıfları:
 * 1: Otomobil (Light vehicles up to 3.5 ton)
 * 2: Minibüs (7-8 seats)
 * 3: Otobüs (>9 seats)
 * 4: Kamyonet (Light commercial)
 * 5: Kamyon/Tır (Heavy commercial >3.5 ton)
 */

export const tollData: TollData = {
  year: 2026,
  lastUpdated: '2026-04-05',
  vehicleClasses: {
    '1': {
      id: '1',
      name: 'Otomobil',
      examples: 'Sedan, Hatchback, SUV, Coupe',
    },
    '2': {
      id: '2',
      name: 'Minibüs',
      examples: '7-8 kişilik araçlar',
    },
    '3': {
      id: '3',
      name: 'Otobüs',
      examples: '9+ kişilik araçlar',
    },
    '4': {
      id: '4',
      name: 'Kamyonet',
      examples: 'Ticari araçlar, pickup',
    },
    '5': {
      id: '5',
      name: 'Kamyon/Tır',
      examples: 'Ağır ticari araçlar >3.5 ton',
    },
  },
  routes: [
    {
      id: 'o1',
      name: 'O-1 Otoyolu',
      displayName: 'O-1 (İstanbul Sahası)',
      type: 'highway',
      region: 'Marmara',
      vehicleClasses: {
        '1': { hgs: 25, ogs: 25 },
        '2': { hgs: 38, ogs: 38 },
        '3': { hgs: 50, ogs: 50 },
        '4': { hgs: 63, ogs: 63 },
        '5': { hgs: 88, ogs: 88 },
      },
    },
    {
      id: 'o2',
      name: 'O-2 Otoyolu',
      displayName: 'O-2 (Ankara-İstanbul)',
      type: 'highway',
      region: 'İç Anadolu',
      vehicleClasses: {
        '1': { hgs: 120, ogs: 120 },
        '2': { hgs: 180, ogs: 180 },
        '3': { hgs: 240, ogs: 240 },
        '4': { hgs: 300, ogs: 300 },
        '5': { hgs: 420, ogs: 420 },
      },
    },
    {
      id: 'o3',
      name: 'O-3 Otoyolu',
      displayName: 'O-3 (Ankara-Adana)',
      type: 'highway',
      region: 'İç Anadolu',
      vehicleClasses: {
        '1': { hgs: 90, ogs: 90 },
        '2': { hgs: 135, ogs: 135 },
        '3': { hgs: 180, ogs: 180 },
        '4': { hgs: 225, ogs: 225 },
        '5': { hgs: 315, ogs: 315 },
      },
    },
    {
      id: 'o4',
      name: 'O-4 Otoyolu',
      displayName: 'O-4 (Ankara-Samsun)',
      type: 'highway',
      region: 'Karadeniz',
      vehicleClasses: {
        '1': { hgs: 80, ogs: 80 },
        '2': { hgs: 120, ogs: 120 },
        '3': { hgs: 160, ogs: 160 },
        '4': { hgs: 200, ogs: 200 },
        '5': { hgs: 280, ogs: 280 },
      },
    },
    {
      id: 'o5',
      name: 'O-5 Otoyolu',
      displayName: 'O-5 (İzmir-Ankara)',
      type: 'highway',
      region: 'Ege',
      vehicleClasses: {
        '1': { hgs: 100, ogs: 100 },
        '2': { hgs: 150, ogs: 150 },
        '3': { hgs: 200, ogs: 200 },
        '4': { hgs: 250, ogs: 250 },
        '5': { hgs: 350, ogs: 350 },
      },
    },
    {
      id: 'o6',
      name: 'O-6 Otoyolu',
      displayName: 'O-6 (Adana-Mersin)',
      type: 'highway',
      region: 'Akdeniz',
      vehicleClasses: {
        '1': { hgs: 20, ogs: 20 },
        '2': { hgs: 30, ogs: 30 },
        '3': { hgs: 40, ogs: 40 },
        '4': { hgs: 50, ogs: 50 },
        '5': { hgs: 70, ogs: 70 },
      },
    },
    {
      id: 'o7',
      name: 'O-7 Otoyolu',
      displayName: 'O-7 (Gaziantep-Adana)',
      type: 'highway',
      region: 'Güneydoğu Anadolu',
      vehicleClasses: {
        '1': { hgs: 60, ogs: 60 },
        '2': { hgs: 90, ogs: 90 },
        '3': { hgs: 120, ogs: 120 },
        '4': { hgs: 150, ogs: 150 },
        '5': { hgs: 210, ogs: 210 },
      },
    },
    {
      id: 'osmangazi_bridge',
      name: 'Osmangazi Köprüsü',
      displayName: 'Osmangazi Köprüsü (İzmit)',
      type: 'bridge',
      region: 'Marmara',
      vehicleClasses: {
        '1': { hgs: 995, ogs: 995 },
        '2': { hgs: 1590, ogs: 1590 },
        '3': { hgs: 1890, ogs: 1890 },
        '4': { hgs: 2505, ogs: 2505 },
        '5': { hgs: 3165, ogs: 3165 },
      },
    },
    {
      id: '15temmuz_bridge',
      name: '15 Temmuz Şehitler Köprüsü',
      displayName: '15 Temmuz Şehitler Köprüsü (Boğaziçi)',
      type: 'bridge',
      region: 'Marmara',
      vehicleClasses: {
        '1': { hgs: 59, ogs: 59 },
        '2': { hgs: 88, ogs: 88 },
        '3': { hgs: 118, ogs: 118 },
        '4': { hgs: 147, ogs: 147 },
        '5': { hgs: 206, ogs: 206 },
      },
    },
    {
      id: 'fsm_bridge',
      name: 'Fatih Sultan Mehmet Köprüsü',
      displayName: 'Fatih Sultan Mehmet Köprüsü (Boğaziçi)',
      type: 'bridge',
      region: 'Marmara',
      vehicleClasses: {
        '1': { hgs: 59, ogs: 59 },
        '2': { hgs: 88, ogs: 88 },
        '3': { hgs: 118, ogs: 118 },
        '4': { hgs: 147, ogs: 147 },
        '5': { hgs: 206, ogs: 206 },
      },
    },
    {
      id: 'yavuz_sultan_selim_bridge',
      name: 'Yavuz Sultan Selim Köprüsü',
      displayName: 'Yavuz Sultan Selim Köprüsü (3. Boğaziçi)',
      type: 'bridge',
      region: 'Marmara',
      vehicleClasses: {
        '1': { hgs: 95, ogs: 95 },
        '2': { hgs: 143, ogs: 143 },
        '3': { hgs: 190, ogs: 190 },
        '4': { hgs: 238, ogs: 238 },
        '5': { hgs: 333, ogs: 333 },
      },
    },
    {
      id: 'avrasya_tunnel',
      name: 'Avrasya Tüneli',
      displayName: 'Avrasya Tüneli (Boğaziçi Geçiş — Gündüz Tarifesi)',
      type: 'tunnel',
      region: 'Marmara',
      vehicleClasses: {
        '1': { hgs: 280, ogs: 280 },
        '2': { hgs: 420, ogs: 420 },
        '3': { hgs: 0, ogs: 0 },
        '4': { hgs: 0, ogs: 0 },
        '5': { hgs: 0, ogs: 0 },
      },
    },
    {
      id: 'dardanelles_bridge',
      name: '1915 Çanakkale Köprüsü',
      displayName: '1915 Çanakkale Köprüsü',
      type: 'bridge',
      region: 'Marmara',
      vehicleClasses: {
        '1': { hgs: 995, ogs: 995 },
        '2': { hgs: 1245, ogs: 1245 },
        '3': { hgs: 2240, ogs: 2240 },
        '4': { hgs: 2490, ogs: 2490 },
        '5': { hgs: 3755, ogs: 3755 },
      },
    },
  ],
};
