export const formatCurrency = (
  n: number | string = 0,
  currency = 'MXN',
  locale = 'es-MX',
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

export const formatPercent = (n: number | string = 0, locale = 'es-MX'): string =>
  new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format((Number(n) || 0) / 100);

export const compactNumber = (n: number | string = 0, locale = 'es-MX'): string =>
  new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(n || 0));
