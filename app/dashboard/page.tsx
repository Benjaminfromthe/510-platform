"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarCheck2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import BookingDetailsModal, { type BookingRecord } from "./BookingDetailsModal";
import { useToast } from "../../components/ToastProvider";

type ServiceRecord = {
  id: number;
  name: string;
};

function statusClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 border-emerald-500/30";
    case "CONFIRMED":
    case "IN_PROGRESS":
      return "bg-cyan-500/10 text-cyan-700 dark:text-cyan-100 border-cyan-500/30";
    case "PENDING":
    case "PENDING_QUOTE":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-100 border-amber-500/30";
    case "CANCELLED":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-100 border-rose-500/30";
    default:
      return "bg-slate-500/10 text-[var(--text-primary)] border-slate-500/30";
  }
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const { user } = useUser();
  const { userId, isLoaded } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "subscription">("bookings");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [busyBookingId, setBusyBookingId] = useState<number | null>(null);
  const [busySubscription, setBusySubscription] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      // Pass user's primary email as query param — server uses it to find bookings
      // even when Clerk's server-side auth() can't resolve the userId
      const primaryEmail = user?.primaryEmailAddress?.emailAddress ?? "";
      const emailParam = primaryEmail ? `?email=${encodeURIComponent(primaryEmail)}` : "";

      const bookingsResponse = await fetch(`/api/bookings${emailParam}`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      });

      let bookingsData = { bookings: [] };
      if (bookingsResponse.ok) {
        bookingsData = await bookingsResponse.json().catch(() => ({ bookings: [] }));
      } else {
        const errorData = await bookingsResponse.json().catch(() => ({}));
        console.error("Bookings fetch error:", errorData);
      }

      const servicesResponse = await fetch("/api/services", { cache: "no-store" });
      let servicesData = { services: [] };
      if (servicesResponse.ok) {
        servicesData = await servicesResponse.json().catch(() => ({ services: [] }));
      }

      const subscriptionResponse = await fetch("/api/subscriptions", { cache: "no-store" });
      let subscriptionData: { subscription?: unknown } = {};
      if (subscriptionResponse.ok) {
        subscriptionData = await subscriptionResponse.json().catch(() => ({}));
      }

      setBookings(Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []);
      setServices(Array.isArray(servicesData.services) ? servicesData.services : []);
      setSubscription(subscriptionResponse.ok && subscriptionData?.subscription ? subscriptionData.subscription : null);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Always show empty state, never show error to customer
      setBookings([]);
      setServices([]);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [t, user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.replace("/sign-in");
      return;
    }
    void loadDashboardData();
  }, [isLoaded, userId, router, loadDashboardData, user?.primaryEmailAddress?.emailAddress]);

  const serviceMap = useMemo(() => {
    return new Map(services.map((service) => [service.id, service.name]));
  }, [services]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === "PENDING" || booking.status === "PENDING_QUOTE").length,
      completed: bookings.filter((booking) => booking.status === "COMPLETED").length,
    };
  }, [bookings]);

  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== "COMPLETED" && b.status !== "CANCELLED"),
    [bookings]
  );

  const historyBookings = useMemo(
    () => bookings.filter((b) => b.status === "COMPLETED" || b.status === "CANCELLED"),
    [bookings]
  );

  // Auto-refresh every 30 s while any booking is still active so the tracker stays live
  useEffect(() => {
    const hasActive = bookings.some(
      (b) => b.status === "PENDING" || b.status === "PENDING_QUOTE" || b.status === "CONFIRMED" || b.status === "IN_PROGRESS"
    );
    if (!hasActive) return;
    const interval = setInterval(() => void loadDashboardData(), 30_000);
    return () => clearInterval(interval);
  }, [bookings, loadDashboardData]);

  const handleSubscriptionStatus = async (status: "PAUSED" | "CANCELLED") => {
    try {
      setBusySubscription(true);
      const response = await fetch("/api/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update subscription");
      await loadDashboardData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to update subscription", "error");
    } finally {
      setBusySubscription(false);
    }
  };

  const handleCancel = async (bookingId: number) => {
    try {
      setBusyBookingId(bookingId);
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to cancel booking");

      await loadDashboardData();
    } catch (error) {
      console.error("Cancel booking failed", error);
      showToast(error instanceof Error ? error.message : "Unable to cancel booking", "error");
    } finally {
      setBusyBookingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] pb-20">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("eyebrow")}</p>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">{t("welcome", { name: user?.firstName || t("guest") })} 👋</h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">{t("subtitle")}</p>
        </header>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            { label: t("statTotal"), value: stats.total },
            { label: t("statPending"), value: stats.pending },
            { label: t("statCompleted"), value: stats.completed },
          ].map((item) => (
            <article key={item.label} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-lg">
              <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">{item.value}</p>
            </article>
          ))}
        </div>

        {/* ── Loyalty Stamp Card ── */}
        {(() => {
          const totalCompleted = stats.completed;
          const progress = totalCompleted % 5;          // 0–4 stamps on current card
          const freeCleansEarned = Math.floor(totalCompleted / 5);
          const isReady = progress === 0 && totalCompleted > 0; // just hit a multiple of 5
          const remaining = 5 - progress;

          return (
            <article className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl shadow-black/20">
              {/* Glow when free clean earned */}
              {isReady && (
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/10 via-transparent to-yellow-400/10 animate-pulse" />
              )}

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">🧹 510</p>
                  <h2 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{t("loyaltyTitle")}</h2>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{t("loyaltySubtitle")}</p>
                </div>
                {freeCleansEarned > 0 && (
                  <span className="rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 text-xs font-semibold text-cyan-400">
                    {t("loyaltyFreeCount", { count: freeCleansEarned })}
                  </span>
                )}
              </div>

              {/* Stamp circles */}
              <div className="mt-5">
                <div className="flex items-center justify-between gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => {
                    const filled = isReady ? true : i <= progress;
                    return (
                      <div
                        key={i}
                        className={`flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 text-base sm:text-lg font-bold transition-all duration-300 ${
                          filled
                            ? "border-cyan-400 bg-cyan-400/20 text-cyan-400 scale-110 shadow-lg shadow-cyan-400/20"
                            : "border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] opacity-50"
                        }`}
                      >
                        {filled ? "✓" : i}
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar — full width below circles */}
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-700"
                      style={{ width: isReady ? "100%" : `${(progress / 5) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                    {totalCompleted === 0
                      ? t("loyaltyFirstClean")
                      : isReady
                      ? t("loyaltyFree")
                      : t("loyaltyProgress", { current: progress, remaining })}
                  </p>
                </div>
              </div>


              {/* Free clean celebration banner */}
              {isReady && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <p className="text-sm font-semibold text-yellow-400">{t("loyaltyFree")}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{t("loyaltyFreeNote")}</p>
                  </div>
                </div>
              )}
            </article>
          );
        })()}


        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-2xl shadow-black/20">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t("manageTitle")}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{t("manageText")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setActiveTab("bookings")} className={`rounded-full px-4 py-2 text-sm ${activeTab === "bookings" ? "font-semibold bg-cyan-400 text-slate-950" : "font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"}`}>{t("tabBookings")}</button>
            <button type="button" onClick={() => setActiveTab("subscription")} className={`rounded-full px-4 py-2 text-sm ${activeTab === "subscription" ? "font-semibold bg-cyan-400 text-slate-950" : "font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"}`}>{t("tabSubscription")}</button>
          </div>
        </div>

        {activeTab === "subscription" ? (
          <section className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("subscriptionTitle")}</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{subscription ? subscription.plan.replace("_", " ") : t("noSubscription").split(".")[0]}</h2>
                <p className="text-sm text-[var(--text-secondary)]">{t("subscriptionSubtext")}</p>
              </div>
              <Link href="/subscriptions" className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">{t("subViewPlans")}</Link>
            </div>

            {!subscription ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]/80 p-5 text-[var(--text-secondary)]">{t("noSubscription")}</div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4"><p className="text-sm text-[var(--text-secondary)]">{t("subPlan")}</p><p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{subscription.plan}</p></article>
                <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4"><p className="text-sm text-[var(--text-secondary)]">{t("subNextCleaning")}</p><p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{formatDate(subscription.nextCleaningDate)}</p></article>
                <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4"><p className="text-sm text-[var(--text-secondary)]">{t("subRemaining")}</p><p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{Math.max(0, subscription.totalCleanings - subscription.cleaningsUsed)}</p></article>
              </div>
            )}

            {subscription && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => void handleSubscriptionStatus("PAUSED")} disabled={busySubscription || subscription.status === "PAUSED"} className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-100 disabled:cursor-not-allowed disabled:opacity-50">{subscription.status === "PAUSED" ? t("subPaused") : t("subPause")}</button>
                <button type="button" onClick={() => void handleSubscriptionStatus("CANCELLED")} disabled={busySubscription || subscription.status === "CANCELLED"} className="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50">{subscription.status === "CANCELLED" ? t("subCancelled") : t("subCancel")}</button>
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "bookings" ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 pr-24 lg:pr-6 shadow-2xl shadow-black/20">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t("heading")}</h2>
                <p className="text-sm text-[var(--text-secondary)]">{t("subtext")}</p>
              </div>
              <div className="flex w-full justify-end lg:w-auto relative">
                <Link href="/services" className="relative z-50 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 w-full lg:w-auto justify-center">{t("bookNew")}</Link>
              </div>
            </div>

            {loading ? (
              <section className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-[var(--text-secondary)] shadow-2xl shadow-black/20">
                <div className="space-y-4">
                  <div className="h-4 w-2/3 rounded bg-[var(--bg-secondary)] animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-[var(--bg-secondary)] animate-pulse" />
                  <div className="h-24 rounded-2xl bg-[var(--bg-secondary)]/80 animate-pulse" />
                </div>
              </section>
            ) : bookings.length === 0 ? (
              <section className="rounded-3xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)]/70 p-8 text-[var(--text-secondary)] shadow-2xl shadow-black/20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-600 dark:text-cyan-100"><CalendarCheck2 className="h-7 w-7" /></div>
                <h3 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">{t("emptyTitle")}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("emptyText")}</p>
                <Link href="/services" className="mt-5 inline-flex rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950">{t("emptyAction")}</Link>
              </section>
            ) : (
              <>
                {/* ── Active bookings table (desktop) ── */}
                {activeBookings.length === 0 ? (
                  <section className="rounded-3xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)]/70 p-8 text-[var(--text-secondary)] shadow-2xl shadow-black/20 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400"><Sparkles className="h-7 w-7" /></div>
                    <h3 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">{t("allCaughtUp")}</h3>
                    <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("allCaughtUpText")}</p>
                    <Link href="/services" className="mt-5 inline-flex rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950">{t("emptyAction")}</Link>
                  </section>
                ) : (
                  <>
                    <div className="hidden overflow-x-auto rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl shadow-black/20 lg:block">
                      <table className="min-w-full divide-y divide-[var(--border-color)] text-left text-sm text-[var(--text-secondary)]">
                        <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                          <tr>
                            <th className="px-4 py-3">{t("colService")}</th>
                            <th className="px-4 py-3">{t("colDate")}</th>
                            <th className="px-4 py-3">{t("colTime")}</th>
                            <th className="px-4 py-3">{t("colStatus")}</th>
                            <th className="px-4 py-3">{t("colPrice")}</th>
                            <th className="px-4 py-3">{t("colActions")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)]">
                          {activeBookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-[var(--bg-secondary)]/50">
                              <td className="px-4 py-4 text-[var(--text-primary)]">{serviceMap.get(booking.serviceId) || `Service ${booking.serviceId}`}</td>
                              <td className="px-4 py-4">{formatDate(booking.scheduledDate)}</td>
                              <td className="px-4 py-4">{formatTime(booking.scheduledTime)}</td>
                              <td className="px-4 py-4">
                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${statusClass(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="px-4 py-4">{booking.totalPrice != null ? booking.totalPrice.toLocaleString("en-US") + " RWF" : t("quotePendingLabel")}</td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-2">
                                  <button type="button" onClick={() => setSelectedBooking(booking)} className="rounded-full border border-[var(--border-color)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-cyan-400 hover:text-[var(--text-primary)]">
                                    {t("viewDetails")}
                                  </button>
                                  {booking.status === "PENDING" && (
                                    <button type="button" onClick={() => void handleCancel(booking.id)} disabled={busyBookingId === booking.id} className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60">
                                      {busyBookingId === booking.id ? t("cancelling") : t("cancel")}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards — active */}
                    <div className="grid gap-4 lg:hidden">
                      {activeBookings.map((booking) => (
                        <article key={booking.id} className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-2xl shadow-black/20">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{serviceMap.get(booking.serviceId) || `Service ${booking.serviceId}`}</p>
                              <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{formatDate(booking.scheduledDate)} · {formatTime(booking.scheduledTime)}</p>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${statusClass(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-[var(--text-secondary)]">{booking.totalPrice != null ? booking.totalPrice.toLocaleString("en-US") + " RWF" : t("quotePendingLabel")}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button type="button" onClick={() => setSelectedBooking(booking)} className="rounded-full border border-[var(--border-color)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-cyan-400">
                              {t("viewDetails")}
                            </button>
                            {booking.status === "PENDING" && (
                              <button type="button" onClick={() => void handleCancel(booking.id)} disabled={busyBookingId === booking.id} className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60">
                                {busyBookingId === booking.id ? t("cancelling") : t("cancel")}
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                )}

                {/* ── History (completed / cancelled) ── */}
                {historyBookings.length > 0 && (
                  <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl shadow-black/20 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setHistoryOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-[var(--bg-secondary)]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{t("bookingHistory")}</span>
                        <span className="rounded-full bg-[var(--bg-secondary)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                          {historyBookings.length}
                        </span>
                      </div>
                      <span className={`text-[var(--text-secondary)] text-sm transition-transform duration-200 ${historyOpen ? "rotate-180" : ""}`}>▼</span>
                    </button>

                    {historyOpen && (
                      <>
                        {/* Desktop history table */}
                        <div className="hidden overflow-x-auto lg:block border-t border-[var(--border-color)]">
                          <table className="min-w-full divide-y divide-[var(--border-color)] text-left text-sm text-[var(--text-secondary)]">
                            <thead className="bg-[var(--bg-secondary)]/60">
                              <tr>
                                <th className="px-4 py-3">{t("colService")}</th>
                                <th className="px-4 py-3">{t("colDate")}</th>
                                <th className="px-4 py-3">{t("colStatus")}</th>
                                <th className="px-4 py-3">{t("colPrice")}</th>
                                <th className="px-4 py-3">{t("colActions")}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                              {historyBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-[var(--bg-secondary)]/30 opacity-80">
                                  <td className="px-4 py-4 text-[var(--text-primary)]">{serviceMap.get(booking.serviceId) || `Service ${booking.serviceId}`}</td>
                                  <td className="px-4 py-4">{formatDate(booking.scheduledDate)}</td>
                                  <td className="px-4 py-4">
                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${statusClass(booking.status)}`}>
                                      {booking.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4">{booking.totalPrice != null ? booking.totalPrice.toLocaleString("en-US") + " RWF" : "—"}</td>
                                  <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-2">
                                      <button type="button" onClick={() => setSelectedBooking(booking)} className="rounded-full border border-[var(--border-color)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-cyan-400">
                                        {t("viewDetails")}
                                      </button>
                                      {booking.status === "COMPLETED" && (
                                        <>
                                          <Link href="/services" className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/20">{t("bookAgain")}</Link>
                                          <Link href="/review" className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 text-xs font-semibold text-yellow-200 hover:bg-yellow-400/20">⭐ Review</Link>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile history cards */}
                        <div className="grid gap-3 p-4 lg:hidden border-t border-[var(--border-color)]">
                          {historyBookings.map((booking) => (
                            <article key={booking.id} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/60 p-4 opacity-80">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{serviceMap.get(booking.serviceId) || `Service ${booking.serviceId}`}</p>
                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${statusClass(booking.status)}`}>
                                  {booking.status}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-[var(--text-secondary)]">{formatDate(booking.scheduledDate)}</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button type="button" onClick={() => setSelectedBooking(booking)} className="rounded-full border border-[var(--border-color)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-cyan-400">
                                  {t("viewDetails")}
                                </button>
                                {booking.status === "COMPLETED" && (
                                  <>
                                    <Link href="/services" className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100">{t("bookAgain")}</Link>
                                    <Link href="/review" className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-2 text-xs font-semibold text-yellow-200">⭐ Review</Link>
                                  </>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        ) : null}
      </section>

      <BookingDetailsModal
        booking={selectedBooking}
        serviceName={selectedBooking ? serviceMap.get(selectedBooking.serviceId) || `Service ${selectedBooking.serviceId}` : "Booking"}
        onClose={() => setSelectedBooking(null)}
      />
    </main>
  );
}
