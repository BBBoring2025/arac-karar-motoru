/**
 * Muayene Golden Testleri — TÜVTÜRK 2026 Tarifesinden Bilinen Değerler
 *
 * Çalıştırmak için: npx tsx src/lib/muayene/__tests__/muayene.test.ts
 */

import { calculateMuayeneDetailed, calculateMuayeneMaliyeti } from '../calculator';

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

// ─── GOLDEN TEST 1: Sıfır km araç (ilk 3 yıl muaf) ─────────────────────────
console.log('\nMuayene Test 1: Sıfır km araç — muaf');
{
  const result = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 0, yakitTupu: 'benzin' });
  assert(result.muafMi === true, `0 yaş: muaf = ${result.muafMi}`);
  assert(result.yillikMaliyet === 0, `0 yaş: yıllık maliyet = ${result.yillikMaliyet} TL`);
  assert(result.periyotAy === 0, `0 yaş: periyot = ${result.periyotAy} ay`);
}

// ─── GOLDEN TEST 2: 5 yaş otomobil (2 yılda bir) ────────────────────────────
console.log('\nMuayene Test 2: 5 yaş otomobil — 2 yılda bir');
{
  const result = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 5, yakitTupu: 'benzin' });
  assert(result.muafMi === false, `5 yaş: muaf değil`);
  assert(result.periyotAy === 24, `5 yaş: periyot = ${result.periyotAy} ay (beklenen: 24)`);
  assert(result.tekMuayeneUcreti > 0, `5 yaş: tek muayene ücreti = ${result.tekMuayeneUcreti} TL`);
  assert(result.confidence === 'kesin', `Güven: ${result.confidence}`);
}

// ─── GOLDEN TEST 3: 10 yaş otomobil (her yıl) ───────────────────────────────
console.log('\nMuayene Test 3: 10 yaş otomobil — her yıl');
{
  const result = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 10, yakitTupu: 'dizel' });
  assert(result.muafMi === false, `10 yaş: muaf değil`);
  assert(result.periyotAy === 12, `10 yaş: periyot = ${result.periyotAy} ay (beklenen: 12)`);
  assert(result.tekMuayeneUcreti > 0, `10 yaş: tek muayene ücreti = ${result.tekMuayeneUcreti} TL`);
  assert(result.yillikMaliyet > 0, `10 yaş: yıllık maliyet = ${result.yillikMaliyet} TL`);
}

// ─── GOLDEN TEST 4: Elektrikli araç (egzoz yok) ─────────────────────────────
console.log('\nMuayene Test 4: Elektrikli araç — egzoz emisyon ücreti yok');
{
  const elektrik = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 5, yakitTupu: 'elektrik' });
  const benzin = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 5, yakitTupu: 'benzin' });
  assert(
    elektrik.tekMuayeneUcreti <= benzin.tekMuayeneUcreti,
    `Elektrikli (${elektrik.tekMuayeneUcreti}) <= Benzinli (${benzin.tekMuayeneUcreti}) — egzoz ücreti yok`
  );
}

// ─── GOLDEN TEST 5: Geriye uyumluluk fonksiyonu ─────────────────────────────
console.log('\nMuayene Test 5: Geriye uyumluluk (calculateMuayeneMaliyeti)');
{
  const simple = calculateMuayeneMaliyeti('otomobil', 10, 'benzin');
  const detailed = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 10, yakitTupu: 'benzin' });
  assert(simple === detailed.yillikMaliyet, `Basit (${simple}) === Detaylı (${detailed.yillikMaliyet})`);
}

// ─── GOLDEN TEST 6: Metadata kontrolü ───────────────────────────────────────
console.log('\nMuayene Test 6: Metadata kontrolü');
{
  const result = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 5, yakitTupu: 'benzin' });
  assert(result.confidence === 'kesin', `Güven: ${result.confidence}`);
  assert(result.kaynak.includes('TÜVTÜRK'), `Kaynak: ${result.kaynak}`);
}

// ─── SONUÇ ──────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`);
console.log(`Muayene Golden Test Sonuç: ${passed} geçti, ${failed} kaldı`);
if (failed > 0) {
  process.exit(1);
}
