"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("ui");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <section className="w-full max-w-lg rounded-3xl border border-cyan-400/30 bg-slate-900/90 p-8 text-center shadow-2xl shadow-cyan-500/10">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">510</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{t("notFoundTitle")}</h1>
        <p className="mt-3 text-sm text-slate-300">{t("notFoundText")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">{t("goHome")}</Link>
          <Link href="/book" className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-cyan-400 hover:text-white">{t("bookAClean")}</Link>
        </div>
      </section>
    </main>
  );
}
