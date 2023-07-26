// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en', // Langue de secours si la langue préférée n'est pas disponible
    debug: true, // Activez le mode de débogage pour voir les informations de i18n dans la console
    interpolation: {
      escapeValue: false, // Pas besoin d'échapper les valeurs car React les gère de manière sécurisée
    },
    // Ajoutez ici vos fichiers de traduction pour chaque langue
    resources: {
      en: {
        translation: {
          // Ajoutez ici les traductions pour la langue anglaise
          // Par exemple: "hello": "Hello"
        },
      },
      fr: {
        translation: {
          // Ajoutez ici les traductions pour la langue française
          // Par exemple: "hello": "Bonjour"
        },
      },
      // Ajoutez d'autres langues si nécessaire
    },
  });

export default i18n;
