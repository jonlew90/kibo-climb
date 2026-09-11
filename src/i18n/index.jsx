import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import enTranslations from '../locales/en.json';

// Registry of loaded language bundles (extensible for es, fr, de, ja, zh, etc.)
const TRANSLATIONS = {
  en: enTranslations,
  'en-US': enTranslations,
  'en-GB': enTranslations,
};

const I18nContext = createContext({
  language: 'en',
  dialect: 'en-US',
  acceptAllDialects: true,
  t: (key, params) => key,
  setLanguage: () => {},
  setDialect: () => {},
  setAcceptAllDialects: () => {},
});

/**
 * Resolves a nested key string like 'words.acceptedVariant' in an object.
 */
function resolveKey(obj, keyPath) {
  if (!obj || !keyPath) return null;
  const parts = keyPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }
  return typeof current === 'string' ? current : null;
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem('kibo_locale_language') || 'en';
    } catch {
      return 'en';
    }
  });

  const [dialect, setDialectState] = useState(() => {
    try {
      return localStorage.getItem('kibo_spelling_dialect') || 'en-US';
    } catch {
      return 'en-US';
    }
  });

  const [acceptAllDialects, setAcceptAllDialectsState] = useState(() => {
    try {
      const val = localStorage.getItem('kibo_accept_all_dialects');
      return val === null ? true : val === 'true';
    } catch {
      return true;
    }
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('kibo_locale_language', lang);
    } catch {}
  };

  const setDialect = (dlct) => {
    setDialectState(dlct);
    try {
      localStorage.setItem('kibo_spelling_dialect', dlct);
    } catch {}
  };

  const setAcceptAllDialects = (accept) => {
    setAcceptAllDialectsState(accept);
    try {
      localStorage.setItem('kibo_accept_all_dialects', String(accept));
    } catch {}
  };

  const t = useMemo(() => {
    return (key, params = {}) => {
      // 1. Try exact language bundle
      const bundle = TRANSLATIONS[language] || TRANSLATIONS['en'];
      let translation = resolveKey(bundle, key);

      // 2. Fallback to English base
      if (!translation && language !== 'en') {
        translation = resolveKey(TRANSLATIONS.en, key);
      }

      if (!translation) return key;

      // 3. Interpolate {{param}} tokens
      return Object.entries(params).reduce((acc, [paramKey, val]) => {
        return acc.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), String(val));
      }, translation);
    };
  }, [language]);

  const value = useMemo(() => ({
    language,
    dialect,
    acceptAllDialects,
    t,
    setLanguage,
    setDialect,
    setAcceptAllDialects,
  }), [language, dialect, acceptAllDialects, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}
