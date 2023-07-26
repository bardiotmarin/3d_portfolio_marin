import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          // Traductions en anglais...
        },
      },
      fr: {
        translation: {
          // Traductions en français...
        },
      },
    },
    supportedLngs: ['en', 'fr'], // Ne pas inclure 'cimode' ici
    // Autres options de configuration...
  });

export default i18n;
