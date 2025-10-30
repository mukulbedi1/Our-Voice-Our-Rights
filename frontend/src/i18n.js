import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend'; // <-- 1. This import is essential

console.log("i18n.js: Initializing i18next...");

i18n
  .use(Backend) // <-- 2. This line tells i18next to load files from a server
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Binds i18next to React
  .init({
    // IMPORTANT: 'en' is your fallback. Your 'public/locales/en/translation.json' MUST exist.
    fallbackLng: 'en',
    debug: true, // Shows logs in the console. Set to false for production.
    supportedLngs: [ // All languages you have .json files for
      'en', 'hi', 'te', 'as', 'gu', 'mr', 'ur', 'kn', 'ml',
      'mni', 'lus', 'or', 'pa', 'ne', 'ta', 'bn', 'kok'
    ],
    interpolation: {
      escapeValue: false, // React already does this
    },
    backend: {
      // This tells the backend where to find your files
      // It looks for files like /locales/en/translation.json
      loadPath: '/locales/{{lng}}/translation.json',
    },
    react: {
      // This is the MOST IMPORTANT FIX for the timing issue.
      // It tells React to "wait" (show a fallback) until translations are loaded.
      useSuspense: true,
    }
  })
  .then(() => console.log("i18n.js: i18next initialized successfully."))
  .catch(err => console.error("i18n.js: i18next initialization failed:", err));

export default i18n;

