/**
 * Base de datos simplificada de SEPOMEX para búsqueda de CP en México.
 * En una aplicación real, esto vendría de una API o base de datos completa.
 * 
 * Estructura: CP -> { estado, ciudad, colonias: [{ nombre, tipo }] }
 */

interface Colonia {
  nombre: string;
  tipo: string; // "Colonia", "Pueblo", "Fraccionamiento", etc.
}

interface PostalCodeData {
  estado: string;
  ciudad: string;
  colonias: Colonia[];
}

// Base de datos simplificada de SEPOMEX (muestra de datos)
// En producción, esto debería ser una API o una base de datos completa
const sepomexDatabase: Record<string, PostalCodeData> = {
  '01000': {
    estado: 'Ciudad de México',
    ciudad: 'Ciudad de México',
    colonias: [
      { nombre: 'Centro', tipo: 'Colonia' },
      { nombre: 'Cuauhtémoc', tipo: 'Colonia' },
    ]
  },
  '01010': {
    estado: 'Ciudad de México',
    ciudad: 'Ciudad de México',
    colonias: [
      { nombre: 'Centro', tipo: 'Colonia' },
    ]
  },
  '28000': {
    estado: 'Colima',
    ciudad: 'Colima',
    colonias: [
      { nombre: 'Centro', tipo: 'Colonia' },
      { nombre: 'Jardines de Colima', tipo: 'Fraccionamiento' },
    ]
  },
  '28010': {
    estado: 'Colima',
    ciudad: 'Colima',
    colonias: [
      { nombre: 'Centro', tipo: 'Colonia' },
    ]
  },
  '06600': {
    estado: 'Ciudad de México',
    ciudad: 'Ciudad de México',
    colonias: [
      { nombre: 'Santa Fe', tipo: 'Colonia' },
      { nombre: 'Lomas de Santa Fe', tipo: 'Fraccionamiento' },
    ]
  },
  '64000': {
    estado: 'Nuevo León',
    ciudad: 'Monterrey',
    colonias: [
      { nombre: 'Centro', tipo: 'Colonia' },
      { nombre: 'Barrio Antiguo', tipo: 'Colonia' },
    ]
  },
  '80000': {
    estado: 'Sinaloa',
    ciudad: 'Culiacán',
    colonias: [
      { nombre: 'Centro', tipo: 'Colonia' },
      { nombre: 'Chapultepec', tipo: 'Colonia' },
    ]
  },
  '58000': {
    estado: 'Michoacán',
    ciudad: 'Morelia',
    colonias: [
      { nombre: 'Centro', tipo: 'Colonia' },
      { nombre: 'Chapultepec', tipo: 'Colonia' },
    ]
  },
  '50000': {
    estado: 'Estado de México',
    ciudad: 'Toluca',
    colonias: [
      { nombre: 'Centro', tipo: 'Colonia' },
      { nombre: 'Capultitlán', tipo: 'Colonia' },
    ]
  },
};

/**
 * Busca información de un código postal en México.
 * @param postalCode - Código postal (5 dígitos)
 * @returns Datos del CP (estado, ciudad, colonias) o null si no se encuentra
 */
export const searchPostalCode = (postalCode: string): PostalCodeData | null => {
  const cleanCode = postalCode.replace(/\D/g, '').slice(0, 5);
  
  if (cleanCode.length !== 5) {
    return null;
  }

  return sepomexDatabase[cleanCode] || null;
};

/**
 * Obtiene solo el estado de un código postal.
 * @param postalCode - Código postal (5 dígitos)
 * @returns Nombre del estado o null
 */
export const getStateByPostalCode = (postalCode: string): string | null => {
  const data = searchPostalCode(postalCode);
  return data?.estado || null;
};

/**
 * Obtiene solo la ciudad de un código postal.
 * @param postalCode - Código postal (5 dígitos)
 * @returns Nombre de la ciudad o null
 */
export const getCityByPostalCode = (postalCode: string): string | null => {
  const data = searchPostalCode(postalCode);
  return data?.ciudad || null;
};

/**
 * Obtiene las colonias de un código postal.
 * @param postalCode - Código postal (5 dígitos)
 * @returns Array de colonias o null
 */
export const getColoniesByPostalCode = (postalCode: string): Colonia[] | null => {
  const data = searchPostalCode(postalCode);
  return data?.colonias || null;
};

/**
 * Obtiene una lista de códigos postales que coinciden con un estado.
 * Útil para autocompletado.
 * @param state - Nombre del estado
 * @returns Array de códigos postales
 */
export const getPostalCodesByState = (state: string): string[] => {
  return Object.entries(sepomexDatabase)
    .filter(([_, data]) => data.estado.toLowerCase().includes(state.toLowerCase()))
    .map(([code, _]) => code);
};

/**
 * Obtiene una lista de ciudades que coinciden con un estado.
 * @param state - Nombre del estado
 * @returns Array de ciudades únicas
 */
export const getCitiesByState = (state: string): string[] => {
  const cities = new Set<string>();
  Object.values(sepomexDatabase).forEach(data => {
    if (data.estado.toLowerCase() === state.toLowerCase()) {
      cities.add(data.ciudad);
    }
  });
  return Array.from(cities);
};

/**
 * Valida si un código postal existe en la base de datos.
 * @param postalCode - Código postal (5 dígitos)
 * @returns true si existe, false si no
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  return searchPostalCode(postalCode) !== null;
};

// Lista de estados mexicanos para referencia
export const mexicanStates = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
];
