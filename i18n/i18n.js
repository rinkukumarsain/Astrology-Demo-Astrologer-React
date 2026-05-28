"use client"
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all language files
import en from './languages/en.json';
import hi from './languages/hi.json';
import mr from './languages/mr.json';
import pa from './languages/pa.json';
import ta from './languages/ta.json';
import te from './languages/te.json';
import ml from './languages/ml.json';

import { getCookie } from '@/lib/clientHelpers';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  pa: { translation: pa },
  ta: { translation: ta },
  te: { translation: te },
  ml: { translation: ml },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? (getCookie('preferredLanguage') || localStorage.getItem('preferredLanguage') || 'en') : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;