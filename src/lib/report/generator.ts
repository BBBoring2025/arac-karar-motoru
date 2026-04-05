/**
 * Rapor Üretici
 *
 * TCO hesaplama sonucunu alıp yapılandırılmış rapor çıktısı oluşturur.
 * Her kalem güven seviyesi, kaynak ve veri tipiyle etiketlenir.
 */

import type { TCOResult } from '../types';
import type { RaporCiktisi, RaporKalemi, RaporOzet } from './types';

/**
 * TCO sonucundan rapor çıktısı üret
 */
export function generateReport(
  tcoResult: TCOResult,
  periyot: '12ay' | '36ay' | '60ay' = '36ay'
): RaporCiktisi {
  const kalemler = buildKalemler(tcoResult);
  const ozet = buildOzet(kalemler, tcoResult, periyot);

  return {
    raporId: `RPR-${Date.now()}`,
    olusturmaTarihi: new Date().toISOString(),
    periyot,

    aracBilgisi: {
      marka: tcoResult.aracBilgisi.marka,
      model: tcoResult.aracBilgisi.model,
      yil: tcoResult.aracBilgisi.yil,
      fiyat: tcoResult.aracBilgisi.fiyat,
      motorHacmi: tcoResult.aracBilgisi.motorHacmi,
      yakitTupu: tcoResult.aracBilgisi.yakitTupu,
      segment: tcoResult.aracBilgisi.segment,
    },

    kullaniciParametreleri: {
      yillikKm: tcoResult.parameters.yillikKm,
      yakitFiyati: tcoResult.parameters.yakitFiyati,
      yakitFiyatiKaynagi: tcoResult.parameters.yakitFiyati ? 'kullanici_girdisi' : 'benchmark',
      pesinOdeme: tcoResult.parameters.pesinOdeme,
      krediFaizi: tcoResult.parameters.krediFaizi,
      krediVadesi: tcoResult.parameters.krediVadesi,
    },

    kalemler,
    ozet,

    // Tavsiye henüz bu aşamada eklenmez — ayrı modül gerekir
    tavsiye: undefined,

    metodoloji: {
      aciklama:
        'Toplam Sahip Olma Maliyeti (TCO) analizi, aracın satın alma bedelinin ötesindeki ' +
        'tüm sahiplik maliyetlerini kapsar. Her kalem güven seviyesiyle etiketlenir: ' +
        '"kesin" = resmi tarife, "tahmini" = sektör ortalaması.',
      veriKaynaklari: [
        { ad: 'GİB 2026 MTV Tarifesi', url: 'https://www.gib.gov.tr', tur: 'resmi' },
        { ad: 'TÜVTÜRK 2026 Muayene Tarifesi', url: 'https://www.tuvturk.com.tr', tur: 'resmi' },
        { ad: 'PETDER Akaryakıt Fiyatları', url: 'https://www.petder.org.tr', tur: 'benchmark' },
        { ad: 'OYDER Sektör Verileri', url: 'https://www.oyder.org.tr', tur: 'benchmark' },
        { ad: 'Adalet Bakanlığı Noter Tarifesi', tur: 'resmi' },
      ],
      sonGuncelleme: '2026-04-05',
    },
  };
}

/**
 * TCO breakdown'ından etiketli rapor kalemleri oluştur
 */
function buildKalemler(tco: TCOResult): RaporKalemi[] {
  const kalemler: RaporKalemi[] = [];
  const bd = tco.breakdown;

  // MTV — resmi tarife, kesin
  kalemler.push({
    baslik: 'Motorlu Taşıtlar Vergisi (MTV)',
    tutar: bd.mtv.toplam,
    periyot: 'toplam',
    veriKaynagi: 'resmi',
    guvenSeviyesi: 'kesin',
    kaynakAdi: bd.mtv.guven.kaynak,
    kullaniciGirdisiMi: false,
    notlar: 'GİB sabit tarife tablosundan hesaplanır. Motor hacmi ve araç yaşına göre belirlenir.',
  });

  // Yakıt — benchmark fiyat + kullanıcı km
  kalemler.push({
    baslik: 'Yakıt Maliyeti',
    tutar: bd.yakit.toplam,
    periyot: 'toplam',
    veriKaynagi: tco.parameters.yakitFiyati ? 'kullanici_girdisi' : 'benchmark',
    guvenSeviyesi: 'yaklaşık',
    kaynakAdi: bd.yakit.guven.kaynak,
    kullaniciGirdisiMi: true,
    notlar: 'Yakıt fiyatı ve yıllık km kullanıcı tarafından belirlenmiştir. Tüketim WLTP test değeridir.',
  });

  // Sigorta — benchmark tahmin
  kalemler.push({
    baslik: 'Sigorta (Kasko + Trafik)',
    tutar: bd.sigorta.toplam,
    periyot: 'toplam',
    veriKaynagi: tco.parameters.kaskoTahmini ? 'kullanici_girdisi' : 'benchmark',
    guvenSeviyesi: 'tahmini',
    kaynakAdi: bd.sigorta.guven.kaynak,
    kullaniciGirdisiMi: !!tco.parameters.kaskoTahmini,
    notlar: 'Sigorta tutarları sektör ortalamasıdır. Gerçek fiyat sürücü profili ve hasar geçmişine göre değişir.',
  });

  // Bakım — benchmark tahmin
  kalemler.push({
    baslik: 'Bakım ve Onarım',
    tutar: bd.bakim.toplam,
    periyot: 'toplam',
    veriKaynagi: 'benchmark',
    guvenSeviyesi: 'tahmini',
    kaynakAdi: bd.bakim.guven.kaynak,
    kullaniciGirdisiMi: false,
    notlar: 'Marka ve yaşa göre sektör ortalamasıdır. Yetkili servis ücretleri farklılık gösterebilir.',
  });

  // Muayene — resmi tarife
  kalemler.push({
    baslik: 'Araç Muayene',
    tutar: bd.muayene.toplam,
    periyot: 'toplam',
    veriKaynagi: 'resmi',
    guvenSeviyesi: 'kesin',
    kaynakAdi: bd.muayene.guven.kaynak,
    kullaniciGirdisiMi: false,
    notlar: `Periyot: ${bd.muayene.periyodu} ayda bir, ${bd.muayene.kaçKez} kez yapılacak.`,
  });

  // Amortisman — model tahmini
  kalemler.push({
    baslik: 'Değer Kaybı (Amortisman)',
    tutar: bd.amortisman.toplamDegerKaybi,
    periyot: 'toplam',
    veriKaynagi: 'model_tahmini',
    guvenSeviyesi: 'tahmini',
    kaynakAdi: bd.amortisman.guven.kaynak,
    kullaniciGirdisiMi: false,
    notlar: `Kalan değer: ${formatTL(bd.amortisman.kalanDeger)}. Segment ve yakıt tipine göre hesaplanır.`,
  });

  // Kredi faizi (varsa)
  if (bd.krediMaliyeti.toplamFaiz > 0) {
    kalemler.push({
      baslik: 'Kredi Faiz Maliyeti',
      tutar: bd.krediMaliyeti.toplamFaiz,
      periyot: 'toplam',
      veriKaynagi: 'kullanici_girdisi',
      guvenSeviyesi: 'kesin',
      kaynakAdi: 'Kullanıcı tarafından girilen faiz oranı',
      kullaniciGirdisiMi: true,
      notlar: `${bd.krediMaliyeti.vade} ay, aylık taksit: ${formatTL(bd.krediMaliyeti.aylikTaksit)}.`,
    });
  }

  // Noter (varsa)
  if (bd.noter && bd.noter.toplam > 0) {
    kalemler.push({
      baslik: 'Noter Masrafı',
      tutar: bd.noter.toplam,
      periyot: 'toplam',
      veriKaynagi: 'resmi',
      guvenSeviyesi: 'kesin',
      kaynakAdi: bd.noter.guven.kaynak,
      kullaniciGirdisiMi: false,
    });
  }

  return kalemler;
}

/**
 * Rapor özeti oluştur
 */
function buildOzet(
  kalemler: RaporKalemi[],
  tco: TCOResult,
  _periyot: string
): RaporOzet {
  const periyotAy = parseInt(_periyot) || 36;

  const resmiKalemToplami = kalemler
    .filter((k) => k.veriKaynagi === 'resmi')
    .reduce((sum, k) => sum + k.tutar, 0);

  const tahminiKalemToplami = kalemler
    .filter((k) => k.guvenSeviyesi === 'tahmini')
    .reduce((sum, k) => sum + k.tutar, 0);

  return {
    toplamMaliyet: tco.toplamMaliyet,
    aylikOrtalama: tco.ortalamAylikMaliyet,
    kmBasiMaliyet: tco.kmBasiMaliyet,
    periyotAy,
    resmiKalemToplami,
    tahminiKalemToplami,
  };
}

function formatTL(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
