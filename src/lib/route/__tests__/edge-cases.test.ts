/**
 * Edge Case Testleri — Sınır değerler ve hata durumları
 *
 * Çalıştırmak için: npx tsx src/lib/route/__tests__/edge-cases.test.ts
 */

import { calculateRoute } from '../route-engine';
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

const BASE_PARAMS: Omit<RouteParams, 'startDistrictId' | 'endDistrictId'> = {
  vehicleClass: '1',
  fuelConsumption: 6.5,
  fuelPrice: 45,
  fuelType: 'benzin',
  includeTolls: true,
  roundTrip: false,
};

// ─── TEST E1: Aynı ilçe (başlangıç = varış) ────────────────────────────────
console.log('\nEdge Case 1: Aynı ilçe (başlangıç = varış)');
try {
  const result = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '06-cankaya',
    endDistrictId: '06-cankaya',
  });
  // Aynı ilçe → mesafe ~0
  assert(result.oneWay.distanceKm < 5, `Mesafe ~0: ${result.oneWay.distanceKm}`);
  assert(result.oneWay.tollCost === 0, 'Geçiş ücreti yok');
} catch (e) {
  // Hata fırlatması da kabul edilebilir
  assert(true, `Aynı ilçe: hata fırlatıldı (kabul edilir) — ${(e as Error).message}`);
}

// ─── TEST E2: Geçersiz ilçe ID ──────────────────────────────────────────────
console.log('\nEdge Case 2: Geçersiz ilçe ID');
try {
  calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: 'INVALID-DISTRICT',
    endDistrictId: '06-cankaya',
  });
  failed++;
  console.error('  ✗ Geçersiz ID için hata beklendi ama fırlatılmadı');
} catch (e) {
  assert(true, `Geçersiz ilçe: doğru hata fırlatıldı — ${(e as Error).message}`);
}

// ─── TEST E3: Yakıt tüketimi 0 ──────────────────────────────────────────────
console.log('\nEdge Case 3: Yakıt tüketimi 0');
try {
  const result = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '06-cankaya',
    fuelConsumption: 0,
  });
  assert(result.oneWay.fuelCost === 0, `Yakıt maliyeti 0: ${result.oneWay.fuelCost}`);
  assert(result.oneWay.fuelLiters === 0, `Yakıt litre 0: ${result.oneWay.fuelLiters}`);
  assert(result.oneWay.totalCost === result.oneWay.tollCost, 'Toplam = sadece geçiş ücreti');
} catch (e) {
  failed++;
  console.error(`  ✗ Test E3 hata: ${(e as Error).message}`);
}

// ─── TEST E4: Yakıt fiyatı 0 ────────────────────────────────────────────────
console.log('\nEdge Case 4: Yakıt fiyatı 0');
try {
  const result = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '16-osmangazi',
    fuelPrice: 0,
  });
  assert(result.oneWay.fuelCost === 0, `Yakıt maliyeti 0: ${result.oneWay.fuelCost}`);
  assert(result.oneWay.tollCost > 0, `Geçiş ücreti hâlâ var: ${result.oneWay.tollCost}`);
  assert(result.oneWay.totalCost === result.oneWay.tollCost, 'Toplam = sadece geçiş ücreti');
} catch (e) {
  failed++;
  console.error(`  ✗ Test E4 hata: ${(e as Error).message}`);
}

// ─── TEST E5: Çok kısa mesafe (komşu ilçeler) ──────────────────────────────
console.log('\nEdge Case 5: Komşu ilçeler (İstanbul Kadıköy → Üsküdar)');
try {
  const result = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '34-uskudar',
  });
  assert(result.oneWay.distanceKm < 30, `Kısa mesafe: ${result.oneWay.distanceKm} km`);
  assert(result.oneWay.totalCost > 0, 'Toplam maliyet > 0');
} catch (e) {
  failed++;
  console.error(`  ✗ Test E5 hata: ${(e as Error).message}`);
}

// ─── TEST E6: Büyük yakıt tüketimi ─────────────────────────────────────────
console.log('\nEdge Case 6: Büyük yakıt tüketimi (25 L/100km)');
try {
  const normal = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '06-cankaya',
    endDistrictId: '42-selcuklu',
    fuelConsumption: 6.5,
  });
  const high = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '06-cankaya',
    endDistrictId: '42-selcuklu',
    fuelConsumption: 25,
  });
  assert(
    high.oneWay.fuelCost > normal.oneWay.fuelCost * 3,
    `Yüksek tüketim → daha pahalı: ${high.oneWay.fuelCost} > ${normal.oneWay.fuelCost}`
  );
  assert(high.oneWay.distanceKm === normal.oneWay.distanceKm, 'Mesafe aynı kalmalı');
} catch (e) {
  failed++;
  console.error(`  ✗ Test E6 hata: ${(e as Error).message}`);
}

// ─── TEST E7: Farklı araç sınıfları ────────────────────────────────────────
console.log('\nEdge Case 7: Farklı araç sınıfları (1 vs 2)');
try {
  const class1 = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '16-osmangazi',
    vehicleClass: '1',
  });
  const class2 = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '16-osmangazi',
    vehicleClass: '2',
  });
  assert(
    class2.oneWay.tollCost >= class1.oneWay.tollCost,
    `2. sınıf geçiş >= 1. sınıf: ${class2.oneWay.tollCost} >= ${class1.oneWay.tollCost}`
  );
} catch (e) {
  failed++;
  console.error(`  ✗ Test E7 hata: ${(e as Error).message}`);
}

// ─── TEST E8: Gidiş-dönüş toggle ───────────────────────────────────────────
console.log('\nEdge Case 8: Round trip hesaplaması tutarlılığı');
try {
  const result = calculateRoute({
    ...BASE_PARAMS,
    startDistrictId: '34-kadikoy',
    endDistrictId: '06-cankaya',
    roundTrip: true,
  });
  assert(
    result.roundTrip.distanceKm === result.oneWay.distanceKm * 2,
    `RT mesafe = 2x: ${result.roundTrip.distanceKm} = ${result.oneWay.distanceKm * 2}`
  );
  assert(
    result.roundTrip.tollCost === result.oneWay.tollCost * 2,
    `RT geçiş = 2x: ${result.roundTrip.tollCost} = ${result.oneWay.tollCost * 2}`
  );
} catch (e) {
  failed++;
  console.error(`  ✗ Test E8 hata: ${(e as Error).message}`);
}

// ─── SONUÇ ──────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`);
console.log(`Edge Case Sonuç: ${passed} geçti, ${failed} kaldı`);
if (failed > 0) {
  process.exit(1);
}
