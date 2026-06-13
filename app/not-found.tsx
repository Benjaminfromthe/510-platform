"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("ui");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 text-[var(--text-primary)]">
      <section className="w-full max-w-lg rounded-3xl border border-cyan-400/30 bg-[var(--bg-card)]/95 p-8 text-center shadow-2xl shadow-cyan-500/10">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">510</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">{t("notFoundTitle")}</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">{t("notFoundText")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">{t("goHome")}</Link>
          <Link href="/book" className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-cyan-400 hover:text-cyan-100">{t("bookAClean")}</Link>
        </div>
      </section>
    </main>
  );
}
