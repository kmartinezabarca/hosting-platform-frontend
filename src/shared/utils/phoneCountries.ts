/**
 * Mapeo de códigos de país ISO 3166-1 alpha-2 a prefijos telefónicos internacionales
 * y información adicional del país.
 */
export const phoneCountries = [
  { code: 'MX', name: 'México', prefix: '+52', flag: '🇲🇽' },
  { code: 'US', name: 'Estados Unidos', prefix: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canadá', prefix: '+1', flag: '🇨🇦' },
  { code: 'ES', name: 'España', prefix: '+34', flag: '🇪🇸' },
  { code: 'CO', name: 'Colombia', prefix: '+57', flag: '🇨🇴' },
  { code: 'AR', name: 'Argentina', prefix: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', prefix: '+56', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', prefix: '+51', flag: '🇵🇪' },
  { code: 'BR', name: 'Brasil', prefix: '+55', flag: '🇧🇷' },
  { code: 'VE', name: 'Venezuela', prefix: '+58', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', prefix: '+593', flag: '🇪🇨' },
  { code: 'BO', name: 'Bolivia', prefix: '+591', flag: '🇧🇴' },
  { code: 'PY', name: 'Paraguay', prefix: '+595', flag: '🇵🇾' },
  { code: 'UY', name: 'Uruguay', prefix: '+598', flag: '🇺🇾' },
  { code: 'GT', name: 'Guatemala', prefix: '+502', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', prefix: '+504', flag: '🇭🇳' },
  { code: 'SV', name: 'El Salvador', prefix: '+503', flag: '🇸🇻' },
  { code: 'NI', name: 'Nicaragua', prefix: '+505', flag: '🇳🇮' },
  { code: 'CR', name: 'Costa Rica', prefix: '+506', flag: '🇨🇷' },
  { code: 'PA', name: 'Panamá', prefix: '+507', flag: '🇵🇦' },
  { code: 'CU', name: 'Cuba', prefix: '+53', flag: '🇨🇺' },
  { code: 'DO', name: 'República Dominicana', prefix: '+1-809', flag: '🇩🇴' },
  { code: 'PR', name: 'Puerto Rico', prefix: '+1-787', flag: '🇵🇷' },
  { code: 'GB', name: 'Reino Unido', prefix: '+44', flag: '🇬🇧' },
  { code: 'FR', name: 'Francia', prefix: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemania', prefix: '+49', flag: '🇩🇪' },
  { code: 'IT', name: 'Italia', prefix: '+39', flag: '🇮🇹' },
  { code: 'PT', name: 'Portugal', prefix: '+351', flag: '🇵🇹' },
  { code: 'JP', name: 'Japón', prefix: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', prefix: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'India', prefix: '+91', flag: '🇮🇳' },
  { code: 'AU', name: 'Australia', prefix: '+61', flag: '🇦🇺' },
  { code: 'NZ', name: 'Nueva Zelanda', prefix: '+64', flag: '🇳🇿' },
];

/**
 * Obtiene el prefijo telefónico de un país por su código ISO.
 * @param countryCode - Código ISO del país (ej. "MX")
 * @returns El prefijo telefónico (ej. "+52") o undefined si no se encuentra
 */
export const getPhonePrefix = (countryCode: string): string | undefined => {
  const country = phoneCountries.find(c => c.code === countryCode);
  return country?.prefix;
};

/**
 * Obtiene el nombre del país por su código ISO.
 * @param countryCode - Código ISO del país (ej. "MX")
 * @returns El nombre del país o undefined si no se encuentra
 */
export const getCountryName = (countryCode: string): string | undefined => {
  const country = phoneCountries.find(c => c.code === countryCode);
  return country?.name;
};

/**
 * Formatea un número de teléfono con el prefijo del país.
 * @param phoneNumber - Número de teléfono sin prefijo (ej. "5512345678")
 * @param countryCode - Código ISO del país (ej. "MX")
 * @returns Número formateado con prefijo (ej. "+525512345678")
 */
export const formatPhoneWithPrefix = (phoneNumber: string, countryCode: string): string => {
  const prefix = getPhonePrefix(countryCode);
  if (!prefix) return phoneNumber;
  
  // Remover espacios, guiones, paréntesis y cualquier prefijo existente
  let cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
  
  // Si el número ya comienza con el prefijo (sin el +), no lo añadimos de nuevo
  if (cleanNumber.startsWith(prefix.replace('+', ''))) {
    return `+${cleanNumber}`;
  }
  
  return `${prefix}${cleanNumber}`;
};

/**
 * Extrae solo los dígitos de un número de teléfono.
 * @param phoneNumber - Número de teléfono con formato
 * @returns Solo los dígitos
 */
export const extractPhoneDigits = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, '');
};
