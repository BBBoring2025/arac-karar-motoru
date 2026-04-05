/**
 * Rota Hesaplama Motoru Testleri
 * Basit assertion fonksiyonları kullanılır (test framework gerektirmez).
 *
 * Çalıştırmak için: npx tsx src/lib/route/__tests__/route-engine.test.ts
 */

import { calculateRoute } from '../route-engine';
import { dijkstra } from '../graph-search';
import { routeEdges } from '@/data/routes/graph';
import type { RouteParams } from '../types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function assertRange(value: number, min: number, max: number, label: string): void {
  assert(
    value >= min && value <= max,
    `${label}: ${value} (beklenen: ${min}-${max})`
  );
}

const BASE_PARAMS: Omit<RouteParams, 'startDistrictId' | 'endDistrictId'> = {
  vehicleClass: '1',
  fuelConsumption: 6.5,
  fuelPrice: 45,
  fuelType: 'benzin',
  includeTolls: true,
  roundTrip: false,
};

// ─── TEST 1: İstanbul (Kadıköy) → Bursa (Osmangazi) ─────────────────────────
console.log('\nTest 1: İstanbul → Bursa (Osmangazi Köprüsü dahil)');
try {
  const result = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '16-osmangazi',
  });

  assertRange(result.oneWay.distanceKm, 120, 200, 'Mesafe');
  assert(result.oneWay.tollCost > 0, 'Geçiş ücreti > 0');

  const hasOsmangazi = result.tollBreakdown.some(t => t.segmentId.includes('osmangazi'));
  assert(hasOsmangazi, 'Osmangazi Köprüsü geçişi dahil');

  assert(
    result.confidence === 'kesin' || result.confidence === 'yuksek' || result.confidence === 'tahmini',
    `Güven seviyesi geçerli: ${result.confidence}`
  );
} catch (e) {
  failed++;
  console.error(`  ✗ Test 1 hata: ${(e as Error).message}`);
}

// ─── TEST 2: Ankara (Çankaya) → Konya (Selçuklu) ────────────────────────────
console.log('\nTest 2: Ankara → Konya');
try {
  const result = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '06-cankaya',
    endDistrictId: '42-selcuklu',
  });

  assertRange(result.oneWay.distanceKm, 240, 310, 'Mesafe');
  assert(result.oneWay.fuelCost > 0, 'Yakıt maliyeti > 0');
  assert(result.oneWay.totalCost > 0, 'Toplam maliyet > 0');
} catch (e) {
  failed++;
  console.error(`  ✗ Test 2 hata: ${(e as Error).message}`);
}

// ─── TEST 3: İstanbul (Kadıköy) → Ankara (Çankaya) ──────────────────────────
console.log('\nTest 3: İstanbul → Ankara (O-4 koridoru)');
try {
  const result = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '06-cankaya',
  });

  assertRange(result.oneWay.distanceKm, 400, 520, 'Mesafe');
  assert(result.oneWay.tollCost > 0, 'Otoyol ücretleri > 0');
  assert(result.tollBreakdown.length > 0, 'Toll breakdown dolu');
} catch (e) {
  failed++;
  console.error(`  ✗ Test 3 hata: ${(e as Error).message}`);
}

// ─── TEST 4: Aynı il içi — Bursa Nilüfer → Osmangazi ────────────────────────
console.log('\nTest 4: Bursa içi (Nilüfer → Osmangazi)');
try {
  const result = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '16-nilufer',
    endDistrictId: '16-osmangazi',
  });

  assertRange(result.oneWay.distanceKm, 3, 30, 'Mesafe (şehir içi)');
  assert(result.oneWay.tollCost === 0, 'Geçiş ücreti yok');
} catch (e) {
  failed++;
  console.error(`  ✗ Test 4 hata: ${(e as Error).message}`);
}

// ─── TEST 5: Ücretli yol kapalı — İstanbul → Bursa ──────────────────────────
console.log('\nTest 5: İstanbul → Bursa (ücretli yol kapalı)');
try {
  const withTolls = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '16-osmangazi',
    includeTolls: true,
  });

  const withoutTolls = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '16-osmangazi',
    includeTolls: false,
  });

  // Ücretsiz rota daha uzun olmalı veya aynı olabilir (alternatif yoksa)
  assert(
    withoutTolls.oneWay.distanceKm >= withTolls.oneWay.distanceKm - 10,
    `Ücretsiz rota >= ücretli rota (${withoutTolls.oneWay.distanceKm} vs ${withTolls.oneWay.distanceKm})`
  );
} catch (e) {
  failed++;
  console.error(`  ✗ Test 5 hata: ${(e as Error).message}`);
}

// ─── TEST 6: Gidiş-dönüş ────────────────────────────────────────────────────
console.log('\nTest 6: Gidiş-dönüş (maliyetler 2x)');
try {
  const oneWayResult = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '06-cankaya',
    endDistrictId: '42-selcuklu',
    roundTrip: false,
  });

  const roundTripResult = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '06-cankaya',
    endDistrictId: '42-selcuklu',
    roundTrip: true,
  });

  assert(
    roundTripResult.roundTrip.distanceKm === oneWayResult.oneWay.distanceKm * 2,
    `Gidiş-dönüş mesafe 2x: ${roundTripResult.roundTrip.distanceKm}`
  );

  // Rounding toleransı: Math.round(x) * 2 vs Math.round(x*2) 1 TL fark yaratabilir
  assert(
    Math.abs(roundTripResult.roundTrip.fuelCost - oneWayResult.oneWay.fuelCost * 2) <= 1,
    `Gidiş-dönüş yakıt ≈2x: ${roundTripResult.roundTrip.fuelCost} (tek yön: ${oneWayResult.oneWay.fuelCost})`
  );

  assert(
    roundTripResult.roundTrip.tollCost === oneWayResult.oneWay.tollCost * 2,
    `Gidiş-dönüş geçiş ücreti 2x: ${roundTripResult.roundTrip.tollCost}`
  );
} catch (e) {
  failed++;
  console.error(`  ✗ Test 6 hata: ${(e as Error).message}`);
}

// ─── TEST 7: Avrasya Tüneli kullanılabilirliği ──────────────────────────────
console.log('\nTest 7: Avrasya Tüneli bağlantısı (istanbul-avrupa → istanbul-anadolu)');
try {
  const result = dijkstra('istanbul-avrupa', 'istanbul-anadolu', routeEdges, true);
  assert(result !== null, 'Rota bulundu');
  assert(result!.path.length >= 2, `Path en az 2 node: ${result!.path.length}`);

  // En az bir boğaz geçişi kullanıldığını doğrula (Avrasya dahil olabilir)
  const hasBridge = result!.edges.some(
    (e) =>
      e.tollSegmentIds.includes('15-temmuz-koprusu') ||
      e.tollSegmentIds.includes('fsm-koprusu') ||
      e.tollSegmentIds.includes('yss-koprusu') ||
      e.tollSegmentIds.includes('avrasya-tuneli')
  );
  assert(hasBridge, 'En az bir boğaz geçişi kullanıldı');
} catch (e) {
  failed++;
  console.error(`  ✗ Test 7 hata: ${(e as Error).message}`);
}

// ─── TEST 8: Uzun mesafe — Hakkari → Edirne ────────────────────────────────
console.log('\nTest 8: Hakkari → Edirne (uzun mesafe, graf bağlantı kontrolü)');
try {
  const result = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '30-merkez',
    endDistrictId: '22-merkez',
  });

  assert(result !== null, 'Rota bulundu');
  assertRange(result.oneWay.distanceKm, 1500, 2200, 'Mesafe');
  assert(result.oneWay.fuelCost > 0, 'Yakıt maliyeti > 0');
  assert(result.oneWay.totalCost > 0, 'Toplam maliyet > 0');
} catch (e) {
  failed++;
  console.error(`  ✗ Test 8 hata: ${(e as Error).message}`);
}

// ─── TEST 9: Toll avoidance uyarısı — İstanbul → Ankara ─────────────────────
console.log('\nTest 9: İstanbul → Ankara (ücretli yol kapalı, uyarı kontrolü)');
try {
  const result = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '06-cankaya',
    includeTolls: false,
  });

  assert(result !== null, 'Rota bulundu');
  // Serbest alternatif bulunamazsa tollAvoidanceNote dolu olmalı
  const hasTollEdge = result.path.edges.some(
    (e) => e.tollSegmentIds.length > 0
  );
  if (hasTollEdge) {
    assert(
      typeof result.tollAvoidanceNote === 'string' && result.tollAvoidanceNote.length > 0,
      'Toll avoidance uyarısı mevcut'
    );
  } else {
    assert(
      !result.tollAvoidanceNote,
      'Serbest rota bulundu, uyarı yok'
    );
  }
} catch (e) {
  failed++;
  console.error(`  ✗ Test 9 hata: ${(e as Error).message}`);
}

// ─── TEST 10: İstanbul → Bursa, ücretli yol kapalı ─────────────────────────
console.log('\nTest 10: İstanbul → Bursa (ücretli yol kapalı, serbest alternatif)');
try {
  const withTolls = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '16-osmangazi',
    includeTolls: true,
  });

  const withoutTolls = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '16-osmangazi',
    includeTolls: false,
  });

  // Ücretsiz rota mesafesi ücretliden FAZLA olmalı (Yalova üzerinden daha uzun)
  assert(
    withoutTolls.oneWay.distanceKm > withTolls.oneWay.distanceKm,
    `Ücretsiz rota daha uzun: ${withoutTolls.oneWay.distanceKm} > ${withTolls.oneWay.distanceKm}`
  );

  // Osmangazi Köprüsü tollBreakdown'da OLMAMALI
  const hasOsmangazi = withoutTolls.tollBreakdown.some(
    (t) => t.segmentId.includes('osmangazi')
  );
  assert(!hasOsmangazi, 'Osmangazi Köprüsü ücretsiz rotada YOK');
} catch (e) {
  failed++;
  console.error(`  ✗ Test 10 hata: ${(e as Error).message}`);
}

// ─── SONUÇ ──────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`);
console.log(`Sonuç: ${passed} geçti, ${failed} kaldı`);
if (failed > 0) {
  process.exit(1);
}
