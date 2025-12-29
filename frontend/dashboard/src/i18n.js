import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importez vos fichiers de traduction
import enTranslation from './locales/en/translation.json'; // Updated path
import frTranslation from './locales/fr/translation.json'; // Updated path

i18n
  .use(LanguageDetector) // Détecte la langue de l'utilisateur
  .use(initReactI18next) // Lie i18next à React
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      fr: {
        translation: frTranslation
      }
    },
    fallbackLng: 'en', // Langue de secours si la langue détectée n'est pas disponible
    debug: true, // Active le mode debug (utile pendant le développement)

    interpolation: {
      escapeValue: false, // Ne pas échapper les valeurs HTML, React le fait déjà
    }
  });

export default i18n;
