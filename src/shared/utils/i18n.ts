import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
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
