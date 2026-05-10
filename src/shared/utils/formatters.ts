export const formatCurrency = (
  value: number | string = 0,
  currency = 'MXN',
  locale = 'es-MX',
): string => {
  const normalizedValue =
    typeof value === 'string'
      ? value.replace(/,/g, '').trim()
      : value;

  const amount = Number(normalizedValue);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isNaN(amount) ? 0 : amount);
};

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
