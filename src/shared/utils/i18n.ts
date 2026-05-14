import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { z } from 'zod';

// ── Mapa global de errores de Zod en español ─────────────────────────────────
// Reemplaza TODOS los mensajes ingleses por defecto de Zod en toda la aplicación.
// Esto cubre: "Expected string, received null", "Required", "Invalid email", etc.
z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === 'undefined' || issue.received === 'null') {
        return { message: 'Este campo es requerido' };
      }
      return { message: `Se esperaba ${issue.expected}` };

    case z.ZodIssueCode.too_small:
      if (issue.type === 'string') {
        if (issue.minimum === 1) return { message: 'Este campo es requerido' };
        return { message: `Mínimo ${issue.minimum} caracteres` };
      }
      if (issue.type === 'number') {
        return { message: `El valor mínimo es ${issue.minimum}` };
      }
      if (issue.type === 'array') {
        return { message: `Se requiere al menos ${issue.minimum} elemento(s)` };
      }
      return { message: ctx.defaultError };

    case z.ZodIssueCode.too_big:
      if (issue.type === 'string') {
        return { message: `Máximo ${issue.maximum} caracteres` };
      }
      if (issue.type === 'number') {
        return { message: `El valor máximo es ${issue.maximum}` };
      }
      return { message: ctx.defaultError };

    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') return { message: 'El email no es válido' };
      if (issue.validation === 'url')   return { message: 'La URL no es válida' };
      if (issue.validation === 'uuid')  return { message: 'El formato no es válido' };
      if (issue.validation === 'regex') return { message: 'El formato no es válido' };
      return { message: 'Formato no válido' };

    case z.ZodIssueCode.invalid_enum_value:
      return { message: `Opción no válida` };

    case z.ZodIssueCode.invalid_date:
      return { message: 'La fecha no es válida' };

    case z.ZodIssueCode.custom:
      return { message: issue.message ?? 'Valor no válido' };

    default:
      return { message: ctx.defaultError };
  }
});

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Producto temporalmente en español. Se mantiene i18n listo para reactivar selector de idioma.
    lng: 'es',

    // Idioma de respaldo si la detección falla o falta clave
    fallbackLng: 'es',

    // Idiomas soportados
    supportedLngs: ['es', 'en'],

    // Namespace por defecto
    defaultNS: 'common',
    ns: ['common'],

    // Cargar traducciones desde /public/locales/{lng}/{ns}.json
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Detección: localStorage → navigator → cookie
    detection: {
      order: ['localStorage', 'navigator', 'cookie'],
      caches: ['localStorage'],
      lookupLocalStorage: 'roke_language',
    },

    interpolation: {
      // React ya escapa por defecto
      escapeValue: false,
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;
