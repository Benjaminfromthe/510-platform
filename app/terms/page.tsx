"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

export default function TermsPage() {
  const t = useTranslations("terms");

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">

        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("eyebrow")}</p>
          <h1 className="text-4xl font-black text-[var(--text-primary)]">{t("title")}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{t("lastUpdated")}</p>
        </header>

        {[
          { title: t("sec1Title"), body: t("sec1Body") },
          { title: t("sec2Title"), body: t("sec2Body") },
          { title: t("sec3Title"), body: t("sec3Body") },
          { title: t("sec4Title"), body: t("sec4Body") },
          { title: t("sec5Title"), body: t("sec5Body") },
          { title: t("sec6Title"), body: t("sec6Body") },
        ].map((section) => (
          <article key={section.title} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{section.title}</h2>
            <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">{section.body}</p>
          </article>
        ))}

        <p className="text-sm text-[var(--text-secondary)]">
          {t("contact")}{" "}
          <a href="https://wa.me/250787769046" className="text-cyan-600 dark:text-cyan-400 underline hover:text-cyan-500">
            +250 787 769 046
          </a>
        </p>

        <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-cyan-500">← {t("backHome")}</Link>

      </section>
    </main>
  );
}
