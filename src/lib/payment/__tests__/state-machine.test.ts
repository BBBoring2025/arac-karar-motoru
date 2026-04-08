/**
 * Sprint C P2 — getPaymentMode() unit tests
 *
 * Run via: npx tsx src/lib/payment/__tests__/state-machine.test.ts
 *
 * Tests the new 3-mode helper without touching the existing 6-state
 * derivePaymentState() function.
 */

import { getPaymentMode } from '../state-machine';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label}`);
    failed++;
  }
}

console.log('\nSprint C P2 — state-machine.test.ts (getPaymentMode)\n');

// 9 input combinations: 3 (paymentEnabled) × 3 (iyzicoMode)

console.log('paymentEnabled=false × any iyzicoMode → paymentDisabled');
assert(
  getPaymentMode({ paymentEnabled: false, iyzicoMode: 'sandbox' }) ===
    'paymentDisabled',
  'false + sandbox → paymentDisabled'
);
assert(
  getPaymentMode({ paymentEnabled: false, iyzicoMode: 'production' }) ===
    'paymentDisabled',
  'false + production → paymentDisabled'
);
assert(
  getPaymentMode({ paymentEnabled: false, iyzicoMode: null }) ===
    'paymentDisabled',
  'false + null → paymentDisabled'
);

console.log('\npaymentEnabled=true × iyzicoMode=sandbox → paymentSandbox');
assert(
  getPaymentMode({ paymentEnabled: true, iyzicoMode: 'sandbox' }) ===
    'paymentSandbox',
  'true + sandbox → paymentSandbox'
);

console.log('\npaymentEnabled=true × iyzicoMode=production → paymentLive');
assert(
  getPaymentMode({ paymentEnabled: true, iyzicoMode: 'production' }) ===
    'paymentLive',
  'true + production → paymentLive'
);

console.log('\npaymentEnabled=true × iyzicoMode=null|undefined|disabled → paymentDisabled');
assert(
  getPaymentMode({ paymentEnabled: true, iyzicoMode: null }) ===
    'paymentDisabled',
  'true + null → paymentDisabled'
);
assert(
  getPaymentMode({ paymentEnabled: true, iyzicoMode: undefined }) ===
    'paymentDisabled',
  'true + undefined → paymentDisabled'
);
assert(
  getPaymentMode({ paymentEnabled: true, iyzicoMode: 'disabled' }) ===
    'paymentDisabled',
  'true + "disabled" → paymentDisabled'
);

console.log('\nNo iyzicoMode field at all → paymentDisabled when enabled too');
assert(
  getPaymentMode({ paymentEnabled: true }) === 'paymentDisabled',
  'paymentEnabled true, iyzicoMode missing → paymentDisabled'
);

console.log('\n==================================================');
console.log(`Sonuç: ${passed} geçti, ${failed} kaldı`);
if (failed > 0) process.exit(1);
