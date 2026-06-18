"use client";

// NO HARDCODED STRINGS - use t('key') always

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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

// Service image URLs with alt text keys by category
const serviceImages: Record<ServiceCategory, { url: string; altKey: string }> = {
  ELECTRONICS: {
    url: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=800&q=80",
    altKey: "category.electronicsAlt",
  },
  FURNITURE: {
    url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    altKey: "category.furnitureAlt",
  },
  OTHER: {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    altKey: "category.deepCleanAlt",
  },
};

function categoryLabel(category: ServiceCategory, t: ReturnType<typeof useTranslations>) {
  return t(`category.${category.toLowerCase() as Lowercase<ServiceCategory>}`);
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
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("servicesPage.eyebrow")}</p>
          <h1 className="text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">{t("servicesPage.title")}</h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">{t("servicesPage.subtitle")}</p>
        </header>

        <nav className="flex flex-wrap gap-3 mb-12">
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
                    : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-cyan-400/70 hover:text-[var(--text-primary)]"
                }`}
              >
                {tab === "All" ? t("servicesPage.all") : categoryLabel(tab as ServiceCategory, t)}
              </button>
            );
          })}
        </nav>

        {loading ? (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <article
                key={`skeleton-${index}`}
                className="animate-pulse rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-2xl shadow-black/20"
              >
                <div className="h-40 rounded-2xl bg-[var(--bg-secondary)]" />
                <div className="mt-4 h-5 w-2/3 rounded bg-[var(--bg-secondary)]" />
                <div className="mt-3 h-4 w-full rounded bg-[var(--bg-secondary)]" />
                <div className="mt-2 h-4 w-5/6 rounded bg-[var(--bg-secondary)]" />
                <div className="mt-4 h-10 rounded-xl bg-[var(--bg-secondary)]" />
              </article>
            ))}
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.length === 0 ? (
              <article className="rounded-3xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)]/70 p-8 text-[var(--text-secondary)] md:col-span-2 xl:col-span-3">
                {t("ui.noServicesAvailable") || "No services are available in this category yet."}
              </article>
            ) : (
              filteredServices.map((service) => (
                <article
                  key={service.id}
                  className="overflow-hidden rounded-2xl bg-[#0b1329] border border-gray-800/80 shadow-xl transition-all hover:border-gray-700"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-card)] to-[var(--bg-primary)]">
                    <Image
                      src={serviceImages[service.category].url}
                      alt={t(serviceImages[service.category].altKey)}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover"
                      priority={false}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDA"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="flex flex-col gap-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{categoryLabel(service.category, t)}</p>
                        <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{service.name}</h2>
                      </div>
                    </div>

                    <p className="text-sm text-[var(--text-secondary)]">{service.description}</p>

                    <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                      <span>{t("servicesPage.durationLabel")} : {service.duration} {t("common.minutes")}</span>
                      <span>{t("servicesPage.categoryLabel")} : {categoryLabel(service.category, t)}</span>
                    </div>

                    <a
                      href={`/book?serviceId=${service.id}`}
                      className="w-full block rounded-lg bg-cyan-400 py-2.5 text-center text-base font-semibold text-slate-900 shadow-md transition-all hover:bg-cyan-300"
                    >
                      {t("services.bookNow")}
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
