/**
 * Rota Sonuç Formatlama Yardımcıları
 * Mesafe, süre, para ve birim maliyetleri kullanıcı dostu formata çevirir.
 */

/**
 * Mesafeyi formatlar
 * @example formatDistance(450) → "450 km"
 */
export function formatDistance(km: number): string {
  return `${Math.round(km)} km`;
}

/**
 * Süreyi saat ve dakika olarak formatlar
 * @example formatDuration(330) → "5 saat 30 dk"
 * @example formatDuration(45) → "45 dk"
 */
export function formatDuration(min: number): string {
  const roundedMin = Math.round(min);
  if (roundedMin < 60) return `${roundedMin} dk`;

  const hours = Math.floor(roundedMin / 60);
  const remaining = roundedMin % 60;

  if (remaining === 0) return `${hours} saat`;
  return `${hours} saat ${remaining} dk`;
}

/**
 * Para birimini formatlar (TL)
 * @example formatCurrency(1250) → "₺1.250"
 * @example formatCurrency(99.5) → "₺100"
 */
export function formatCurrency(amount: number): string {
  return `₺${Math.round(amount).toLocaleString('tr-TR')}`;
}

/**
 * KM başına maliyeti formatlar
 * @example formatCostPerKm(2.78) → "₺2,78/km"
 */
export function formatCostPerKm(cost: number): string {
  return `₺${cost.toFixed(2).replace('.', ',')}/km`;
}
