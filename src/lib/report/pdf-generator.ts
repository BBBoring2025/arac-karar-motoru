/**
 * PDF Rapor Uretici
 *
 * jsPDF + autoTable ile profesyonel PDF karar raporu olusturur.
 * Sadece client-side calisir (browser ortami).
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RaporCiktisi } from './types';
import type { DataConfidence } from '@/lib/types';

/**
 * RaporCiktisi'ndan PDF olusturur ve tarayicida indirilmesini saglar.
 */
export function generatePDF(rapor: RaporCiktisi): void {
  const doc = new jsPDF('p', 'mm', 'a4');

  // --- Title ---
  doc.setFontSize(20);
  doc.text('Arac Karar Motoru', 20, 25);
  doc.setFontSize(14);
  doc.text('Karar Raporu', 20, 33);

  // --- Date ---
  doc.setFontSize(9);
  doc.setTextColor(128);
  doc.text(
    `Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`,
    20,
    40,
  );
  doc.setTextColor(0);

  // --- Vehicle info ---
  doc.setFontSize(12);
  doc.text('Arac Bilgisi', 20, 52);
  doc.setFontSize(10);
  const vehicle = rapor.aracBilgisi;
  doc.text(`${vehicle.marka} ${vehicle.model} (${vehicle.yil})`, 20, 59);
  doc.text(`Fiyat: ${formatTLForPDF(vehicle.fiyat)}`, 20, 65);
  doc.text(
    `Motor: ${vehicle.motorHacmi}cc | Yakit: ${vehicle.yakitTupu}`,
    20,
    71,
  );

  // --- Summary box ---
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 78, 170, 25, 'F');
  doc.setFontSize(11);
  doc.text('Toplam Maliyet Ozeti', 25, 87);
  doc.setFontSize(10);
  doc.text(
    `Toplam: ${formatTLForPDF(rapor.ozet.toplamMaliyet)} (${rapor.periyot})`,
    25,
    94,
  );
  doc.text(
    `Aylik Ort.: ${formatTLForPDF(rapor.ozet.aylikOrtalama)} | KM Basi: ${rapor.ozet.kmBasiMaliyet.toFixed(2)} TL/km`,
    25,
    100,
  );

  // --- Breakdown table ---
  const tableData = rapor.kalemler.map((k) => [
    k.baslik,
    formatTLForPDF(k.tutar),
    mapConfidence(k.guvenSeviyesi),
    k.kaynakAdi,
  ]);

  autoTable(doc, {
    startY: 110,
    head: [['Kalem', 'Tutar', 'Guven', 'Kaynak']],
    body: tableData,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [249, 115, 22] }, // orange-500
    columnStyles: {
      1: { halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  // --- Methodology note (after table) ---
  const lastTable = (doc as unknown as { lastAutoTable?: { finalY?: number } })
    .lastAutoTable;
  const finalY = lastTable?.finalY ?? 200;

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('Metodoloji', 20, finalY + 12);
  doc.setFontSize(8);

  const methodLines = doc.splitTextToSize(rapor.metodoloji.aciklama, 170);
  doc.text(methodLines, 20, finalY + 18);

  // --- Confidence legend ---
  doc.text(
    'Guven Seviyeleri: Kesin = resmi tarife | Yaklasik = referans deger | Tahmini = sektor ortalamasi',
    20,
    finalY + 30,
  );

  // --- Footer ---
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(
    'Bu rapor bilgilendirme amaclidir, yatirim tavsiyesi degildir. Veriler periyodik olarak guncellenir.',
    20,
    285,
  );
  doc.text('arackararmotoru.com', 170, 285);

  // --- Save / Download ---
  const fileName = `karar-raporu-${vehicle.marka}-${vehicle.model}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTLForPDF(amount: number): string {
  return (
    new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' TL'
  );
}

function mapConfidence(level: DataConfidence): string {
  const map: Record<string, string> = {
    kesin: 'Kesin',
    yuksek: 'Yuksek',
    'yaklaşık': 'Yaklasik',
    tahmini: 'Tahmini',
  };
  return map[level] || level;
}
