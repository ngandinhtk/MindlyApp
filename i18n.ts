import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './src/locales/en.json';
import vi from './src/locales/vi.json';

i18n
  .use(initReactI18next)
  .init({
    // compatibilityJSON: 'v3', // For react-i18next versions > 11.1.0
    resources: {
      en: {
        translation: en
      },
      vi: {
        translation: vi
      }
    },
    // Hardcode the default language for now
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from xss
    }
  });

export default i18n;
