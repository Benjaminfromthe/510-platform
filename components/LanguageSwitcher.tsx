'use client';

import { useLocaleContext } from './Providers';

const locales = [
  { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleContext();

  return (
    <div className="flex items-center gap-2">
      {locales.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLocale(item.code)}
          className={`inline-flex h-11 items-center justify-center rounded-full border px-3 py-2 text-base font-semibold transition sm:text-xs ${
            locale === item.code
              ? 'border-cyan-400 bg-cyan-400 text-slate-950'
              : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-cyan-400 hover:text-white'
          }`}
        >
          <span aria-hidden="true">{item.flag}</span>
          <span className="ml-1 hidden sm:inline">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
