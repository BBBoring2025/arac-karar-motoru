/**
 * İlçe → Anchor Node Offset Hesabı
 * İlçe merkezinden en yakın anchor node'a olan mesafe ve süreyi hesaplar.
 * Haversine × bölgesel katsayı kullanır.
 */

import { District, AnchorNode } from './types';
import { haversineDistance } from './haversine';

/** Şehir içi yol kıvrımları için katsayılar */
const ISTANBUL_MULTIPLIER = 1.5;
const BUYUKSEHIR_MULTIPLIER = 1.4;
const DEFAULT_MULTIPLIER = 1.25;

/** Şehir içi ortalama hız: km × bu değer = dakika */
const URBAN_MIN_PER_KM = 1.2;

/** 30 büyükşehir plaka kodları */
const BUYUKSEHIR_PLAKALARI = new Set([
  1, 2, 3, 6, 7, 9, 10, 16, 20, 21, 22, 25, 26, 27, 31, 33,
  34, 35, 37, 38, 41, 42, 44, 45, 46, 48, 52, 55, 61, 65,
]);

/**
 * İlçe ile anchor node arası tahmini yol mesafesini hesaplar.
 *
 * Sprint C P9: returns the multiplier used so the route engine can
 * report it as `districtOffsetSource.multiplier` for provenance.
 * Existing consumers (route-engine etc.) ignore the new `multiplier`
 * field; backward compatible.
 */
export function calculateDistrictOffset(
  district: District,
  anchor: AnchorNode
): { distanceKm: number; durationMin: number; multiplier: number } {
  const crowFlyKm = haversineDistance(
    district.lat,
    district.lng,
    anchor.lat,
    anchor.lng
  );

  let multiplier: number;
  if (district.plaka === 34) {
    multiplier = ISTANBUL_MULTIPLIER;
  } else if (BUYUKSEHIR_PLAKALARI.has(district.plaka)) {
    multiplier = BUYUKSEHIR_MULTIPLIER;
  } else {
    multiplier = DEFAULT_MULTIPLIER;
  }

  const distanceKm = Math.round(crowFlyKm * multiplier * 10) / 10;
  const durationMin = Math.round(distanceKm * URBAN_MIN_PER_KM);

  return { distanceKm, durationMin, multiplier };
}
