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

// ─── GOLDEN TEST 2: 5 yaş otomobil — Gerçek 2026 TÜVTÜRK tarifesi ──────────
console.log('\nMuayene Test 2: 5 yaş otomobil — gerçek 2026 tarifesi (3.288 TL)');
{
  const result = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 5, yakitTupu: 'benzin' });
  assert(result.muafMi === false, `5 yaş: muaf değil`);
  assert(result.periyotAy === 24, `5 yaş: periyot = ${result.periyotAy} ay (beklenen: 24)`);
  // GERÇEK DEĞER: 3.288 TL muayene + 460 TL egzoz = 3.748 TL
  assert(
    result.tekMuayeneUcreti === 3748,
    `5 yaş benzinli otomobil tek ücret = ${result.tekMuayeneUcreti} TL (beklenen: 3.748 TL = 3.288 + 460 egzoz)`
  );
  assert(result.confidence === 'kesin', `Güven: ${result.confidence}`);
}

// ─── GOLDEN TEST 3: 10 yaş otomobil — her yıl, gerçek tarife ────────────────
console.log('\nMuayene Test 3: 10 yaş otomobil dizel — her yıl');
{
  const result = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 10, yakitTupu: 'dizel' });
  assert(result.muafMi === false, `10 yaş: muaf değil`);
  assert(result.periyotAy === 12, `10 yaş: periyot = ${result.periyotAy} ay (beklenen: 12)`);
  assert(
    result.tekMuayeneUcreti === 3748,
    `10 yaş dizel otomobil tek ücret = ${result.tekMuayeneUcreti} TL (beklenen: 3.748 TL)`
  );
  // Her yıl olduğu için yıllık = tek ücret
  assert(
    result.yillikMaliyet === 3748,
    `10 yaş yıllık = ${result.yillikMaliyet} TL`
  );
}

// ─── GOLDEN TEST 4: Elektrikli araç — egzoz yok ─────────────────────────────
console.log('\nMuayene Test 4: Elektrikli araç — sadece muayene 3.288 TL, egzoz yok');
{
  const elektrik = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 5, yakitTupu: 'elektrik' });
  const benzin = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 5, yakitTupu: 'benzin' });
  assert(
    elektrik.tekMuayeneUcreti === 3288,
    `Elektrikli tek ücret = ${elektrik.tekMuayeneUcreti} TL (beklenen: 3.288 TL — egzoz yok)`
  );
  assert(
    benzin.tekMuayeneUcreti === 3748,
    `Benzinli tek ücret = ${benzin.tekMuayeneUcreti} TL (beklenen: 3.748 TL — egzoz dahil)`
  );
  assert(
    elektrik.tekMuayeneUcreti === benzin.tekMuayeneUcreti - 460,
    `Fark = ${benzin.tekMuayeneUcreti - elektrik.tekMuayeneUcreti} TL (beklenen: 460 TL egzoz)`
  );
}

// ─── GOLDEN TEST 5: Geriye uyumluluk fonksiyonu ─────────────────────────────
console.log('\nMuayene Test 5: Geriye uyumluluk (calculateMuayeneMaliyeti)');
{
  const simple = calculateMuayeneMaliyeti('otomobil', 10, 'benzin');
  const detailed = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 10, yakitTupu: 'benzin' });
  assert(simple === detailed.yillikMaliyet, `Basit (${simple}) === Detaylı (${detailed.yillikMaliyet})`);
}

// ─── GOLDEN TEST 5b: Ağır vasıta — 4.446 TL ─────────────────────────────────
console.log('\nMuayene Test 5b: Otobüs (ağır vasıta) — 4.446 TL');
{
  const result = calculateMuayeneDetailed({ aracTipi: 'otobüs', aracYasi: 5, yakitTupu: 'dizel' });
  assert(
    result.tekMuayeneUcreti === 4446,
    `Otobüs tek ücret = ${result.tekMuayeneUcreti} TL (beklenen: 4.446 TL)`
  );
}

// ─── GOLDEN TEST 5c: Motosiklet — 1.674 TL ──────────────────────────────────
console.log('\nMuayene Test 5c: Motosiklet — 1.674 TL');
{
  const result = calculateMuayeneDetailed({ aracTipi: 'motosiklet', aracYasi: 5, yakitTupu: 'benzin' });
  assert(
    result.tekMuayeneUcreti === 1674,
    `Motosiklet tek ücret = ${result.tekMuayeneUcreti} TL (beklenen: 1.674 TL)`
  );
}

// ─── GOLDEN TEST 6: Metadata kontrolü ───────────────────────────────────────
console.log('\nMuayene Test 6: Metadata kontrolü');
{
  const result = calculateMuayeneDetailed({ aracTipi: 'otomobil', aracYasi: 5, yakitTupu: 'benzin' });
  assert(result.confidence === 'kesin', `Güven: ${result.confidence}`);
  assert(result.kaynak.includes('TÜVTÜRK'), `Kaynak: ${result.kaynak}`);
  assert(typeof result.sourceUrl === 'string' && result.sourceUrl.length > 0, `sourceUrl dolu: ${result.sourceUrl}`);
  assert(typeof result.effectiveDate === 'string' && result.effectiveDate.length > 0, `effectiveDate dolu: ${result.effectiveDate}`);
}

// ─── SONUÇ ──────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`);
console.log(`Muayene Golden Test Sonuç: ${passed} geçti, ${failed} kaldı`);
if (failed > 0) {
  process.exit(1);
}
