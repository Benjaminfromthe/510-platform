"use client";

import { useTranslations } from "next-intl";
import { MessageCircleMore, Mail, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">

        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("eyebrow")}</p>
          <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)] sm:text-5xl">{t("title")}</h1>
          <p className="max-w-2xl text-lg text-[var(--text-secondary)]">{t("subtitle")}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">

          <a
            href="https://wa.me/250787769046?text=Hello%20510%20Cleaning%20Services!"
            target="_blank"
            rel="noreferrer"
            className="group rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl hover:border-cyan-400 hover:bg-cyan-400/5 transition"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-500">
              <MessageCircleMore className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">{t("whatsappTitle")}</h2>
            <p className="mt-2 text-[var(--text-secondary)]">{t("whatsappText")}</p>
            <p className="mt-3 font-semibold text-emerald-600 dark:text-emerald-400">+250 787 769 046</p>
            <span className="mt-4 inline-flex rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950">
              {t("whatsappCta")}
            </span>
          </a>

          <article className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-500">
              <Clock className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">{t("hoursTitle")}</h2>
            <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
              <p><span className="font-medium text-[var(--text-primary)]">{t("hoursWeekdays")}</span> — {t("hoursWeekdayTime")}</p>
              <p><span className="font-medium text-[var(--text-primary)]">{t("hoursSaturday")}</span> — {t("hoursSaturdayTime")}</p>
              <p><span className="font-medium text-rose-500">{t("hoursSunday")}</span> — {t("hoursSundayClosed")}</p>
            </div>
            <p className="mt-4 text-sm text-cyan-600 dark:text-cyan-300 font-medium">{t("responseTime")}</p>
          </article>

          <article className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-500">
              <MapPin className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">{t("locationTitle")}</h2>
            <p className="mt-2 text-[var(--text-secondary)]">{t("locationText")}</p>
            <p className="mt-2 font-medium text-[var(--text-primary)]">Kigali, Rwanda</p>
          </article>

          <article className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-xl">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-500">
              <Mail className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">{t("socialTitle")}</h2>
            <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
              <p>WhatsApp: <span className="font-medium text-[var(--text-primary)]">+250 787 769 046</span></p>
            </div>
          </article>

        </div>

      </section>
    </main>
  );
}
