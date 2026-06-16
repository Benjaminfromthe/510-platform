"use client";

// NO HARDCODED STRINGS - use t('key') always

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Calendar, Menu, Sparkles, Truck, X, Laptop, Smartphone, BedDouble, BadgeCheck, CheckCircle2, Globe, MessageCircleMore, Send, Monitor, Armchair, Sofa, Info } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ServiceIllustration from "../components/ServiceIllustration";
import ThemeToggle from "../components/ThemeToggle";
import { useToast } from "../components/ToastProvider";

const statItems = [
  { value: "6 days", label: "home.statAvailable" },
  { value: "2 hr", label: "home.statResponse" },
  { value: "Kigali", label: "home.statCoverage" },
  { value: "Foam", label: "home.statTechnology" },
];

const serviceIllustrations = {
  electronics: "ELECTRONICS" as const,
  furniture: "FURNITURE" as const,
  deep: "OTHER" as const,
};


export default function HomePage() {
  const t = useTranslations();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dark';
  const { showToast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSafetyTooltip, setShowSafetyTooltip] = useState(false);

  const steps = [
    { icon: Sparkles, title: t("home.processStep1Title"), description: t("home.processStep1Text") },
    { icon: Calendar, title: t("home.processStep2Title"), description: t("home.processStep2Text") },
    { icon: Truck, title: t("home.processStep3Title"), description: t("home.processStep3Text") },
    { icon: BadgeCheck, title: t("home.processStep4Title"), description: t("home.processStep4Text") },
  ];

  const cleanItems = [
    { icon: Monitor, label: t("home.cleanTv") },
    { icon: Laptop, label: t("home.cleanLaptop") },
    { icon: Smartphone, label: t("home.cleanPhone") },
    { icon: Sofa, label: t("home.cleanSofa") },
    { icon: Armchair, label: t("home.cleanChair") },
    { icon: BedDouble, label: t("home.cleanBed") },
  ];

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
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className={`sticky top-0 z-30 border-b border-[var(--border-color)] transition-all duration-300 ${scrolled ? "bg-[var(--bg-primary)]/80 shadow-2xl shadow-cyan-500/10 backdrop-blur-md" : "bg-[var(--bg-primary)]/60 backdrop-blur-md"}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-1.5 text-3xl font-black tracking-tight text-slate-900 dark:text-cyan-300">
            <span>510</span>
            <span className="text-base text-cyan-400/80 dark:text-cyan-300/70">·</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 xl:flex">
              <Link href="/services" className={`nav-link rounded-full border border-transparent px-3 py-2 text-sm text-[var(--text-primary)] hover:border-cyan-400/40 hover:text-cyan-100 ${pathname === "/services" ? "active text-cyan-100" : ""}`}>{t("nav.services")}</Link>
              <Link href="/book" className={`nav-link rounded-full border border-transparent px-3 py-2 text-sm text-[var(--text-primary)] hover:border-cyan-400/40 hover:text-cyan-100 ${pathname === "/book" ? "active text-cyan-100" : ""}`}>{t("nav.bookNow")}</Link>
              <Link href="/dashboard" className={`nav-link rounded-full border border-transparent px-3 py-2 text-sm text-[var(--text-primary)] hover:border-cyan-400/40 hover:text-cyan-100 ${pathname === "/dashboard" ? "active text-cyan-100" : ""}`}>{t("nav.myBookings")}</Link>
              <Link href="/subscriptions" className="rounded-full border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-primary)] hover:border-cyan-400 hover:text-cyan-100">{t("subscriptions.eyebrow")}</Link>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-cyan-400 hover:text-cyan-100">{t("nav.signIn")}</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">{t("nav.createAccount")}</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={
                    isDarkTheme
                      ? {
                          elements: {
                            avatarBox: 'w-8 h-8',
                            userButtonPopoverCard: 'border border-gray-700 bg-gray-900 shadow-xl',
                            userPreviewMainIdentifier: 'text-white',
                            userPreviewSecondaryIdentifier: 'text-gray-400',
                            menuItem: 'text-white hover:bg-gray-800',
                            menuItemButton: 'text-white hover:bg-gray-800',
                            menuItemIcon: 'text-gray-400',
                            dividerLine: 'bg-gray-700',
                          },
                        }
                      : {
                          elements: {
                            avatarBox: 'w-8 h-8',
                            userButtonPopoverCard: 'border border-slate-200 bg-white shadow-xl',
                            userPreviewMainIdentifier: 'text-slate-900',
                            userPreviewSecondaryIdentifier: 'text-slate-500',
                            menuItem: 'text-slate-900 hover:bg-slate-100',
                            menuItemButton: 'text-slate-900 hover:bg-slate-100',
                            menuItemIcon: 'text-slate-400',
                            dividerLine: 'bg-slate-200',
                          },
                        }
                  }
                />
              </SignedIn>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <button type="button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((prev) => !prev)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] xl:hidden">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
        {menuOpen ? (
          <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)]/95 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 text-sm">
              <Link href="/services" onClick={() => setMenuOpen(false)} className="rounded-2xl border border-[var(--border-color)] px-4 py-3 text-[var(--text-primary)]">{t("nav.services")}</Link>
              <Link href="/book" onClick={() => setMenuOpen(false)} className="rounded-2xl border border-[var(--border-color)] px-4 py-3 text-[var(--text-primary)]">{t("nav.bookNow")}</Link>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="rounded-2xl border border-[var(--border-color)] px-4 py-3 text-[var(--text-primary)]">{t("nav.myBookings")}</Link>
              <Link href="/subscriptions" onClick={() => setMenuOpen(false)} className="rounded-2xl border border-[var(--border-color)] px-4 py-3 text-[var(--text-primary)]">{t("subscriptions.eyebrow")}</Link>
              <SignedOut>
                <SignInButton mode="modal">
                  <button onClick={() => setMenuOpen(false)} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-left text-[var(--text-primary)]">{t("nav.signIn")}</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button onClick={() => setMenuOpen(false)} className="rounded-2xl bg-cyan-400 px-4 py-3 text-left font-semibold text-slate-950">{t("nav.createAccount")}</button>
                </SignUpButton>
              </SignedOut>
            </div>
          </div>
        ) : null}
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--hero-bg)] animate-gradient" />
        <div className="hero-grid absolute inset-0 opacity-60" />
        <div className="absolute inset-0 overflow-hidden opacity-70">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} className="animate-float absolute rounded-full bg-cyan-400/20 blur-xl" style={{ left: `${8 + (index * 7) % 84}%`, top: `${10 + (index * 5) % 70}%`, width: `${18 + (index % 4) * 6}px`, height: `${18 + (index % 4) * 6}px` }} />
          ))}
        </div>

        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center gap-10 px-4 py-16 sm:px-6 lg:px-8 relative z-10 section-shell">
          <div data-reveal className="glass-card w-full max-w-4xl space-y-6 rounded-3xl p-6 sm:p-8 lg:p-10">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("home.eyebrow")}</p>
            <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">{t("home.heroTitle")}</h1>
            <p className="max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">{t("home.heroSubtext")}</p>
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="inline-flex items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-100">🧴 {t("home.badgeFoam")}</span>
              <div className="relative inline-flex items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 text-sm text-cyan-100"
                onMouseEnter={() => setShowSafetyTooltip(true)}
                onMouseLeave={() => setShowSafetyTooltip(false)}>
                <span className="flex items-center gap-1">📱 {t("home.badgeSafe")}</span>
                <button
                  type="button"
                  onClick={() => setShowSafetyTooltip(!showSafetyTooltip)}
                  className="ml-1.5 inline-flex cursor-pointer rounded-full hover:bg-cyan-400/20 transition-colors"
                  aria-label="Safety information"
                >
                  <Info size={14} className="text-cyan-200" />
                </button>
                {showSafetyTooltip && (
                  <div className="absolute bottom-full mb-2 w-64 p-2 bg-gray-950 border border-gray-800 text-xs text-gray-200 rounded-md shadow-lg z-50 transition-all">
                    {t("home.badgeSafeTooltip")}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/services" onClick={() => showToast(t("home.toastBook"), "success")} className="w-full sm:w-auto rounded-full bg-cyan-400 px-6 py-3 text-center text-base font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300">{t("home.bookQuote")}</Link>
              <Link href="/subscriptions" onClick={() => showToast(t("home.toastPlans"), "info")} className="w-full sm:w-auto rounded-full border border-white/10 bg-white/5 px-6 py-3 text-center text-base font-semibold text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:border-cyan-400 hover:bg-cyan-400/10">{t("home.explorePlans")}</Link>
            </div>
          </div>

          <div data-reveal className="grid grid-cols-2 gap-4 rounded-3xl border border-white/10 bg-[var(--bg-primary)]/70 p-4 backdrop-blur-xl md:grid-cols-4">
            {statItems.map((item) => (
              <article key={item.label} className="soft-card rounded-2xl p-4 text-center">
                <p className="text-xl font-semibold text-cyan-200">{item.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">{t(item.label)}</p>
              </article>
            ))}
          </div>

          <section data-reveal className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              { title: t("home.electronicsTitle"), description: t("home.electronicsDescription"), href: "/services", illustration: serviceIllustrations.electronics },
              { title: t("home.furnitureTitle"), description: t("home.furnitureDescription"), href: "/services", illustration: serviceIllustrations.furniture },
              { title: t("home.deepTitle"), description: t("home.deepDescription"), href: "/services", illustration: serviceIllustrations.deep },
            ].map((service) => (
              <article key={service.title} className="group soft-card rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-400/5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">{t("home.serviceLabel")}</p>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-100">{t("home.quoteBadge")}</span>
                </div>
                <div className="mt-4 rounded-2xl border border-white/5 bg-[var(--bg-primary)]/80 p-3">
                  <ServiceIllustration category={service.illustration} className="h-28 w-full" />
                </div>
                  {service.title === t("home.furnitureTitle") ? <span className="mt-3 inline-flex w-fit rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200">{t("home.popularBadge")}</span> : null}
                  <h2 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">{service.title}</h2>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{service.description}</p>
                <span className="mt-4 inline-flex w-fit rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">{t("home.quoteBadge")}</span>
                <Link href="/services" onClick={() => showToast(t("home.toastBookingFlow"), "info")} className="mt-5 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300">{t("home.requestQuote")}</Link>
              </article>
            ))}
          </section>

          <section data-reveal className="mx-auto grid w-full max-w-7xl gap-6 px-3 pb-16 sm:px-6 lg:px-8 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)]/85 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("home.whatWeClean")}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{t("home.whatWeCleanTitle")}</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("home.whatWeCleanText")}</p>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                {cleanItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.label} className="soft-card rounded-2xl p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-400/5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-100"><Icon className="h-5 w-5" /></span>
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">{item.label}</h3>
                      </div>
                    </article>
                  );
                })}
              </div>
            </article>

            <article className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)]/85 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("home.ourProcess")}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{t("home.ourProcessTitle")}</h2>
              <div className="mt-6 space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 p-4">
                      <div className="flex items-start gap-4">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-100"><Icon className="h-5 w-5" /></span>
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{t("home.processLabel")}{index + 1}</p>
                          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{step.title}</h3>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-3xl border border-cyan-400/20 bg-[var(--bg-primary)]/90 p-6 shadow-2xl shadow-cyan-500/5 lg:col-span-2">
              <div className="flex flex-wrap items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 text-cyan-300" />
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("home.trustBanner")}</p>
                  <p className="mt-2 text-base text-[var(--text-primary)]">{t("home.trustText")}</p>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)]/85 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl lg:col-span-2">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("home.resultsLabel")}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{t("home.resultsTitle")}</h2>
              <p className="mt-3 max-w-3xl text-sm text-[var(--text-secondary)]">{t("home.resultsText")}</p>
            </article>
            <article className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)]/85 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("home.firstCustomers")}</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">{t("home.firstCustomersHeadline")}</h2>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">{t("home.firstCustomersSubtext")}</p>
              <Link href="/book" className="mt-5 inline-flex rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300">{t("home.bookFirstClean")}</Link>
            </article>
          </section>

          <footer className="mt-6 rounded-3xl border border-white/10 bg-[var(--bg-primary)]/80 p-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("footer.aboutTitle")}</p>
                <h3 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">{t("footer.brandName")}</h3>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">{t("footer.aboutText")}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("footer.servicesTitle")}</p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                  <li>• {t("home.electronicsTitle")}</li>
                  <li>• {t("home.furnitureTitle")}</li>
                  <li>• {t("home.deepTitle")}</li>
                </ul>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("footer.quickLinksTitle")}</p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                  <li><Link href="/book" className="hover:text-cyan-200">{t("nav.bookNow")}</Link></li>
                  <li><Link href="/subscriptions" className="hover:text-cyan-200">{t("footer.plans")}</Link></li>
                  <li><Link href="/dashboard" className="hover:text-cyan-200">{t("nav.myBookings")}</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("footer.contactTitle")}</p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2"><MessageCircleMore className="h-4 w-4 text-cyan-300" />{t("footer.contactWhatsApp")}</li>
                  <li className="flex items-center gap-2"><a href="https://wa.me/250787769046?text=Hello%20510%20Cleaning%20Services!%20I%20would%20like%20to%20book%20a%20cleaning%20service." target="_blank" rel="noreferrer" className="text-cyan-200 underline decoration-cyan-400/40 underline-offset-4 hover:text-cyan-100">{t("ui.whatsappLabel")}</a></li>
                  <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-cyan-300" />{t("footer.contactFacebook")}</li>
                  <li className="flex items-center gap-2"><Send className="h-4 w-4 text-cyan-300" />{t("footer.contactInstagram")}</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">{t("legal.copyright")}</div>
          </footer>
        </div>
      </section>
    </main>
  );
}
