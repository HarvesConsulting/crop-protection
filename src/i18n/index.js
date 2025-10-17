import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Імпортуємо файли перекладів
import en from './locales/en.json';
import es from './locales/es.json';
import uk from './locales/uk.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      uk: { translation: uk },
    },
    lng: 'uk',           // 🔰 Мова за замовчуванням — українська
    fallbackLng: 'uk',   // 🔁 Якщо переклад не знайдено — також українська
    interpolation: {
      escapeValue: false // 🔐 Вимикаємо екранування HTML (не потрібно в React)
    }
  });

export default i18n;
