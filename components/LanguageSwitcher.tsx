'use client';

import { Globe, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocaleContext } from './Providers';

const locales = [
  { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = locales.find((item) => item.code === locale) || locales[1];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectLanguage = (code: string) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-cyan-400 hover:text-cyan-200"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLocale.label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-800 bg-[#0b1329] shadow-xl">
          <div className="py-1">
            {locales.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelectLanguage(item.code)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition ${
                  locale === item.code
                    ? 'bg-cyan-400/10 text-cyan-300'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-cyan-400'
                }`}
              >
                <span aria-hidden="true">{item.flag}</span>
                <span>{item.label}</span>
                {locale === item.code && (
                  <span className="ml-auto text-cyan-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
