// GroceriesAI Shared Utilities
// Utility functions shared between frontend and backend

/**
 * Format a price amount for display.
 * Uses Colombian Peso (COP) format by default.
 */
export function formatPrice(amount: number, currency = 'COP', locale = 'es-CO'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate the number of days between two dates.
 */
export function daysBetween(date1: Date, date2: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const diff = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diff / MS_PER_DAY);
}

/**
 * Calculate restock urgency based on purchase frequency.
 * Returns 'high' (overdue), 'medium' (due soon), or 'low' (not yet).
 */
export function calculateRestockUrgency(
  avgDaysBetweenPurchases: number,
  daysSinceLastPurchase: number,
): 'high' | 'medium' | 'low' {
  const ratio = daysSinceLastPurchase / avgDaysBetweenPurchases;
  if (ratio >= 1.2) return 'high';
  if (ratio >= 0.8) return 'medium';
  return 'low';
}

/**
 * Calculate confidence score for a restock recommendation.
 * Higher purchase count = more confidence in the prediction.
 */
export function calculateConfidence(purchaseCount: number): number {
  if (purchaseCount < 3) return 0.3;
  if (purchaseCount < 5) return 0.5;
  if (purchaseCount < 10) return 0.7;
  return Math.min(0.95, 0.7 + purchaseCount * 0.01);
}

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/**
 * Generate a slug from a string.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
