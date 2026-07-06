"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

const plans = [
  {
    key: "WEEKLY",
    badgeKey: "subscriptions.plan1Badge",
    nameKey: "subscriptions.plan1Name",
    priceKey: "subscriptions.plan1Price",
    price: "500",
    currency: "RWF",
    devices: 2,
    cleansLabel: "1 CLEAN A WEEK",
    promoLabel: "ONLINE PROMO",
    featureKeys: [
      "subscriptions.plan1Feature1",
      "subscriptions.plan1Feature2",
      "subscriptions.plan1Feature3",
    ],
    ctaKey: "subscriptions.plan1Cta",
    accent: "border-emerald-500/60",
    priceColor: "text-emerald-400",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    waMsg: "Hello 510! I want the Weekly Plan (500 RWF, 1 clean/week, 2 devices).",
    star: false,
  },
  {
    key: "MONTHLY",
    badgeKey: "subscriptions.plan2Badge",
    nameKey: "subscriptions.plan2Name",
    priceKey: "subscriptions.plan2Price",
    price: "2,000",
    currency: "RWF",
    devices: 2,
    cleansLabel: "4 CLEANS A MONTH",
    promoLabel: "ONLINE PROMO",
    featureKeys: [
      "subscriptions.plan2Feature1",
      "subscriptions.plan2Feature2",
      "subscriptions.plan2Feature3",
      "subscriptions.plan2Feature4",
    ],
    ctaKey: "subscriptions.plan2Cta",
    accent: "border-cyan-500/60",
    priceColor: "text-cyan-400",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    waMsg: "Hello 510! I want the Monthly Plan (2,000 RWF, 4 cleans/month, 2 devices).",
    star: false,
  },
  {
    key: "PREMIUM",
    badgeKey: "subscriptions.plan3Badge",
    nameKey: "subscriptions.plan3Name",
    priceKey: "subscriptions.plan3Price",
    price: "4,000",
    currency: "RWF",
    devices: 2,
    cleansLabel: "8 CLEANS A MONTH",
    promoLabel: "BEST VALUE",
    featureKeys: [
      "subscriptions.plan3Feature1",
      "subscriptions.plan3Feature2",
      "subscriptions.plan3Feature3",
      "subscriptions.plan3Feature4",
    ],
    ctaKey: "subscriptions.plan3Cta",
    accent: "border-yellow-500/60",
    priceColor: "text-yellow-400",
    badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    waMsg: "Hello 510! I want the Premium Monthly Plan (4,000 RWF, 8 cleans/month, 2 devices).",
    star: true,
  },
];

const faqs = [
  { qKey: "subscriptions.faq1Question", aKey: "subscriptions.faq1Answer" },
  { qKey: "subscriptions.faq2Question", aKey: "subscriptions.faq2Answer" },
  { qKey: "subscriptions.faq3Question", aKey: "subscriptions.faq3Answer" },
];

export default function SubscriptionsPage() {
  const t = useTranslations();

  function bookPlan(plan: typeof plans[0]) {
    const url = `https://wa.me/250787769046?text=${encodeURIComponent(plan.waMsg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen text-[var(--text-primary)]">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">

        {/* Header */}
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">{t("subscriptions.eyebrow")}</p>
          <h1 className="text-4xl font-black text-white sm:text-5xl">{t("subscriptions.title")}</h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">{t("subscriptions.subtitle")}</p>
        </header>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.key}
              className={`relative rounded-2xl border-2 ${plan.accent} bg-[var(--bg-card)] p-6 flex flex-col gap-4 transition hover:-translate-y-1`}
            >
              {/* Star badge for premium */}
              {plan.star && (
                <span className="absolute -top-4 -right-2 text-3xl">⭐</span>
              )}

              {/* Badge */}
              <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${plan.badgeColor}`}>
                {t(plan.badgeKey)}
              </span>

              {/* Plan name */}
              <h2 className="text-xl font-black text-white">{t(plan.nameKey)}</h2>

              {/* Price — BIG and prominent */}
              <div className="space-y-0.5">
                <p className={`text-5xl font-black ${plan.priceColor}`}>
                  {plan.price} <span className="text-2xl font-bold text-white/70">RWF</span>
                </p>
                <p className="text-sm font-semibold text-white/60">{plan.devices} DEVICES</p>
              </div>

              {/* Device icons */}
              <div className="flex gap-3 text-2xl">
                <span>📱</span>
                <span>💻</span>
              </div>

              {/* Cleans label */}
              <p className="text-sm font-bold uppercase tracking-widest text-white/80">{plan.cleansLabel}</p>
              <p className={`text-xs font-bold uppercase tracking-widest ${plan.priceColor}`}>{plan.promoLabel}</p>

              {/* Features */}
              <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                {plan.featureKeys.map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${plan.priceColor.replace("text-", "bg-")}`} />
                    {t(key)}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                type="button"
                onClick={() => bookPlan(plan)}
                className="mt-auto w-full rounded-xl bg-cyan-400 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 transition"
              >
                {t(plan.ctaKey)}
              </button>
            </article>
          ))}
        </div>

        {/* MoMo payment note */}
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
          <p className="font-semibold text-yellow-300">💛 Pay via MoMo · Code: <strong>2142036</strong> · Name: Benjamin · MTN Rwanda</p>
        </div>

        {/* FAQ */}
        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">{t("subscriptions.faqTitle")}</p>
            <h2 className="mt-1 text-2xl font-bold text-white">{t("subscriptions.faqSubtitle")}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {faqs.map((faq) => (
              <article key={faq.qKey} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
                <h3 className="font-semibold text-white">{t(faq.qKey)}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{t(faq.aKey)}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/book" className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition">
            Book a Single Clean
          </Link>
          <Link href="/dashboard" className="rounded-full border border-[var(--border-color)] px-6 py-3 text-sm text-[var(--text-secondary)] hover:border-cyan-400 hover:text-white transition">
            {t("subscriptions.backToDashboard")}
          </Link>
        </div>

      </section>
    </main>
  );
}
