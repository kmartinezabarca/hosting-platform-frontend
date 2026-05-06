export const toFlagEmoji = (cc: string | null | undefined): string => {
  if (!cc) return '🌍';
  return cc
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)));
};

export const countryName = (cc: string, locale = 'es'): string => {
  try {
    const dn = new Intl.DisplayNames([locale], { type: 'region' });
    return dn.of(cc) ?? cc;
  } catch {
    return cc;
  }
};
