"use client";

import { BadgeCheck, CheckCircle2, Globe, MessageCircleMore, Send } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";


export default function BelowFoldSection() {
  const t = useTranslations();

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-3 pb-16 sm:px-6 lg:px-8 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("home.whatWeClean")}</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{t("home.whatWeCleanTitle")}</h2>
        <p className="mt-2 text-sm text-slate-300">{t("home.whatWeCleanText")}</p>
      </article>

      <article className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("home.ourProcess")}</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{t("home.ourProcessTitle")}</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-300">{t("home.processStep1Text")}</div>
      </article>

      <article className="rounded-3xl border border-cyan-400/20 bg-slate-950/90 p-6 shadow-2xl shadow-cyan-500/5 lg:col-span-2">
        <div className="flex flex-wrap items-start gap-3">
          <CheckCircle2 className="mt-1 h-5 w-5 text-cyan-300" />
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("home.trustBanner")}</p>
            <p className="mt-2 text-base text-slate-100">{t("home.trustText")}</p>
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl lg:col-span-2">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("home.resultsLabel")}</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">{t("home.resultsTitle")}</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-300">{t("home.resultsText")}</p>
      </article>


      <footer className="mt-6 rounded-3xl border border-white/10 bg-slate-950/80 p-6 pb-24 pt-12 shadow-2xl shadow-black/20 lg:col-span-2">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("footer.aboutTitle")}</p>
            <h3 className="mt-3 text-xl font-semibold text-white">{t("footer.brandName")}</h3>
            <p className="mt-3 text-sm text-slate-300">{t("footer.aboutText")}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("footer.servicesTitle")}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• {t("home.electronicsTitle")}</li>
              <li>• {t("home.furnitureTitle")}</li>
              <li>• {t("home.deepTitle")}</li>
            </ul>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("footer.quickLinksTitle")}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li><Link href="/book" className="hover:text-cyan-200">{t("nav.bookNow")}</Link></li>
              <li><Link href="/subscriptions" className="hover:text-cyan-200">{t("footer.plans")}</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-200">{t("nav.myBookings")}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("footer.contactTitle")}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><MessageCircleMore className="h-4 w-4 text-cyan-300" />{t("footer.contactWhatsApp")}</li>
              <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-cyan-300" />{t("footer.contactFacebook")}</li>
              <li className="flex items-center gap-2"><Send className="h-4 w-4 text-cyan-300" />{t("footer.contactInstagram")}</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 border-t border-white/10 pt-4 text-xs uppercase tracking-[0.3em] text-slate-400">{t("legal.copyright")}</div>
      </footer>
    </section>
  );
}
