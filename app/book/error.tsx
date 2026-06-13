"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Error({ reset }: { reset: () => void }) {
  const t = useTranslations("ui");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-rose-400/30 bg-slate-900/90 p-8 text-center shadow-2xl shadow-black/40">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">510</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">{t("errorBookTitle")}</h1>
        <p className="mt-3 text-sm text-slate-300">{t("errorBookText")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={() => reset()} className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">{t("tryAgain")}</button>
          <Link href="/" className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-cyan-400 hover:text-white">{t("goHome")}</Link>
        </div>
      </section>
    </main>
  );
}
