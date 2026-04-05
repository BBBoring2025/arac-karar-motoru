/**
 * Referans Veri Katmani — Ortak Tipler
 * Tum veri dosyalari bu tipleri kullanir.
 */

export type DataConfidence = 'kesin' | 'yuksek' | 'yaklasik' | 'tahmini';
export type DataSource = 'official_fixed' | 'official_periodic' | 'benchmark' | 'user_input' | 'derived_model';

export interface ReferenceMeta {
  sourceLabel: string;
  sourceUrl?: string;
  effectiveDate: string;
  updatedAt: string;
  confidence: DataConfidence;
  dataSource: DataSource;
  notes?: string;
}

export interface OfficialValue<T> {
  value: T;
  meta: ReferenceMeta;
}
