"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
      return "bg-amber-500/10 text-amber-100 border-amber-500/30";
    case "CANCELLED":
      return "bg-rose-500/10 text-rose-100 border-rose-500/30";
    default:
      return "bg-slate-500/10 text-slate-100 border-slate-500/30";
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
  const { user } = useUser();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [busyBookingId, setBusyBookingId] = useState<number | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const [bookingsResponse, servicesResponse] = await Promise.all([
        fetch("/api/bookings", { cache: "no-store" }),
        fetch("/api/services", { cache: "no-store" }),
      ]);

      const bookingsData = await bookingsResponse.json();
      const servicesData = await servicesResponse.json();

      if (!bookingsResponse.ok) throw new Error(bookingsData.error || "Failed to load bookings");

      setBookings(Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []);
      setServices(Array.isArray(servicesData.services) ? servicesData.services : []);
    } catch (error) {
      console.error("Error loading dashboard data", error);
      setBookings([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const serviceMap = useMemo(() => {
    return new Map(services.map((service) => [service.id, service.name]));
  }, [services]);

  const stats = useMemo(() => {
    const now = new Date();

    return {
      total: bookings.length,
      upcoming: bookings.filter((booking) => booking.status !== "COMPLETED" && booking.status !== "CANCELLED" && new Date(booking.scheduledDate) >= now).length,
      completed: bookings.filter((booking) => booking.status === "COMPLETED").length,
    };
  }, [bookings]);

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

      await loadBookings();
    } catch (error) {
      console.error("Cancel booking failed", error);
      alert(error instanceof Error ? error.message : "Unable to cancel booking");
    } finally {
      setBusyBookingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Customer dashboard</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Welcome back, {user?.firstName || "there"}.</h1>
          <p className="max-w-2xl text-slate-300">Track your bookings, review upcoming cleanings, and manage your upcoming service requests in one place.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Total Bookings", value: stats.total },
            { label: "Upcoming", value: stats.upcoming },
            { label: "Completed", value: stats.completed },
          ].map((item) => (
            <article key={item.label} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/20">
              <p className="text-sm text-slate-300">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/20">
          <div>
            <h2 className="text-xl font-semibold text-white">Your bookings</h2>
            <p className="text-sm text-slate-300">Review the latest status updates and open full booking details.</p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Book New Service
          </Link>
        </div>

        {loading ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-300 shadow-2xl shadow-black/20">Loading your bookings…</section>
        ) : bookings.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-slate-300 shadow-2xl shadow-black/20">
            You do not have any bookings yet. Start with a new service to get going.
          </section>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/20 lg:block">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
                <thead className="bg-slate-950/80 text-slate-300">
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
                    <tr key={booking.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-4 text-white">{serviceMap.get(booking.serviceId) || `Service ${booking.serviceId}`}</td>
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
                            className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 hover:border-cyan-400 hover:text-white"
                          >
                            View Details
                          </button>
                          {booking.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => void handleCancel(booking.id)}
                              disabled={busyBookingId === booking.id}
                              className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {busyBookingId === booking.id ? "Cancelling..." : "Cancel"}
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
                <article key={booking.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{serviceMap.get(booking.serviceId) || `Service ${booking.serviceId}`}</p>
                      <p className="mt-1 text-lg font-semibold text-white">{formatDate(booking.scheduledDate)} · {formatTime(booking.scheduledTime)}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${statusClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{booking.totalPrice.toLocaleString("en-US")} RWF</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(booking)}
                      className="rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 hover:border-cyan-400 hover:text-white"
                    >
                      View Details
                    </button>
                    {booking.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => void handleCancel(booking.id)}
                        disabled={busyBookingId === booking.id}
                        className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyBookingId === booking.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <BookingDetailsModal
        booking={selectedBooking}
        serviceName={selectedBooking ? serviceMap.get(selectedBooking.serviceId) || `Service ${selectedBooking.serviceId}` : "Booking"}
        onClose={() => setSelectedBooking(null)}
      />
    </main>
  );
}
