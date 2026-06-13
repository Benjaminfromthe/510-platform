"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useToast } from "../../components/ToastProvider";

const plans = [
  {
    accent: "border-cyan-400/40 bg-cyan-400/10",
    key: "WEEKLY",
    nameKey: "subscriptions.plan1Name",
    badgeKey: "subscriptions.plan1Badge",
    featureKeys: ["subscriptions.plan1Feature1", "subscriptions.plan1Feature2"],
    whatsappMessage: "Hello 510! I am interested in the Weekly Cleaning Plan. Please send me pricing details.",
  },
  {
    accent: "border-emerald-400/40 bg-emerald-400/10",
    key: "MONTHLY",
    nameKey: "subscriptions.plan2Name",
    badgeKey: "subscriptions.plan2Badge",
    featureKeys: ["subscriptions.plan2Feature1", "subscriptions.plan2Feature2", "subscriptions.plan2Feature3"],
    whatsappMessage: "Hello 510! I am interested in the Monthly Package. Please send me pricing details.",
  },
  {
    accent: "border-violet-400/40 bg-violet-400/10",
    key: "PREMIUM",
    nameKey: "subscriptions.plan3Name",
    badgeKey: "subscriptions.plan3Badge",
    featureKeys: ["subscriptions.plan3Feature1", "subscriptions.plan3Feature2", "subscriptions.plan3Feature3"],
    whatsappMessage: "Hello 510! I am interested in the Premium Monthly Plan. Please send me pricing details.",
  },
];

export default function SubscriptionsPage() {
  const t = useTranslations();
  const { showToast } = useToast();

  function requestPricing(plan: (typeof plans)[number]) {
    showToast(t("subscriptions.toastMessage"), "info");
    window.setTimeout(() => {
      const url = `https://wa.me/250787769046?text=${encodeURIComponent(plan.whatsappMessage)}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("subscriptions.eyebrow")}</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">{t("subscriptions.title")}</h1>
          <p className="max-w-2xl text-slate-300">{t("subscriptions.subtitle")}</p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.key} className={`rounded-3xl border p-6 shadow-2xl shadow-black/20 transition hover:-translate-y-1 ${plan.accent}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-100">{t(plan.badgeKey)}</p>
                <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-200">{t("subscriptions.recurring")}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white">{t(plan.nameKey)}</h2>
              <p className="mt-2 text-sm text-slate-200">{t("subscriptions.pricingOnRequest")}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-100">
                {plan.featureKeys.map((featureKey) => <li key={featureKey}>• {t(featureKey)}</li>)}
              </ul>
              <button
                type="button"
                onClick={() => requestPricing(plan)}
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
              >
                {t("subscriptions.requestPricing")}
              </button>
            </article>
          ))}
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
          <div className="mb-4 space-y-1">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("subscriptions.compareTitle")}</p>
            <h2 className="text-2xl font-semibold text-white">{t("subscriptions.compareSubtitle")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm text-slate-200">
              <thead>
                <tr className="border-b border-slate-800 text-slate-300">
                  <th className="px-3 py-3">{t("subscriptions.compareFeature")}</th>
                  <th className="px-3 py-3">{t("subscriptions.plan1Name")}</th>
                  <th className="px-3 py-3">{t("subscriptions.plan2Name")}</th>
                  <th className="px-3 py-3">{t("subscriptions.plan3Name")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800/80"><td className="px-3 py-3">{t("subscriptions.compareCleanings")}</td><td className="px-3 py-3">1 / {t("subscriptions.periodWeek")}</td><td className="px-3 py-3">4 / {t("subscriptions.periodMonth")}</td><td className="px-3 py-3">8 / {t("subscriptions.periodMonth")}</td></tr>
                <tr className="border-b border-slate-800/80"><td className="px-3 py-3">{t("subscriptions.compareResponse")}</td><td className="px-3 py-3">24h</td><td className="px-3 py-3">12h</td><td className="px-3 py-3">6h</td></tr>
                <tr className="border-b border-slate-800/80"><td className="px-3 py-3">{t("subscriptions.comparePriority")}</td><td className="px-3 py-3">✓</td><td className="px-3 py-3">✓</td><td className="px-3 py-3">✓</td></tr>
                <tr><td className="px-3 py-3">{t("subscriptions.compareDedicated")}</td><td className="px-3 py-3">✗</td><td className="px-3 py-3">✗</td><td className="px-3 py-3">✓</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <Link href="https://wa.me/250787769046?text=Hello%20510%20Cleaning%20Services!%20I%20would%20like%20pricing%20for%20your%20subscription%20plans." target="_blank" rel="noreferrer" className="inline-flex w-fit rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 hover:border-cyan-300 hover:bg-cyan-400/20">{t("subscriptions.contactUs")}</Link>
        <Link href="/dashboard" className="inline-flex w-fit rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400 hover:text-white">{t("subscriptions.backToDashboard")}</Link>
      </section>
    </main>
  );
}
