/**
 * MTV Testleri — Tarife Tablosu Snapshot Doğrulaması
 *
 * Bu testler kod içindeki MTV tarife snapshot'ının (src/data/mtv.ts) tutarlı
 * çalıştığını doğrular. Confidence politikası:
 *
 * - Elektrikli araç → 'kesin' (her zaman 0 TL, 2026 muafiyeti)
 * - Diğer yakıt tipleri → 'yaklaşık' (snapshot olduğu için)
 *
 * Snapshot değerleri GİB tarife yapısını yansıtır ancak yıl içinde
 * güncellenebilir. Kesin tutar için GİB MTV Hesaplama aracı kullanılmalıdır.
 *
 * Testler bu snapshot'ın iç tutarlılığını doğrular — gerçek GİB değerleriyle
 * birebir aynı olduğunu DEĞİL, ancak doğru bracket/yaş grubu seçildiğini.
 *
 * Çalıştırmak için: npx tsx src/lib/mtv/__tests__/mtv.test.ts
 */

import { calculateMTV, calculateMTVDetailed } from '../calculator';
import { validateMTVInput } from '../validators';

let passed = 0;
let failed = 0;

function assertEqual(actual: number, expected: number, label: string): void {
  if (actual === expected) {
    passed++;
    console.log(`  ✓ ${label}: ${actual} TL`);
  } else {
    failed++;
    console.error(`  ✗ ${label}: ${actual} TL (beklenen: ${expected} TL)`);
  }
}

function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

// ─── GOLDEN TEST: Benzin MTV (GİB 2026 tarifesi) ────────────────────────────
console.log('\nGolden Test 1: Benzin MTV — 1-1300cc');
assertEqual(calculateMTV(1200, 1, 'benzin'), 3950, '1-1300cc, 1-3 yaş');
assertEqual(calculateMTV(1200, 5, 'benzin'), 5200, '1-1300cc, 4-6 yaş');
assertEqual(calculateMTV(1200, 10, 'benzin'), 7100, '1-1300cc, 7-11 yaş');
assertEqual(calculateMTV(1200, 14, 'benzin'), 10200, '1-1300cc, 12-15 yaş');
assertEqual(calculateMTV(1200, 20, 'benzin'), 15800, '1-1300cc, 16+ yaş');

console.log('\nGolden Test 2: Benzin MTV — 1301-1600cc');
assertEqual(calculateMTV(1500, 1, 'benzin'), 6900, '1301-1600cc, 1-3 yaş');
assertEqual(calculateMTV(1500, 5, 'benzin'), 9100, '1301-1600cc, 4-6 yaş');
assertEqual(calculateMTV(1500, 20, 'benzin'), 27600, '1301-1600cc, 16+ yaş');

// ─── GOLDEN TEST: Elektrikli Araç (MTV muaf) ────────────────────────────────
console.log('\nGolden Test 3: Elektrikli araç — MTV muaf');
assertEqual(calculateMTV(0, 1, 'elektrik'), 0, 'Elektrikli 1 yaş');
assertEqual(calculateMTV(0, 5, 'elektrik'), 0, 'Elektrikli 5 yaş');
assertEqual(calculateMTV(0, 20, 'elektrik'), 0, 'Elektrikli 20 yaş');

// ─── GOLDEN TEST: Hibrit Araç ───────────────────────────────────────────────
console.log('\nGolden Test 4: Hibrit araç');
{
  const result = calculateMTV(1800, 2, 'hibrit');
  assert(result > 0, `Hibrit 1800cc, 2 yaş: ${result} TL (> 0)`);
  const benzinResult = calculateMTV(1800, 2, 'benzin');
  assert(result < benzinResult, `Hibrit (${result}) < Benzin (${benzinResult})`);
}

// ─── GOLDEN TEST: Detaylı sonuç + confidence politikası ────────────────────
console.log('\nGolden Test 5: Detaylı MTV sonucu (benzin → yaklaşık)');
{
  const detail = calculateMTVDetailed({ motorHacmi: 1200, aracYasi: 2, yakitTupu: 'benzin' });
  assertEqual(detail.yillikTutar, 3950, 'Yıllık tutar (snapshot)');
  assert(detail.aylikTutar > 0, `Aylık tutar: ${detail.aylikTutar} TL`);
  // YENİ: Benzinli araçta confidence "yaklaşık" olmalı (snapshot)
  assert(
    detail.confidence === 'yaklaşık',
    `Benzinli confidence: ${detail.confidence} (beklenen: yaklaşık)`
  );
  assert(detail.yasGrubu === '1-3', `Yaş grubu: ${detail.yasGrubu}`);
  assert(detail.tabloAdi.length > 0, `Tablo adı: ${detail.tabloAdi}`);
  assert(detail.kaynak.includes('GİB'), `Kaynak: ${detail.kaynak}`);
  assert(typeof detail.sourceUrl === 'string' && detail.sourceUrl.length > 0, `sourceUrl dolu`);
  assert(typeof detail.effectiveDate === 'string' && detail.effectiveDate.length > 0, `effectiveDate dolu`);
  // YENİ: Uyarı mevcut olmalı
  assert(
    typeof detail.uyari === 'string' && detail.uyari.includes('GİB'),
    `Uyarı mevcut: ${detail.uyari?.substring(0, 50)}...`
  );
}

// ─── GOLDEN TEST: Elektrikli araç (KESIN olmalı) ────────────────────────────
console.log('\nGolden Test 5b: Elektrikli araç — confidence kesin (her zaman 0)');
{
  const detail = calculateMTVDetailed({ motorHacmi: 0, aracYasi: 3, yakitTupu: 'elektrik' });
  assertEqual(detail.yillikTutar, 0, 'Elektrikli yıllık tutar = 0');
  // Elektrikli araçta confidence "kesin" — çünkü her zaman 0 TL
  assert(detail.confidence === 'kesin', `Elektrikli confidence: ${detail.confidence}`);
  assert(typeof detail.sourceUrl === 'string', 'Elektrikli sourceUrl mevcut');
  assert(typeof detail.effectiveDate === 'string', 'Elektrikli effectiveDate mevcut');
  // Elektrikli araçta uyarı YOK
  assert(detail.uyari === undefined, 'Elektrikli araçta uyarı yok (kesin tutar)');
}

// ─── GOLDEN TEST: Hibrit confidence ─────────────────────────────────────────
console.log('\nGolden Test 5c: Hibrit araç confidence (yaklaşık)');
{
  const detail = calculateMTVDetailed({ motorHacmi: 1800, aracYasi: 2, yakitTupu: 'hibrit' });
  assert(detail.yillikTutar > 0, `Hibrit tutar > 0: ${detail.yillikTutar}`);
  assert(
    detail.confidence === 'yaklaşık',
    `Hibrit confidence: ${detail.confidence} (beklenen: yaklaşık)`
  );
  assert(typeof detail.uyari === 'string', `Hibrit uyarı mevcut`);
}

// ─── GOLDEN TEST: Validasyon ─────────────────────────────────────────────────
console.log('\nGolden Test 6: Input validasyonu');
assert(validateMTVInput({ motorHacmi: 1200, aracYasi: 2, yakitTupu: 'benzin' }) === null, 'Geçerli input');
assert(validateMTVInput({ motorHacmi: 0, aracYasi: 2, yakitTupu: 'benzin' }) !== null, 'Motor hacmi 0 (elektrikli değil) → hata');
assert(validateMTVInput({ motorHacmi: 0, aracYasi: 2, yakitTupu: 'elektrik' }) === null, 'Elektrikli motor hacmi 0 → geçerli');
assert(validateMTVInput({ motorHacmi: 1200, aracYasi: -1, yakitTupu: 'benzin' }) !== null, 'Negatif yaş → hata');
assert(validateMTVInput({ motorHacmi: 1200, aracYasi: 2, yakitTupu: 'kerosin' }) !== null, 'Geçersiz yakıt → hata');

// ─── SONUÇ ──────────────────────────────────────────────────────────────────
console.log(`\n${'='.repeat(50)}`);
console.log(`MTV Golden Test Sonuç: ${passed} geçti, ${failed} kaldı`);
if (failed > 0) {
  process.exit(1);
}
