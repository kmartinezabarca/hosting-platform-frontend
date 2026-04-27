type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

type QueryParams = Record<string, QueryParamValue>;

/** Construye una query string filtrando valores vacíos, null y undefined. */
export const buildQuery = (params: QueryParams = {}): string => {
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    // Ignorar null/undefined/'' y strings "undefined"/"null"
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      value === 'undefined' ||
      value === 'null'
    ) {
      return;
    }

    // Arrays: ?key[]=a&key[]=b
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      value.forEach((v) => {
        if (
          v !== undefined &&
          v !== null &&
          String(v).trim() !== '' &&
          v !== 'undefined' &&
          v !== 'null'
        ) {
          qs.append(`${key}[]`, String(v));
        }
      });
      return;
    }

    // Booleans y números: convertir a string
    qs.set(key, String(value));
  });

  return qs.toString();
};
