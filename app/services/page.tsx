"use client";

import { Monitor, Sofa, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type ServiceCategory = "ELECTRONICS" | "FURNITURE" | "OTHER";

type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: ServiceCategory;
  imageUrl: string;
};

const tabs = ["All", "ELECTRONICS", "FURNITURE", "OTHER"] as const;

function categoryLabel(category: ServiceCategory) {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

function serviceIcon(category: ServiceCategory) {
  if (category === "ELECTRONICS") return Monitor;
  if (category === "FURNITURE") return Sofa;
  return Sparkles;
}

export default function ServicesPage() {
  const t = useTranslations();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");

  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
      setLoading(true);

      try {
        const response = await fetch("/api/services", { cache: "force-cache" });

        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }

        const data = await response.json();

        if (isMounted) {
          setServices(Array.isArray(data.services) ? data.services : []);
        }
      } catch (error) {
        console.error("Error loading services", error);

        if (isMounted) {
          setServices([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredServices = useMemo(() => {
    if (activeTab === "All") {
      return services;
    }

    return services.filter((service) => service.category === activeTab);
  }, [activeTab, services]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("servicesPage.eyebrow")}</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">{t("servicesPage.title")}</h1>
          <p className="max-w-2xl text-slate-300">{t("servicesPage.subtitle")}</p>
        </header>

        <nav className="flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const isActive = tab === activeTab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-100"
                    : "border-slate-700 bg-slate-900 text-slate-300 hover:border-cyan-400/70 hover:text-white"
                }`}
              >
                {tab === "All" ? t("servicesPage.all") : categoryLabel(tab as ServiceCategory)}
              </button>
            );
          })}
        </nav>

        {loading ? (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <article
                key={`skeleton-${index}`}
                className="animate-pulse rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/20"
              >
                <div className="h-40 rounded-2xl bg-slate-800" />
                <div className="mt-4 h-5 w-2/3 rounded bg-slate-800" />
                <div className="mt-3 h-4 w-full rounded bg-slate-800" />
                <div className="mt-2 h-4 w-5/6 rounded bg-slate-800" />
                <div className="mt-4 h-10 rounded-xl bg-slate-800" />
              </article>
            ))}
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.length === 0 ? (
              <article className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-slate-300 md:col-span-2 xl:col-span-3">
                {t("ui.noServicesAvailable") || "No services are available in this category yet."}
              </article>
            ) : (
              filteredServices.map((service) => (
                <article
                  key={service.id}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/20"
                >
                  <div className="flex h-44 items-center justify-center border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
                    {(() => {
                      const Icon = serviceIcon(service.category);
                      return <Icon className="h-12 w-12 text-cyan-200" />;
                    })()}
                  </div>
                  <div className="flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{categoryLabel(service.category)}</p>
                        <h2 className="mt-1 text-xl font-semibold text-white">{service.name}</h2>
                      </div>
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">{t("ui.getQuote")}</span>
                    </div>

                    <p className="text-sm text-slate-300">{service.description}</p>

                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{t("servicesPage.durationLabel")}: {service.duration} min</span>
                      <span>{t("servicesPage.categoryLabel")}: {categoryLabel(service.category)}</span>
                    </div>

                    <a
                      href={`/book?serviceId=${service.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      {t("nav.bookNow")}
                    </a>
                  </div>
                </article>
              ))
            )}
          </section>
        )}
      </section>
    </main>
  );
}
