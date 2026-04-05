/**
 * Rapor Modülü — Tip Tanımları
 *
 * Premium rapor çıktısının yapısını tanımlar.
 * Her maliyet kalemi güven bilgisi ve kaynak ile etiketlenir.
 */

import { DataConfidence } from '@/lib/types';

export type VeriKaynagi = 'resmi' | 'benchmark' | 'kullanici_girdisi' | 'model_tahmini';

export interface RaporKalemi {
  baslik: string;
  tutar: number;        // TL
  periyot: string;      // "aylık", "yıllık", "toplam"
  veriKaynagi: VeriKaynagi;
  guvenSeviyesi: DataConfidence;
  kaynakAdi: string;    // "GİB 2026 Tarifesi", "OYDER Benchmark" vb.
  kullaniciGirdisiMi: boolean; // Kullanıcı tarafından override edilmiş mi
  notlar?: string;
}

export interface RaporOzet {
  toplamMaliyet: number;
  aylikOrtalama: number;
  kmBasiMaliyet: number;
  periyotAy: number;
  resmiKalemToplami: number;   // Sadece "kesin" güvenli kalemlerin toplamı
  tahminiKalemToplami: number; // "tahmini" kalemlerin toplamı
}

export interface KararTavsiyesi {
  karar: 'AL' | 'KIRALA' | 'BEKLE';
  guvenPuani: number;  // 0-100
  nedenler: string[];
  riskler: string[];
  firsatlar: string[];
  metodoloji: string;  // Tavsiyenin nasıl üretildiğinin kısa açıklaması
}

export interface RaporCiktisi {
  // Rapor meta
  raporId: string;
  olusturmaTarihi: string;
  periyot: '12ay' | '36ay' | '60ay';

  // Araç bilgisi
  aracBilgisi: {
    marka: string;
    model: string;
    yil: number;
    fiyat: number;
    motorHacmi: number;
    yakitTupu: string;
    segment: string;
  };

  // Kullanıcı parametreleri
  kullaniciParametreleri: {
    yillikKm: number;
    yakitFiyati: number;
    yakitFiyatiKaynagi: VeriKaynagi;
    pesinOdeme: boolean;
    krediFaizi?: number;
    krediVadesi?: number;
  };

  // Maliyet kalemleri (her biri etiketli)
  kalemler: RaporKalemi[];

  // Özet
  ozet: RaporOzet;

  // Karar tavsiyesi
  tavsiye?: KararTavsiyesi;

  // Metodoloji notu
  metodoloji: {
    aciklama: string;
    veriKaynaklari: Array<{
      ad: string;
      url?: string;
      tur: VeriKaynagi;
    }>;
    sonGuncelleme: string;
  };
}
