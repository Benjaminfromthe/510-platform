"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Calendar, Sparkles, Truck, MonitorSmartphone, Sofa, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useToast } from "../components/ToastProvider";

const statItems = [
  "500+ Cleanings Done",
  "4.9 Star Rating",
  "2hr Response Time",
  "Kigali Wide Coverage",
];

const serviceIcons = {
  electronics: MonitorSmartphone,
  furniture: Sofa,
  deep: ShieldCheck,
};

const steps = [
  { icon: Sparkles, title: "Choose your service", description: "Pick the right cleaning package for your space and routine." },
  { icon: Calendar, title: "Pick your date", description: "Use the smart calendar to lock in the best available day and time." },
  { icon: Truck, title: "We come to you", description: "Our team arrives on time with premium equipment and zero fuss." },
];

const testimonials = [
  { name: "Aline, Kacyiru", quote: "The booking flow feels modern and the team arrived exactly on time. It feels like a real tech product." },
  { name: "Eric, Nyarutarama", quote: "Fast response, polished communication, and the cleanest apartment I’ve had in months." },
  { name: "Mireille, Kimihurura", quote: "The premium experience is obvious from the first click. Truly a startup-level service." },
];

export default function HomePage() {
  const t = useTranslations();
  const { showToast } = useToast();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-up");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className={`sticky top-0 z-30 border-b border-slate-800/70 transition-all duration-300 ${scrolled ? "bg-slate-950/85 shadow-2xl shadow-black/30 backdrop-blur-xl" : "bg-slate-950/60 backdrop-blur-md"}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white">510</Link>
          <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
            <Link href="/services" className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-cyan-400 hover:text-white">{t("nav.services")}</Link>
            <Link href="/book" className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-cyan-400 hover:text-white">{t("nav.bookNow")}</Link>
            <Link href="/dashboard" className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-cyan-400 hover:text-white">{t("nav.myBookings")}</Link>
            <Link href="/subscriptions" className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-cyan-400 hover:text-white">Subscriptions</Link>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-full border border-slate-700 px-4 py-2 font-semibold text-slate-100 hover:border-cyan-400 hover:text-white">{t("nav.signIn")}</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300">{t("nav.createAccount")}</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_25%),radial-gradient(circle_at_bottom,_rgba(139,92,246,0.13),_transparent_22%),linear-gradient(120deg,#020617_0%,#111827_45%,#1f2937_100%)] animate-gradient" />
        <div className="absolute inset-0 overflow-hidden opacity-70">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} className="animate-float absolute rounded-full bg-cyan-400/20 blur-xl" style={{ left: `${8 + (index * 7) % 84}%`, top: `${10 + (index * 5) % 70}%`, width: `${18 + (index % 4) * 6}px`, height: `${18 + (index % 4) * 6}px` }} />
          ))}
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-7xl flex-col justify-center gap-10 px-4 py-16 sm:px-6 lg:px-8 relative z-10">
          <div data-reveal className="max-w-4xl space-y-6 rounded-3xl border border-white/8 bg-slate-900/45 p-8 shadow-2xl shadow-cyan-500/5 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Premium 2026 cleaning startup</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">{t("home.headline")}</h1>
            <p className="max-w-2xl text-lg text-slate-300">{t("home.subtext")}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/book" onClick={() => showToast("Booking assistant ready — choose a service to begin.", "success")} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/20 transition hover:-translate-y-0.5 hover:bg-cyan-300">Book a quote</Link>
              <Link href="/subscriptions" onClick={() => showToast("Subscription plans opened — compare flexible cleaning packages.", "info")} className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:text-white">Explore subscriptions</Link>
            </div>
          </div>

          <div data-reveal className="grid gap-4 rounded-3xl border border-white/8 bg-slate-900/60 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl md:grid-cols-4">
            {statItems.map((item) => (
              <article key={item} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-center text-sm text-slate-200 shadow-inner shadow-black/20">{item}</article>
            ))}
          </div>

          <div data-reveal className="grid gap-6 md:grid-cols-3">
            {[
              { title: t("home.electronicsTitle"), description: t("home.electronicsDescription"), href: "/book", icon: serviceIcons.electronics },
              { title: t("home.furnitureTitle"), description: t("home.furnitureDescription"), href: "/book", icon: serviceIcons.furniture },
              { title: t("home.deepTitle"), description: t("home.deepDescription"), href: "/book", icon: serviceIcons.deep },
            ].map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.title} className="group rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/80 hover:bg-slate-900 hover:shadow-cyan-500/10">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">{t("home.serviceLabel")}</p>
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-100"><Icon className="h-4 w-4" /></div>
                  </div>
                  {service.title === t("home.furnitureTitle") ? <span className="mt-3 inline-flex w-fit rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200">Most Popular</span> : null}
                  <h2 className="mt-3 text-xl font-semibold text-white">{service.title}</h2>
                  <p className="mt-2 text-sm text-slate-300">{service.description}</p>
                  <span className="mt-4 inline-flex w-fit rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">{t("home.quoteBadge")}</span>
                  <Link href={service.href} onClick={() => showToast("Booking flow opened — pick a service to continue.", "info")} className="mt-5 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300">{t("home.requestQuote")}</Link>
                </article>
              );
            })}
          </div>

          <section data-reveal className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:px-8 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">How it works</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">A premium booking flow in three simple moves</h2>
              <div className="mt-6 space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-cyan-400/40 hover:bg-slate-900">
                      <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-100"><Icon className="h-5 w-5" /></div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Step {index + 1}</p>
                        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                        <p className="mt-1 text-sm text-slate-300">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Customer love</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">What Kigali customers are saying</h2>
              <div className="mt-6 space-y-4">
                {testimonials.map((item) => (
                  <blockquote key={item.name} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200 shadow-inner shadow-black/20">“{item.quote}”<footer className="mt-3 text-xs uppercase tracking-[0.3em] text-cyan-200">— {item.name}</footer></blockquote>
                ))}
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
