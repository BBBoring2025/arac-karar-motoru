/**
 * Rota Hesaplama Ana Motoru
 * Tüm bileşenleri birleştirerek ilçeden ilçeye rota hesaplar.
 *
 * Hesap akışı:
 * 1. İlçeleri bul
 * 2. Anchor node'larını bul
 * 3. Offset mesafelerini hesapla (ilçe → anchor)
 * 4. Graph üzerinde shortest path çalıştır
 * 5. Edge'lerdeki toll segment'leri topla
 * 6. Yakıt maliyetini hesapla
 * 7. Güven seviyesini belirle
 * 8. Gidiş-dönüş ise maliyetleri 2x yap
 */

import {
  RouteParams,
  RouteResult,
  RouteEdge,
  ConfidenceLevel,
  PathDistanceSource,
  TollSource,
  DistrictOffsetSource,
  FuelPriceSource,
} from './types';
import { findDistrict } from '@/data/locations/districts';
import { findAnchor } from '@/data/locations/anchors';
import { routeEdges } from '@/data/routes/graph';
import { calculateDistrictOffset } from './district-offset';
import { dijkstra } from './graph-search';
import { calculateTollCost } from './toll-calculator';
import { tollSegments } from '@/data/routes/toll-segments';

/**
 * İlçeden ilçeye rota hesaplar
 */
export function calculateRoute(params: RouteParams): RouteResult {
  const {
    startDistrictId,
    endDistrictId,
    vehicleClass,
    fuelConsumption,
    fuelPrice,
    fuelType,
    includeTolls,
    roundTrip: _roundTrip,
  } = params;

  // 1. İlçeleri bul
  const startDistrict = findDistrict(startDistrictId);
  const endDistrict = findDistrict(endDistrictId);

  if (!startDistrict) {
    throw new Error(`Başlangıç ilçesi bulunamadı: ${startDistrictId}`);
  }
  if (!endDistrict) {
    throw new Error(`Varış ilçesi bulunamadı: ${endDistrictId}`);
  }

  // 2. Anchor node'larını bul
  const startAnchor = findAnchor(startDistrict.anchorId);
  const endAnchor = findAnchor(endDistrict.anchorId);

  if (!startAnchor) {
    throw new Error(`Başlangıç anchor bulunamadı: ${startDistrict.anchorId}`);
  }
  if (!endAnchor) {
    throw new Error(`Varış anchor bulunamadı: ${endDistrict.anchorId}`);
  }

  // 3. Offset mesafelerini hesapla
  const startOffset = calculateDistrictOffset(startDistrict, startAnchor);
  const endOffset = calculateDistrictOffset(endDistrict, endAnchor);

  // 4. Aynı anchor ise (aynı il içi kısa mesafe)
  let graphDistanceKm = 0;
  let graphDurationMin = 0;
  let pathNodeIds: string[] = [];
  let pathEdges: RouteEdge[] = [];
  let tollAvoidanceNote: string | undefined;

  if (startDistrict.anchorId === endDistrict.anchorId) {
    // Aynı il içi — sadece offset mesafeleri
    pathNodeIds = [startAnchor.id];
  } else {
    // Graph üzerinde shortest path
    const result = dijkstra(
      startDistrict.anchorId,
      endDistrict.anchorId,
      routeEdges,
      includeTolls
    );

    if (!result) {
      throw new Error(
        `Rota bulunamadı: ${startDistrict.anchorId} → ${endDistrict.anchorId}`
      );
    }

    graphDistanceKm = result.totalDistanceKm;
    graphDurationMin = result.totalDurationMin;
    pathNodeIds = result.path;
    pathEdges = result.edges;

    if (result.tollAvoidanceFailed) {
      tollAvoidanceNote =
        'Bu güzergahta ücretsiz alternatif bulunamamıştır. Gösterilen rota en kısa ücretli güzergahtır.';
    }
  }

  // 5. Toplam mesafe ve süre
  const totalDistanceKm =
    startOffset.distanceKm + graphDistanceKm + endOffset.distanceKm;
  const totalDurationMin =
    startOffset.durationMin + graphDurationMin + endOffset.durationMin;

  // 6. Geçiş ücreti
  const tollResult = calculateTollCost(pathEdges, vehicleClass);

  // 7. Yakıt maliyeti
  const fuelLiters = (totalDistanceKm / 100) * fuelConsumption;
  const fuelCost = fuelLiters * fuelPrice;

  // 8. Toplam maliyet
  const oneWayTollCost = tollResult.total;
  const oneWayTotalCost = fuelCost + oneWayTollCost;
  const oneWayCostPerKm =
    totalDistanceKm > 0 ? oneWayTotalCost / totalDistanceKm : 0;

  // 9. Güven seviyesi
  const confidence = determineConfidence(pathEdges);

  // 9.5 Sprint C P9: source tracking for provenance UI
  const tollSource = derivePathTollSource(pathEdges);
  const pathDistanceSource = derivePathDistanceSource(
    startOffset.distanceKm + endOffset.distanceKm,
    graphDistanceKm
  );
  const districtOffsetSource: DistrictOffsetSource = {
    type: 'haversine_multiplier',
    multiplier: Math.max(startOffset.multiplier, endOffset.multiplier),
  };
  const fuelPriceSource: FuelPriceSource =
    params.fuelPriceSource ?? 'user_input';

  // 10. Sonuç
  const oneWay = {
    distanceKm: round2(totalDistanceKm),
    durationMin: Math.round(totalDurationMin),
    fuelLiters: round2(fuelLiters),
    fuelCost: Math.round(fuelCost),
    tollCost: Math.round(oneWayTollCost),
    totalCost: Math.round(oneWayTotalCost),
    costPerKm: round2(oneWayCostPerKm),
  };

  const rt = {
    distanceKm: round2(totalDistanceKm * 2),
    durationMin: Math.round(totalDurationMin * 2),
    fuelLiters: round2(fuelLiters * 2),
    fuelCost: Math.round(fuelCost * 2),
    tollCost: Math.round(oneWayTollCost * 2),
    totalCost: Math.round(oneWayTotalCost * 2),
    costPerKm: round2(oneWayCostPerKm),
  };

  return {
    startDistrict,
    endDistrict,
    oneWay,
    roundTrip: rt,
    confidence,
    path: {
      nodeIds: pathNodeIds,
      edges: pathEdges,
    },
    tollBreakdown: tollResult.breakdown,
    tollAvoidanceNote,
    metadata: {
      calculatedAt: new Date().toISOString(),
      fuelConsumption,
      fuelPrice,
      fuelType,
      vehicleClass,
    },
    // Sprint C P9: source tracking
    pathDistanceSource,
    tollSource,
    districtOffsetSource,
    fuelPriceSource,
  };
}

/**
 * Sprint C P9: derive overall toll source from the route's segments.
 * - 'none'              → no toll segments at all
 * - 'kgm_official'      → all segments confidence === 'kesin' (KGM verified)
 * - 'estimated_segment' → all segments confidence === 'tahmini'
 * - 'mixed'             → both kesin and tahmini segments present
 */
function derivePathTollSource(edges: RouteEdge[]): TollSource {
  const segmentIds = new Set<string>();
  for (const edge of edges) {
    for (const id of edge.tollSegmentIds) {
      segmentIds.add(id);
    }
  }
  if (segmentIds.size === 0) return 'none';

  let hasKesin = false;
  let hasTahmini = false;
  for (const id of segmentIds) {
    const seg = tollSegments.find((s) => s.id === id);
    if (!seg) continue;
    if (seg.confidence === 'kesin') hasKesin = true;
    else if (seg.confidence === 'tahmini') hasTahmini = true;
  }

  if (hasKesin && hasTahmini) return 'mixed';
  if (hasKesin) return 'kgm_official';
  if (hasTahmini) return 'estimated_segment';
  return 'mixed';
}

/**
 * Sprint C P9: derive how the total distance was computed.
 * - 'haversine_offset' → only district offsets (same anchor, no graph traversal)
 * - 'graph'            → only graph traversal (zero district offset, theoretical)
 * - 'mixed'            → both contributions present (typical)
 */
function derivePathDistanceSource(
  totalOffsetKm: number,
  graphKm: number
): PathDistanceSource {
  if (totalOffsetKm > 0 && graphKm > 0) return 'mixed';
  if (graphKm > 0) return 'graph';
  return 'haversine_offset';
}

/**
 * Edge'lerin güven seviyelerinden genel rota güven seviyesini belirler
 *
 * ÖNEMLİ: Hiçbir rota "tam kesin" döndürmez çünkü:
 * - İlçe → anchor offset her zaman Haversine + bölgesel çarpan tahmini
 * - Otoyol segment ücretleri tahmini
 *
 * Bu yüzden en iyi senaryo "yüksek" (tüm edge kesin = sadece köprü/tünel rotası).
 * Çoğu rota karma olduğu için "tahmini" döner.
 */
function determineConfidence(edges: RouteEdge[]): ConfidenceLevel {
  if (edges.length === 0) return 'tahmini';

  const levels = edges.map((e) => e.confidence);
  const hasEstimate = levels.includes('tahmini');
  const allExact = levels.every((l) => l === 'kesin');

  // Tüm edge'ler kesin olsa bile district offset tahmini içerir
  // → en iyi senaryo "yüksek"
  if (allExact) return 'yüksek';
  if (hasEstimate) return 'tahmini';
  return 'yüksek';
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
