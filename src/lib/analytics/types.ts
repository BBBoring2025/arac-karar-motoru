/**
 * Analytics Modülü — Tip Tanımları
 *
 * Takip edilecek event kategorileri ve yapıları.
 * Privacy-first: kişisel veri toplamaz, sadece anonim kullanım metrikleri.
 */

export type EventCategory =
  | 'tool_usage'      // Ücretsiz araç kullanımı
  | 'calculation'     // Hesaplama yapıldı
  | 'navigation'      // Sayfa gezinme
  | 'premium'         // Premium CTA etkileşimi
  | 'error';          // Hata oluştu

export interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Takip edilecek event'ler:
 *
 * tool_usage:
 *   - tool_opened: Hangi araç açıldı (mtv, yakıt, otoyol, muayene, rota)
 *
 * calculation:
 *   - calculation_completed: Hesaplama yapıldı
 *   - route_calculated: Rota hesaplandı (başlangıç il, varış il)
 *   - tco_calculated: TCO hesaplandı
 *
 * navigation:
 *   - page_view: Sayfa görüntülendi
 *
 * premium:
 *   - premium_cta_clicked: Premium CTA tıklandı
 *   - payment_page_viewed: Ödeme sayfası görüntülendi
 *
 * error:
 *   - calculation_error: Hesaplama hatası
 *   - route_not_found: Rota bulunamadı
 */
