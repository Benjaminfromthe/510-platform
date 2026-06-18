"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarCheck2, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import BookingDetailsModal, { type BookingRecord } from "./BookingDetailsModal";

type ServiceRecord = {
  id: number;
  name: string;
};

function statusClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-200 border-emerald-500/30";
    case "CONFIRMED":
    case "IN_PROGRESS":
      return "bg-cyan-500/10 text-cyan-100 border-cyan-500/30";
    case "PENDING":
    case "PENDING_QUOTE":
      return "bg-amber-500/10 text-amber-100 border-amber-500/30";
    case "CANCELLED":
      return "bg-rose-500/10 text-rose-100 border-rose-500/30";
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
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "subscription">("bookings");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [busyBookingId, setBusyBookingId] = useState<number | null>(null);
  const [busySubscription, setBusySubscription] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const bookingsResponse = await fetch("/api/bookings", {
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
      let subscriptionData = {};
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
  }, [t]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.replace("/sign-in");
      return;
    }

    void loadDashboardData();
  }, [isLoaded, userId, router, loadDashboardData]);

  const serviceMap = useMemo(() => {
    return new Map(services.map((service) => [service.id, service.name]));
  }, [services]);

  const stats = useMemo(() => {
    const now = new Date();

    return {
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === "PENDING" || booking.status === "PENDING_QUOTE").length,
      completed: bookings.filter((booking) => booking.status === "COMPLETED").length,
    };
  }, [bookings]);

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
      alert(error instanceof Error ? error.message : "Unable to update subscription");
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
      alert(error instanceof Error ? error.message : "Unable to cancel booking");
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
            <article key={item.label} className="bg-slate-900/60 border border-gray-800/80 rounded-xl p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-2xl shadow-black/20">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t("manageTitle")}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{t("manageText")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setActiveTab("bookings")} className={`rounded-full px-4 py-2 text-sm ${activeTab === "bookings" ? "font-semibold bg-cyan-400 text-slate-950" : "font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"}`}>{t("tabBookings")}</button>
            <button type="button" onClick={() => setActiveTab("subscription")} className={`rounded-full px-4 py-2 text-sm ${activeTab === "subscription" ? "font-semibold bg-cyan-400 text-slate-950" : "font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"}`}>{t("tabSubscription")}</button>
          </div>
        </div>

        {activeTab === "subscription" ? (
          <section className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">My Subscription</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{subscription ? subscription.plan.replace("_", " ") : "No active subscription"}</h2>
                <p className="text-sm text-[var(--text-secondary)]">Track your plan status, next cleaning date, and remaining cleanings here.</p>
              </div>
              <Link href="/subscriptions" className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">View Plans</Link>
            </div>

            {!subscription ? (
              <div className="mt-6 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-primary)]/80 p-5 text-[var(--text-secondary)]">You do not have an active subscription yet. Choose a plan to get started.</div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4"><p className="text-sm text-[var(--text-secondary)]">Plan</p><p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{subscription.plan}</p></article>
                <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4"><p className="text-sm text-[var(--text-secondary)]">Next cleaning</p><p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{formatDate(subscription.nextCleaningDate)}</p></article>
                <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4"><p className="text-sm text-[var(--text-secondary)]">Cleanings remaining</p><p className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{Math.max(0, subscription.totalCleanings - subscription.cleaningsUsed)}</p></article>
              </div>
            )}

            {subscription && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => void handleSubscriptionStatus("PAUSED")} disabled={busySubscription || subscription.status === "PAUSED"} className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 disabled:cursor-not-allowed disabled:opacity-50">{subscription.status === "PAUSED" ? "Paused" : "Pause Subscription"}</button>
                <button type="button" onClick={() => void handleSubscriptionStatus("CANCELLED")} disabled={busySubscription || subscription.status === "CANCELLED"} className="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100 disabled:cursor-not-allowed disabled:opacity-50">{subscription.status === "CANCELLED" ? "Cancelled" : "Cancel Subscription"}</button>
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
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-100"><CalendarCheck2 className="h-7 w-7" /></div>
                <h3 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">{t("emptyTitle")}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("emptyText")}</p>
                <Link href="/services" className="mt-5 inline-flex rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950">{t("emptyAction")}</Link>
              </section>
            ) : (
              <>
                <div className="hidden overflow-x-auto rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl shadow-black/20 lg:block">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-[var(--text-secondary)]">
                <thead className="bg-[var(--bg-primary)]/80 text-[var(--text-secondary)]">
                  <tr>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-[var(--bg-secondary)]/50">
                      <td className="px-4 py-4 text-[var(--text-primary)]">{serviceMap.get(booking.serviceId) || `Service ${booking.serviceId}`}</td>
                      <td className="px-4 py-4">{formatDate(booking.scheduledDate)}</td>
                      <td className="px-4 py-4">{formatTime(booking.scheduledTime)}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${statusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">{booking.totalPrice.toLocaleString("en-US")} RWF</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            className="rounded-full border border-[var(--border-color)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-cyan-400 hover:text-[var(--text-primary)]"
                          >
                            {t("viewDetails")}
                          </button>
                          {booking.status === "COMPLETED" && (
                            <Link href="/services" className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/20">{t("bookAgain")}</Link>
                          )}
                          {booking.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => void handleCancel(booking.id)}
                              disabled={busyBookingId === booking.id}
                              className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
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

                <div className="grid gap-4 lg:hidden">
                  {bookings.map((booking) => (
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
                      <p className="mt-3 text-sm text-[var(--text-secondary)]">{booking.totalPrice.toLocaleString("en-US")} RWF</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(booking)}
                          className="rounded-full border border-[var(--border-color)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:border-cyan-400 hover:text-[var(--text-primary)]"
                        >
                          {t("viewDetails")}
                        </button>
                        {booking.status === "COMPLETED" && (
                          <Link href="/services" className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-400/20">{t("bookAgain")}</Link>
                        )}
                        {booking.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => void handleCancel(booking.id)}
                            disabled={busyBookingId === booking.id}
                            className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {busyBookingId === booking.id ? t("cancelling") : t("cancel")}
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
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
