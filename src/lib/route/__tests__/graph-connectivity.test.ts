/**
 * Graf Bağlantı Denetimi — 81 il arası rota bulunabilirlik testi
 * Her il merkezinden diğer tüm il merkezlerine rota bulunabilir mi kontrol eder.
 *
 * Çalıştırmak için: npx tsx src/lib/route/__tests__/graph-connectivity.test.ts
 */

import { dijkstra } from '../graph-search';
import { routeEdges } from '@/data/routes/graph';
import { anchors } from '@/data/locations/anchors';

// İl merkezi anchor'larını filtrele
const ilMerkezleri = anchors.filter((a) => a.type === 'il-merkezi');
const ilIds = ilMerkezleri.map((a) => a.id);

console.log(`\nGraf Bağlantı Denetimi — ${ilIds.length} il merkezi\n`);

let totalPairs = 0;
let successPairs = 0;
const failedPairs: string[] = [];

// Her il çiftini test et (optimize: sadece i < j)
for (let i = 0; i < ilIds.length; i++) {
  for (let j = i + 1; j < ilIds.length; j++) {
    totalPairs++;
    const result = dijkstra(ilIds[i], ilIds[j], routeEdges, true);
    if (result) {
      successPairs++;
    } else {
      failedPairs.push(`${ilIds[i]} → ${ilIds[j]}`);
    }
  }
}

console.log(`Toplam çift: ${totalPairs}`);
console.log(`Başarılı: ${successPairs}`);
console.log(`Başarısız: ${failedPairs.length}`);

if (failedPairs.length > 0) {
  console.log('\nBağlantısız il çiftleri:');
  for (const pair of failedPairs) {
    console.error(`  ✗ ${pair}`);
  }
  process.exit(1);
} else {
  console.log('\n✓ Tüm il merkezleri birbirine bağlı — graf tam bağlantılı!');
}
