"use client";

import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("ui");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="rounded-3xl border border-cyan-400/30 bg-slate-900/80 p-8 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/30 border-t-cyan-300" />
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">510</p>
        <h2 className="mt-2 text-xl font-semibold text-white">{t("loadingBook")}</h2>
      </div>
    </main>
  );
}
