import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import hi from './hi';
import mr from './mr';
import { storage } from '@/services/mock/storage';

export const SUPPORTED = ['en', 'hi', 'mr'];
const saved = storage.get('lang', 'en');

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi }, mr: { translation: mr } },
  lng: SUPPORTED.includes(saved) ? saved : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

const applyLang = (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.classList.toggle('lang-deva', lng !== 'en');
};
applyLang(i18n.language);
i18n.on('languageChanged', (lng) => { storage.set('lang', lng); applyLang(lng); });

export default i18n;
