"use client";

import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    name: "Weekly Clean",
    badge: "Most Flexible",
    price: "from $79",
    features: ["1 cleaning per week", "Priority booking"],
    cta: "Start Weekly Plan",
    accent: "border-cyan-400/40 bg-cyan-400/10",
    planKey: "WEEKLY",
  },
  {
    name: "Monthly Package",
    badge: "Most Popular",
    price: "from $249",
    features: ["4 cleanings per month", "10% discount on each clean", "Free assessment visit"],
    cta: "Start Monthly Plan",
    accent: "border-emerald-400/40 bg-emerald-400/10",
    planKey: "MONTHLY",
  },
  {
    name: "Premium Monthly",
    badge: "Best Value",
    price: "from $399",
    features: ["8 cleanings per month", "20% discount", "Dedicated cleaner", "Priority support"],
    cta: "Go Premium",
    accent: "border-violet-400/40 bg-violet-400/10",
    planKey: "PREMIUM",
  },
];

export default function SubscriptionsPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function subscribe(planKey: string) {
    setBusy(planKey);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create subscription");
      setMessage(`${planKey} subscription is ready.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create subscription");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Subscriptions</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Choose a recurring plan that keeps your space spotless</h1>
          <p className="max-w-2xl text-slate-300">Flexible weekly care, savings on monthly packages, and premium service options for busy homes and offices.</p>
        </header>

        {message ? <p className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">{message}</p> : null}

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className={`rounded-3xl border p-6 shadow-2xl shadow-black/20 transition hover:-translate-y-1 ${plan.accent}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-100">{plan.badge}</p>
                <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-200">Recurring</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white">{plan.name}</h2>
              <p className="mt-2 text-sm text-slate-200">{plan.price}</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-100">
                {plan.features.map((feature) => <li key={feature}>• {feature}</li>)}
              </ul>
              <button
                type="button"
                onClick={() => void subscribe(plan.planKey)}
                disabled={busy === plan.planKey}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy === plan.planKey ? "Creating plan..." : plan.cta}
              </button>
            </article>
          ))}
        </div>

        <Link href="/dashboard" className="inline-flex w-fit rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-400 hover:text-white">Back to dashboard</Link>
      </section>
    </main>
  );
}
