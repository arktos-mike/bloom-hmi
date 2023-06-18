import i18n from 'i18next';
import Fetch from 'i18next-fetch-backend';
import AsyncStoragePlugin from 'i18next-react-native-async-storage'
import { initReactI18next } from 'react-i18next';

const getLng = async () => {
  try {
    const response = await fetch((window.location.hostname ? (window.location.protocol + '//' + window.location.hostname) : 'http://localhost') + ':3000/locales/lng');
    if (!response.ok) { /*throw Error(response.statusText);*/ }
    const data = await response.json();
    return data.lng

  }
  catch (error) { /*console.log(error);*/ return { lng: '' } }
}

const detectUserLanguage = (callback: (arg0: any) => void) => {
  return getLng().then(lng => { callback(lng); })
}

i18n.use(AsyncStoragePlugin(detectUserLanguage)).use(Fetch).use(initReactI18next).init({
  backend: {
    loadPath: (window.location.hostname ? (window.location.protocol + '//' + window.location.hostname) : 'http://localhost') + ':3000/locales/translations?lng={{lng}}&ns={{ns}}',
    requestOptions: {
      method: 'POST',
    },
  },
  supportedLngs: ['ru', 'en', 'es', 'tr'],
  fallbackLng: ['en'],
  preload: ['ru', 'en', 'es', 'tr'],
  ns: 'translation',
  defaultNS: 'translation',
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  react: {
    // Turn off the use of React Suspense
    useSuspense: false
  }
});

