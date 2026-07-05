"use client";

// Campus version — static services, no DB dependency
// Only Laptop and Phone cleaning at 500 RWF

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

const CAMPUS_SERVICES = [
  {
    id: 1,
    name: "Laptop & Computer Cleaning",
    description: "Deep foam cleaning for your laptop, keyboard, and screen. Safe for all brands. Results in 30 minutes.",
    price: 500,
    duration: 30,
    emoji: "💻",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    badge: null,
  },
  {
    id: 2,
    name: "Phone & Tablet Cleaning",
    description: "Safe professional foam cleaning for smartphones, tablets, and accessories. Done in 20 minutes.",
    price: 500,
    duration: 20,
    emoji: "📱",
    image: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800&q=80",
    badge: "Most popular",
  },
];

export default function ServicesPage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen text-[var(--text-primary)]">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">

        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-600 dark:text-cyan-300">Services</p>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">What do you need cleaned?</h1>
          <p className="text-[var(--text-secondary)]">500 RWF per device · We come to you on campus</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          {CAMPUS_SERVICES.map((service) => (
            <article
              key={service.id}
              className="overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl transition hover:-translate-y-1 hover:border-cyan-400/50"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.name}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Price badge */}
                <span className="absolute top-3 right-3 rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950">
                  500 RWF
                </span>
                {service.badge && (
                  <span className="absolute top-3 left-3 rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950">
                    {service.badge}
                  </span>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{service.emoji}</span>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{service.name}</h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{service.description}</p>
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>⏱ {service.duration} minutes</span>
                  <span className="font-semibold text-cyan-600 dark:text-cyan-300">500 RWF</span>
                </div>
                <Link
                  href={`/book?serviceId=${service.id}`}
                  className="block w-full rounded-xl bg-cyan-400 py-3 text-center text-sm font-black text-slate-950 hover:bg-cyan-300 transition"
                >
                  Book Now — 500 RWF 🚀
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Trust strip */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            ✓ Safe for all devices &nbsp;·&nbsp; ✓ We come to you &nbsp;·&nbsp; ✓ 500 RWF flat price &nbsp;·&nbsp; ✓ Results guaranteed
          </p>
        </div>

      </section>
    </main>
  );
}
