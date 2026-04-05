/**
 * Event Tracker
 *
 * Basit, privacy-first analytics katmanı.
 * Şu an development modunda console.log kullanır.
 * GA4, Plausible veya PostHog entegre edildiğinde
 * sadece sendToProvider() fonksiyonu değişir.
 *
 * Kişisel veri TOPLAMAZ — sadece anonim kullanım metrikleri.
 */

import type { AnalyticsEvent } from './types';

const IS_BROWSER = typeof window !== 'undefined';
const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Analytics etkin mi?
 * Production'da analytics provider varsa true döner.
 * Development'ta her zaman true (console'a yazar).
 */
function isEnabled(): boolean {
  if (!IS_BROWSER) return false;
  if (IS_DEV) return true;
  // Production'da GA veya Plausible script'i yüklü mü kontrol et
  // TODO: Provider entegrasyonunda güncelle
  return false;
}

/**
 * Event'i provider'a gönder
 * TODO: GA4, Plausible veya PostHog entegrasyonu
 */
function sendToProvider(event: AnalyticsEvent): void {
  // GA4 entegrasyonu:
  // if (window.gtag) {
  //   window.gtag('event', event.action, {
  //     event_category: event.category,
  //     event_label: event.label,
  //     value: event.value,
  //     ...event.metadata,
  //   });
  // }

  // Plausible entegrasyonu:
  // if (window.plausible) {
  //   window.plausible(event.action, {
  //     props: { category: event.category, label: event.label, ...event.metadata },
  //   });
  // }

  // Development: console.log
  if (IS_DEV) {
    console.log(
      `[Analytics] ${event.category}/${event.action}`,
      event.label || '',
      event.metadata || ''
    );
  }
}

/**
 * Genel event izle
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (!isEnabled()) return;
  sendToProvider(event);
}

// ─── Önceden tanımlı event helper'ları ──────────────────────────────────────

/**
 * Araç açıldı (ücretsiz hesaplama aracı)
 */
export function trackToolOpened(
  toolName: 'mtv' | 'yakit' | 'otoyol' | 'muayene' | 'rota'
): void {
  trackEvent({
    category: 'tool_usage',
    action: 'tool_opened',
    label: toolName,
  });
}

/**
 * Hesaplama yapıldı
 */
export function trackCalculation(
  toolName: string,
  meta?: Record<string, string | number | boolean>
): void {
  trackEvent({
    category: 'calculation',
    action: 'calculation_completed',
    label: toolName,
    metadata: meta,
  });
}

/**
 * Rota hesaplandı
 */
export function trackRouteCalculated(
  startIl: string,
  endIl: string,
  distanceKm: number
): void {
  trackEvent({
    category: 'calculation',
    action: 'route_calculated',
    label: `${startIl} → ${endIl}`,
    value: Math.round(distanceKm),
    metadata: { startIl, endIl, distanceKm },
  });
}

/**
 * Premium CTA tıklandı
 */
export function trackPremiumCTA(location: string): void {
  trackEvent({
    category: 'premium',
    action: 'premium_cta_clicked',
    label: location,
  });
}

/**
 * Hesaplama hatası
 */
export function trackError(
  toolName: string,
  errorMessage: string
): void {
  trackEvent({
    category: 'error',
    action: 'calculation_error',
    label: toolName,
    metadata: { error: errorMessage },
  });
}
