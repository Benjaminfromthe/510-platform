'use client';

import { NextIntlClientProvider } from 'next-intl';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

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

  const setLocaleWithPersistence = (value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('510-locale', value);
      document.cookie = `510-locale=${value}; path=/; max-age=31536000; SameSite=Lax`;
    }
    setLocale(value);
  };

  useEffect(() => {
    const savedLocale = typeof window !== 'undefined' ? window.localStorage.getItem('510-locale') : null;
    const cookieLocale = typeof document !== 'undefined' ? document.cookie.match(/(?:^|; )510-locale=([^;]+)/)?.[1] : null;
    const initialLocale = savedLocale || cookieLocale;
    if (initialLocale && initialLocale in messagesMap) {
      setLocale(initialLocale);
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
    document.cookie = `510-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale: setLocaleWithPersistence }), [locale]);

  // Map our locales to Clerk's supported locales
  // Clerk supports: en, fr, and others. For Kinyarwanda (rw), fallback to English
  const clerkLocale = locale === 'rw' ? 'en' : locale;

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider
        locale={locale}
        messages={messagesMap[locale as keyof typeof messagesMap]}
        timeZone="Africa/Kigali"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
