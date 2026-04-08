/**
 * Event Tracker — Privacy-First Analytics
 *
 * Provider abstraction: GA4, Plausible veya custom backend.
 * Provider yoksa crash etmez — event sessizce atlanır.
 * Kişisel veri TOPLAMAZ — sadece anonim kullanım metrikleri.
 */

import type { AnalyticsEvent } from './types';
import { getClientFlags } from '../flags';

const IS_BROWSER = typeof window !== 'undefined';
const IS_DEV = process.env.NODE_ENV === 'development';

// Global gtag/plausible type declarations
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, options?: { props?: Record<string, string | number> }) => void;
  }
}

/**
 * Analytics etkin mi?
 * Delegates to centralized flags (src/lib/flags.ts::getClientFlags).
 * Dev mode override korunur — development'ta console.log için true döner.
 */
function isEnabled(): boolean {
  if (!IS_BROWSER) return false;
  if (IS_DEV) return true;
  const flags = getClientFlags({
    gtag: !!window.gtag,
    plausible: !!window.plausible,
  });
  return flags.analyticsEnabled.enabled;
}

/**
 * Event'i provider'a gönder
 * try/catch ile sarılmış — hiçbir analytics hatası uygulamayı kırmaz
 */
function sendToProvider(event: AnalyticsEvent): void {
  try {
    // GA4
    if (IS_BROWSER && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata,
      });
      return;
    }

    // Plausible
    if (IS_BROWSER && window.plausible) {
      const props: Record<string, string | number> = {
        category: event.category,
      };
      if (event.label) props.label = event.label;
      if (event.value !== undefined) props.value = event.value;
      if (event.metadata) {
        for (const [k, v] of Object.entries(event.metadata)) {
          if (typeof v === 'string' || typeof v === 'number') {
            props[k] = v;
          }
        }
      }
      window.plausible(event.action, { props });
      return;
    }

    // Development: console.log
    if (IS_DEV) {
      console.log(
        `[Analytics] ${event.category}/${event.action}`,
        event.label || '',
        event.metadata || ''
      );
    }
  } catch {
    // Analytics hatası uygulamayı ASLA kırmamalı
    if (IS_DEV) {
      console.warn('[Analytics] Event gönderilemedi:', event.action);
    }
  }
}

/**
 * Genel event izle — try/catch safety wrapper
 */
export function trackEvent(event: AnalyticsEvent): void {
  try {
    if (!isEnabled()) return;
    sendToProvider(event);
  } catch {
    // Sessizce atla
  }
}

// ─── Önceden tanımlı event helper'ları ──────────────────────────────────────

/** Ücretsiz araç açıldı */
export function trackToolOpened(
  toolName: 'mtv' | 'yakit' | 'otoyol' | 'muayene' | 'rota'
): void {
  trackEvent({
    category: 'tool_usage',
    action: 'tool_opened',
    label: toolName,
  });
}

/** Hesaplama yapıldı */
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

/** Rota hesaplandı */
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

/** Premium CTA tıklandı */
export function trackPremiumCTA(location: string): void {
  trackEvent({
    category: 'premium',
    action: 'premium_cta_clicked',
    label: location,
  });
}

/** Checkout başladı */
export function trackCheckoutStarted(productId: string, price: number): void {
  trackEvent({
    category: 'premium',
    action: 'checkout_started',
    label: productId,
    value: price,
  });
}

/** Ödeme başarılı */
export function trackPaymentSuccess(productId: string, price: number): void {
  trackEvent({
    category: 'premium',
    action: 'payment_success',
    label: productId,
    value: price,
  });
}

/** Ödeme başarısız */
export function trackPaymentFailed(productId: string, errorMessage: string): void {
  trackEvent({
    category: 'premium',
    action: 'payment_failed',
    label: productId,
    metadata: { error: errorMessage },
  });
}

/** Hesaplama hatası */
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
