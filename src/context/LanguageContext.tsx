'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LanguageCode, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/lib/languages';

import en from '@/messages/en.json';

type Messages = typeof en;

// Statically import every message file. This is a deliberate tradeoff:
// dynamic import() per-language would shrink the initial bundle, but
// with 22 small JSON files (~260KB total, uncompressed) the simplicity
// of having them all available synchronously — no loading flicker when
// switching languages — outweighs the bundle cost for this app's scale.
import hi from '@/messages/hi.json';
import ta from '@/messages/ta.json';
import te from '@/messages/te.json';
import bn from '@/messages/bn.json';
import mr from '@/messages/mr.json';
import gu from '@/messages/gu.json';
import kn from '@/messages/kn.json';
import ml from '@/messages/ml.json';
import pa from '@/messages/pa.json';
import ur from '@/messages/ur.json';
import as_ from '@/messages/as.json';
import or_ from '@/messages/or.json';
import ne from '@/messages/ne.json';
import sa from '@/messages/sa.json';
import sd from '@/messages/sd.json';
import kok from '@/messages/kok.json';
import mai from '@/messages/mai.json';
import dgo from '@/messages/dgo.json';
import brx from '@/messages/brx.json';
import ks from '@/messages/ks.json';
import mni from '@/messages/mni.json';
import sat from '@/messages/sat.json';

const MESSAGES: Record<LanguageCode, any> = {
  en, hi, ta, te, bn, mr, gu, kn, ml, pa, ur,
  as: as_, or: or_, ne, sa, sd, kok, mai, dgo, brx, ks, mni, sat,
};

const STORAGE_KEY = 'vivasayi-language';

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  /**
   * Looks up a dot-path key (e.g. "Chatbot.title") in the current
   * language's messages. Falls back to English if the current language
   * is somehow missing the key (shouldn't happen — all 22 files are
   * validated to match en.json's key structure — but this is a safety
   * net against a future edit accidentally breaking that invariant).
   */
  t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getByPath(obj: any, path: string): unknown {
  return path.split('.').reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [hydrated, setHydrated] = useState(false);

  // Read the persisted preference on mount. Done in an effect (not
  // useState's initializer) because localStorage isn't available during
  // server-side render — reading it synchronously at init would cause a
  // hydration mismatch between server-rendered and client-rendered HTML.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
      setLanguageState(stored);
    }
    setHydrated(true);
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Keep the <html lang="..."> attribute in sync for accessibility
    // tools and the browser's own language-aware features (spellcheck,
    // translation prompts, etc).
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, []);

  const t = useCallback(
    (path: string): string => {
      const current = MESSAGES[language];
      const value = getByPath(current, path);
      if (typeof value === 'string') return value;

      // Missing in the current language — fall back to English rather
      // than show a raw key path to the user.
      const fallback = getByPath(MESSAGES.en, path);
      if (typeof fallback === 'string') return fallback;

      // Missing in English too — this is a real bug (typo'd key path
      // somewhere in the app), surface it visibly in dev rather than
      // silently render nothing.
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Translation key not found: "${path}"`);
      }
      return path;
    },
    [language]
  );

  // Avoid a flash of the wrong language: render children immediately
  // with the default language during SSR/first paint, then re-render
  // once we've checked localStorage. This matches how most i18n
  // libraries handle this without requiring a loading spinner.
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

