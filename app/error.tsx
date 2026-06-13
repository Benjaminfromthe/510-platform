"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Error({ reset }: { reset: () => void }) {
  const t = useTranslations("ui");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 text-[var(--text-primary)]">
      <section className="w-full max-w-md rounded-3xl border border-rose-400/30 bg-[var(--bg-card)]/95 p-8 text-center shadow-2xl shadow-black/40">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">510</p>
        <h1 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{t("errorGeneralTitle")}</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">{t("errorGeneralText")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => reset()} className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">{t("tryAgain")}</button>
          <Link href="/" className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-cyan-400 hover:text-cyan-100">{t("goHome")}</Link>
        </div>
      </section>
    </main>
  );
}
