'use client';

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import type { Locale } from '@/core/catalog';

type Preferences = {
  locale: Locale;
  dark: boolean;
  setLocale: (locale: Locale) => void;
  setDark: (dark: boolean) => void;
  t: (ru: string, en: string) => string;
};

const Context = createContext<Preferences | null>(null);
const defaultValue = '{"locale":"ru","dark":false}';
let fallback = defaultValue;

function read() {
  try {
    return localStorage.getItem('ea-preferences') ?? fallback;
  } catch {
    return fallback;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('ea-preferences', callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('ea-preferences', callback);
  };
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(subscribe, read, () => defaultValue);

  let value: { locale?: string; dark?: boolean } = {};

  try {
    value = JSON.parse(stored) ?? {};
  } catch {
    /* Invalid preference data uses defaults. */
  }

  const locale: Locale = value.locale === 'en' ? 'en' : 'ru',
    dark = value.dark === true;

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.lang = locale;
  }, [dark, locale]);
  const save = (nextLocale: Locale, nextDark: boolean) => {
    fallback = JSON.stringify({ locale: nextLocale, dark: nextDark });
    try {
      localStorage.setItem('ea-preferences', fallback);
    } catch {
      /* Keep preferences in memory when storage is blocked. */
    }

    window.dispatchEvent(new Event('ea-preferences'));
  };

  return (
    <Context.Provider
      value={{
        locale,
        dark,
        setLocale: (l) => save(l, dark),
        setDark: (d) => save(locale, d),
        t: (ru, en) => (locale === 'ru' ? ru : en),
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function usePreferences() {
  const context = useContext(Context);

  if (!context) throw new Error('PreferencesProvider required');

  return context;
}
