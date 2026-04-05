/**
 * Noter Ücretleri 2026
 * Kaynak: Adalet Bakanlığı - Noter Ücret Tarifeleri
 * Araç satış ve tescil işlemleri için gerekli noter hizmetleri
 */

export interface NoterFeeScale {
  minAmount: number; // TL
  maxAmount: number; // TL
  feePercentage: number; // Ücret yüzdesi (%)
  fixedAmount?: number; // Sabit ücret (yüzdeden düşük ise)
  description: string;
}

export interface NoterService {
  id: string;
  serviceName: string;
  displayName: string;
  description: string;
  basePrice: number; // TL (sabit hizmetler için)
  scales?: NoterFeeScale[]; // Kademeli ücretler (değere göre değişen hizmetler için)
  additionalInfo?: string;
}

export interface NoterData {
  year: number;
  lastUpdated: string;
  sourceLabel: string;
  sourceUrl: string;
  effectiveDate: string;
  confidence: 'kesin' | 'yaklaşık' | 'tahmini';
  services: NoterService[];
  generalInfo: {
    vat: number; // KDV oranı (%)
    legalBasis: string;
    applicableDate: string;
  };
}

export const noterData: NoterData = {
  year: 2026,
  lastUpdated: '2026-01-01',
  sourceLabel: 'Adalet Bakanlığı 2026 Noter Ücret Tarifesi',
  sourceUrl: 'https://www.noterlerbirligi.org.tr',
  effectiveDate: '2026-01-01',
  confidence: 'kesin' as const,
  services: [
    {
      id: 'arac_satis_muhasebesi',
      serviceName: 'Araç Satış Muhasebesi',
      displayName: 'Araç Satış İşlemi Noter Hizmeti',
      description: 'Araç satış işleminin noter tarafından onaylanması ve tutanak tutulması',
      basePrice: 0,
      scales: [
        {
          minAmount: 0,
          maxAmount: 50000,
          feePercentage: 0.5,
          fixedAmount: 250,
          description: '0-50.000 TL arası araçlar',
        },
        {
          minAmount: 50001,
          maxAmount: 100000,
          feePercentage: 0.4,
          fixedAmount: 450,
          description: '50.001-100.000 TL arası araçlar',
        },
        {
          minAmount: 100001,
          maxAmount: 250000,
          feePercentage: 0.3,
          fixedAmount: 700,
          description: '100.001-250.000 TL arası araçlar',
        },
        {
          minAmount: 250001,
          maxAmount: 500000,
          feePercentage: 0.25,
          fixedAmount: 1200,
          description: '250.001-500.000 TL arası araçlar',
        },
        {
          minAmount: 500001,
          maxAmount: 1000000,
          feePercentage: 0.2,
          fixedAmount: 1800,
          description: '500.001-1.000.000 TL arası araçlar',
        },
        {
          minAmount: 1000001,
          maxAmount: 999999999,
          feePercentage: 0.15,
          fixedAmount: 3000,
          description: '1.000.000 TL üzeri araçlar',
        },
      ],
      additionalInfo:
        'Satıcı ve alıcı tarafından imzalanmış sözleşme tutanağının noter tarafından onaylanması',
    },
    {
      id: 'arac_vekaletnamesi',
      serviceName: 'Araç Vekâletnamesi',
      displayName: 'Araç İçin Noter Vekâletnamesi',
      description:
        'Araç satış yetkisini temsilci/vasi/mütevelli heyete veren vekâletname hizmeti',
      basePrice: 325,
      additionalInfo:
        'Sahibi tarafından başka birisine araç satış ve tescil yetkisini veren resmi belge',
    },
    {
      id: 'arac_tescil_belgesi',
      serviceName: 'Araç Tescil Belgesi',
      displayName: 'Noter Tarafından Tescil Belgesi Alınması',
      description: 'Araçta yapılan işlemler için noter tarafından tescil belgesi alınması',
      basePrice: 200,
      additionalInfo: 'KGM nezdinde tescil işlemlerinde gerekli resmi belgesi',
    },
    {
      id: 'araç_tespit_tutanagi',
      serviceName: 'Araç Tespit Tutanağı',
      displayName: 'Araç Durumu Tespit Tutanağı',
      description:
        'Araç satış veya devri sırasında araçın durumunun noter tarafından tespit edilerek tutanak altına alınması',
      basePrice: 450,
      additionalInfo:
        'Anlaşmalı satış veya başka sorunlar olması durumunda araç durumunun resmi olarak tespit edilmesi',
    },
    {
      id: 'imza_belgeleme',
      serviceName: 'İmza Belgeleme',
      displayName: 'Noter Tarafından İmza Belgeleme',
      description:
        'Tarafların imzalarının noter tarafından belgelendirilmesi (sözleşme, vekâletname vb.)',
      basePrice: 150,
      additionalInfo: 'Tek imza başına. Her bir taraf için ayrı ücret uygulanır.',
    },
    {
      id: 'tercüme_hizmeti',
      serviceName: 'Tercüme Hizmeti',
      displayName: 'Noter Tarafından Tercüme (Araç Belgesi)',
      description:
        'Yabancı dilde olan araç belgelerinin Türkçeye tercümesi ve noter tarafından onaylanması',
      basePrice: 500,
      additionalInfo: 'Belgesi başına sabit ücret. Sayfa başına ücret hesaplanabilir.',
    },
    {
      id: 'ihracat_belgesi',
      serviceName: 'İhracat Belgesi Notere Ibrazı',
      displayName: 'Araç İhracat Belgesi Noter Onayı',
      description: 'Araç ihraç edilirken noter tarafından belge onayı ve tutanak tutulması',
      basePrice: 600,
      additionalInfo: 'Araç ihracatı sırasında noter tarafından gerekli onaylamalar',
    },
    {
      id: 'karayollar_sureti',
      serviceName: 'Karayolları Trafo Süreti',
      displayName: 'KGM Tescil Belgesi Noter Süreti',
      description: 'KGM nezdinde tescil için noter aracılığıyla çekilen belgeler',
      basePrice: 175,
      additionalInfo: 'KGM kaydında yapılacak işlemler için noter süreti alma',
    },
    {
      id: 'ikinci_ve_sonraki_belgeler',
      serviceName: 'Aynı İşlem İçin İkinci ve Sonraki Belgeler',
      displayName: 'İkinci / Sonraki Noter Belgesi (Aynı İşlem)',
      description:
        'Aynı işlem için noter tarafından düzenlenen ek belgeler (birden fazla kopya talep edilirse)',
      basePrice: 100,
      additionalInfo: 'İkinci belgeden itibaren her bir belge için tarifeli ücret',
    },
    {
      id: 'acil_hizmet_ucreti',
      serviceName: 'Acil/Aynı Gün Hizmeti',
      displayName: 'Acil Hizmet Ücreti (Ekstra)',
      description: 'Noter tarafından verilen hizmette acele veya aynı gün işlem talep edilen durumlar',
      basePrice: 250,
      additionalInfo: 'Baz ücretine ek olarak uygulanır',
    },
    {
      id: 'noter_basi_ticari_belgesi',
      serviceName: 'Noter Başı Ticari Belge',
      displayName: 'Ticari Belge Noter Onayı (Araç Bakımı, Kiralama vb.)',
      description: 'Araç ile ilgili ticari işlemlerin noter onayı ve belgelendirilmesi',
      basePrice: 350,
      additionalInfo: 'Araç bakımı sözleşmesi, kiralama sözleşmesi gibi ticari işlemler',
    },
  ],
  generalInfo: {
    vat: 18,
    legalBasis: 'Adalet Bakanlığı Noter Ücret Tarifesi 2026',
    applicableDate: '2026-01-01',
  },
};

/**
 * Yardımcı Fonksiyonlar
 */

/**
 * Araç satış fiyatına göre noter ücretini hesapla
 * @param vehiclePrice Aracın satış fiyatı (TL)
 * @returns Noter hizmeti ücreti (KDV hariç)
 */
export function calculateNoterFee(vehiclePrice: number): number {
  const salesService = noterData.services.find(
    (s) => s.id === 'arac_satis_muhasebesi'
  );

  if (!salesService || !salesService.scales) {
    return 0;
  }

  for (const scale of salesService.scales) {
    if (vehiclePrice >= scale.minAmount && vehiclePrice <= scale.maxAmount) {
      const percentageAmount = (vehiclePrice * scale.feePercentage) / 100;
      return scale.fixedAmount ? Math.max(percentageAmount, scale.fixedAmount) : percentageAmount;
    }
  }

  return 0;
}

/**
 * Noter ücreti + KDV hesapla
 * @param vehiclePrice Aracın satış fiyatı (TL)
 * @returns Noter ücreti + KDV (TL)
 */
export function calculateNoterFeeWithVAT(vehiclePrice: number): {
  baseFee: number;
  vat: number;
  totalFee: number;
} {
  const baseFee = calculateNoterFee(vehiclePrice);
  const vat = (baseFee * noterData.generalInfo.vat) / 100;
  return {
    baseFee,
    vat,
    totalFee: baseFee + vat,
  };
}

/**
 * Tam noter masrafını hesapla (Satış + diğer hizmetler)
 * @param vehiclePrice Aracın satış fiyatı (TL)
 * @param includeExtraServices Ek hizmetler ekle mi?
 * @returns Toplam noter masrafı
 */
export function calculateTotalNoterCost(
  vehiclePrice: number,
  includeExtraServices: boolean = true
): { salesFee: number; extraServices: number; total: number } {
  const salesFeeData = calculateNoterFeeWithVAT(vehiclePrice);

  let extraServices = 0;
  if (includeExtraServices) {
    // Vekâletname + Tescil Belgesi + Tespit Tutanağı
    const vekaletnameFee = noterData.services.find(
      (s) => s.id === 'arac_vekaletnamesi'
    )?.basePrice || 0;
    const tescilFee =
      noterData.services.find((s) => s.id === 'arac_tescil_belgesi')?.basePrice || 0;
    const tespitFee =
      noterData.services.find((s) => s.id === 'araç_tespit_tutanagi')?.basePrice || 0;

    extraServices = (vekaletnameFee + tescilFee + tespitFee) * 1.18; // KDV dahil
  }

  return {
    salesFee: salesFeeData.totalFee,
    extraServices,
    total: salesFeeData.totalFee + extraServices,
  };
}
