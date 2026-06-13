"use client";

import { CalendarRange, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

const plans = [
  {
    accent: "border-cyan-400/40 bg-cyan-400/10",
    icon: Sparkles,
    key: "WEEKLY",
    nameKey: "subscriptions.plan1Name",
    badgeKey: "subscriptions.plan1Badge",
    featureKeys: ["subscriptions.plan1Feature1", "subscriptions.plan1Feature2", "subscriptions.plan1Feature3"],
    whatsappMessage: "Hello 510! I am interested in the Weekly Clean plan. Please send me pricing details for this subscription.",
  },
  {
    accent: "border-emerald-400/40 bg-emerald-400/10",
    icon: CalendarRange,
    key: "MONTHLY",
    nameKey: "subscriptions.plan2Name",
    badgeKey: "subscriptions.plan2Badge",
    featureKeys: ["subscriptions.plan2Feature1", "subscriptions.plan2Feature2", "subscriptions.plan2Feature3", "subscriptions.plan2Feature4"],
    whatsappMessage: "Hello 510! I am interested in the Monthly Package. Please send me pricing details for this subscription.",
  },
  {
    accent: "border-violet-400/40 bg-violet-400/10",
    icon: ShieldCheck,
    key: "PREMIUM",
    nameKey: "subscriptions.plan3Name",
    badgeKey: "subscriptions.plan3Badge",
    featureKeys: ["subscriptions.plan3Feature1", "subscriptions.plan3Feature2", "subscriptions.plan3Feature3", "subscriptions.plan3Feature4"],
    whatsappMessage: "Hello 510! I am interested in the Premium Monthly plan. Please send me pricing details for this subscription.",
  },
];

const faqs = [
  { questionKey: "subscriptions.faq1Question", answerKey: "subscriptions.faq1Answer" },
  { questionKey: "subscriptions.faq2Question", answerKey: "subscriptions.faq2Answer" },
  { questionKey: "subscriptions.faq3Question", answerKey: "subscriptions.faq3Answer" },
];

export default function SubscriptionsPage() {
  const t = useTranslations();

  function requestPricing(plan: (typeof plans)[number]) {
    const url = `https://wa.me/250787769046?text=${encodeURIComponent(plan.whatsappMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("subscriptions.eyebrow")}</p>
          <h1 className="text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">{t("subscriptions.title")}</h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">{t("subscriptions.subtitle")}</p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <article key={plan.key} className={`rounded-3xl border p-6 shadow-2xl shadow-black/20 transition hover:-translate-y-1 ${plan.accent}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-cyan-100">{t(plan.badgeKey)}</p>
                    <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{t(plan.nameKey)}</h2>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[var(--bg-primary)]/80 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>

                <p className="mt-3 text-sm text-[var(--text-secondary)]">{t("subscriptions.pricingOnRequest")}</p>

                <ul className="mt-5 space-y-2 text-sm text-[var(--text-primary)]">
                  {plan.featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                      <span>{t(featureKey)}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => requestPricing(plan)}
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  {t("subscriptions.requestPricing")}
                </button>
              </article>
            );
          })}
        </div>

        <section className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)]/80 p-6 shadow-2xl shadow-black/20">
          <div className="mb-4 space-y-1">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("subscriptions.faqTitle")}</p>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{t("subscriptions.faqSubtitle")}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {faqs.map((faq) => (
              <article key={faq.questionKey} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 p-4">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{t(faq.questionKey)}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{t(faq.answerKey)}</p>
              </article>
            ))}
          </div>
        </section>

        <Link href="https://wa.me/250787769046?text=Hello%20510%20Cleaning%20Services!%20I%20would%20like%20pricing%20for%20your%20subscription%20plans." target="_blank" rel="noreferrer" className="inline-flex w-fit rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 hover:border-cyan-300 hover:bg-cyan-400/20">{t("subscriptions.contactUs")}</Link>
        <Link href="/dashboard" className="inline-flex w-fit rounded-full border border-[var(--border-color)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:border-cyan-400 hover:text-[var(--text-primary)]">{t("subscriptions.backToDashboard")}</Link>
      </section>
    </main>
  );
}
