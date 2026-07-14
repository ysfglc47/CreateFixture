import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18n } from 'i18n-js';
import LocalStore from '../../utils/localStore';
import { LANGUAGE_STORAGE_KEY, supportedLanguages, translations } from './translations';
import { runtimeTextTranslations } from './runtimeDictionary';
import { setRuntimeDictionary, setRuntimeLanguage } from './runtimeTranslator';

const fallbackLanguage = 'tr';
const supportedCodes = supportedLanguages.map(language => language.code);
const i18n = new I18n(translations);
i18n.defaultLocale = fallbackLanguage;
i18n.enableFallback = true;
i18n.locale = fallbackLanguage;
setRuntimeDictionary(runtimeTextTranslations);
setRuntimeLanguage(fallbackLanguage);

const LanguageContext = createContext({
  language: fallbackLanguage,
  isReady: false,
  supportedLanguages,
  setLanguage: async () => {},
  t: key => key,
});

function normalizeLanguageCode(localeCode) {
  const baseCode = String(localeCode || '').split('-')[0].toLowerCase();
  return supportedCodes.includes(baseCode) ? baseCode : fallbackLanguage;
}

function getDeviceLanguage() {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return normalizeLanguageCode(locale);
  } catch (error) {
    return fallbackLanguage;
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(fallbackLanguage);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadLanguage() {
      try {
        const storedLanguage = await LocalStore.getItem(LANGUAGE_STORAGE_KEY);
        const nextLanguage = storedLanguage ? normalizeLanguageCode(storedLanguage) : getDeviceLanguage();
        i18n.locale = nextLanguage;
        setRuntimeLanguage(nextLanguage);
        if (mounted) setLanguageState(nextLanguage);
      } catch (error) {
        i18n.locale = fallbackLanguage;
setRuntimeDictionary(runtimeTextTranslations);
setRuntimeLanguage(fallbackLanguage);
        if (mounted) setLanguageState(fallbackLanguage);
      } finally {
        if (mounted) setIsReady(true);
      }
    }

    loadLanguage();
    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = async nextLanguage => {
    const normalizedLanguage = normalizeLanguageCode(nextLanguage);
    i18n.locale = normalizedLanguage;
    setRuntimeLanguage(normalizedLanguage);
    setLanguageState(normalizedLanguage);
    await LocalStore.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage);
  };

  const value = useMemo(() => ({
    language,
    isReady,
    supportedLanguages,
    setLanguage,
    t: (key, options) => i18n.t(key, options),
  }), [language, isReady]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function translate(key, options) {
  return i18n.t(key, options);
}


