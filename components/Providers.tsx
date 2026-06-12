'use client';

import { NextIntlClientProvider } from 'next-intl';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import en from '../messages/en.json';
import fr from '../messages/fr.json';
import rw from '../messages/rw.json';

const messagesMap = { en, fr, rw } as const;

type LocaleContextValue = {
  locale: string;
  setLocale: (value: string) => void;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => undefined,
});

export function useLocaleContext() {
  return useContext(LocaleContext);
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const savedLocale = typeof window !== 'undefined' ? window.localStorage.getItem('510-locale') : null;
    if (savedLocale && savedLocale in messagesMap) {
      setLocale(savedLocale);
      return;
    }

    const browserLocale = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
    if (browserLocale in messagesMap) {
      setLocale(browserLocale);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem('510-locale', locale);
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={messagesMap[locale as keyof typeof messagesMap]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
