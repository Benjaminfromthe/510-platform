'use client';

import { useTranslations } from 'next-intl';

export default function MoMoTicker() {
  const t = useTranslations('momo');

  // Build a repeated message array for seamless infinite scroll
  const message = `💛 ${t('label')} 2142036 · ${t('instruction')} · ${t('code')} 2142036 · ${t('network')} · 💛`;
  // Duplicate for seamless loop
  const items = Array.from({ length: 6 }, (_, i) => (
    <span key={i} className="px-8 shrink-0 whitespace-nowrap">
      {message}
    </span>
  ));

  return (
    <div
      className="w-full overflow-hidden bg-yellow-400 text-slate-900 py-2 text-sm font-semibold select-none"
      role="marquee"
      aria-label={t('ariaLabel')}
    >
      <div className="flex animate-ticker">
        {items}
        {/* Duplicate set for seamless loop */}
        {items}
      </div>
    </div>
  );
}
