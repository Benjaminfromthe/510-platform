"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Sparkles, MapPin, Clock, Shield, Users } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">

        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("eyebrow")}</p>
          <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)] sm:text-5xl">{t("title")}</h1>
          <p className="max-w-2xl text-lg text-[var(--text-secondary)]">{t("subtitle")}</p>
        </header>

        <article className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{t("storyTitle")}</h2>
          <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">{t("storyText1")}</p>
          <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">{t("storyText2")}</p>
        </article>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: Sparkles, title: t("value1Title"), text: t("value1Text") },
            { icon: Shield, title: t("value2Title"), text: t("value2Text") },
            { icon: MapPin, title: t("value3Title"), text: t("value3Text") },
            { icon: Clock, title: t("value4Title"), text: t("value4Text") },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-500">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-semibold text-[var(--text-primary)]">{item.title}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.text}</p>
              </article>
            );
          })}
        </div>

        <article className="rounded-3xl border border-cyan-400/20 bg-cyan-400/5 p-6">
          <div className="flex items-start gap-3">
            <Users className="mt-1 h-5 w-5 text-cyan-500 shrink-0" />
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">{t("founderTitle")}</h2>
              <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">{t("founderText")}</p>
            </div>
          </div>
        </article>

        <div className="flex flex-wrap gap-3">
          <Link href="/services" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
            {t("ctaServices")}
          </Link>
          <Link href="/contact" className="rounded-full border border-[var(--border-color)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] hover:border-cyan-400">
            {t("ctaContact")}
          </Link>
        </div>

      </section>
    </main>
  );
}
