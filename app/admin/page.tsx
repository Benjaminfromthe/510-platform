"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BookingRecord = {
  id: number;
  serviceId: number;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  totalPrice: number;
  quotedPrice?: number | null;
  customerName?: string | null;
  email?: string | null;
  staffId?: number | null;
};

type ServiceRecord = { id: number; name: string };
type StaffRecord = { id: number; userId: number };

function statusTone(status: string) {
  switch (status) {
    case "PENDING":
    case "PENDING_QUOTE":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-100 border-amber-500/30";
    case "CONFIRMED":
    case "IN_PROGRESS":
      return "bg-cyan-500/10 text-cyan-700 dark:text-cyan-100 border-cyan-500/30";
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-100 border-emerald-500/30";
    case "CANCELLED":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-100 border-rose-500/30";
    default:
      return "bg-slate-500/10 text-[var(--text-primary)] border-slate-500/30";
  }
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("en-US")} RWF`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [roleReady, setRoleReady] = useState(false);

  // Force-reload the Clerk user on mount so publicMetadata is always fresh.
  // Without this, a stale JWT can cause the ADMIN role to appear missing
  // right after it's set in the Clerk dashboard.
  useEffect(() => {
    if (!isLoaded || !user) return;
    user.reload().finally(() => setRoleReady(true));
  }, [isLoaded, user]);

  const role = String(user?.publicMetadata?.role || user?.unsafeMetadata?.role || "").toUpperCase();

  useEffect(() => {
    if (!isLoaded || !roleReady) return;
    if (role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isLoaded, roleReady, role, router]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [bookingsResponse, servicesResponse, staffResponse] = await Promise.all([
          fetch("/api/bookings", { cache: "no-store" }),
          fetch("/api/services", { cache: "no-store" }),
          fetch("/api/staff", { cache: "no-store" }),
        ]);

        const bookingsData = await bookingsResponse.json();
        const servicesData = await servicesResponse.json();
        const staffData = await staffResponse.json();

        if (!bookingsResponse.ok) throw new Error(bookingsData.error || "Failed to load bookings");
        if (!servicesResponse.ok) throw new Error(servicesData.error || "Failed to load services");
        if (!staffResponse.ok) throw new Error(staffData.error || "Failed to load staff");

        setBookings(Array.isArray(bookingsData.bookings) ? bookingsData.bookings : []);
        setServices(Array.isArray(servicesData.services) ? servicesData.services : []);
        setStaffList(Array.isArray(staffData.staff) ? staffData.staff : []);
      } catch (error) {
        console.error("Admin page load error", error);
        setBookings([]);
        setServices([]);
        setStaffList([]);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const serviceMap = useMemo(() => new Map(services.map((service) => [service.id, service.name])), [services]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === "ALL" || booking.status === statusFilter;
      const matchesDate = !dateFilter || booking.scheduledDate?.startsWith(dateFilter);
      return matchesStatus && matchesDate;
    });
  }, [bookings, statusFilter, dateFilter]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    return {
      todayBookings: bookings.filter((booking) => new Date(booking.scheduledDate) >= today && new Date(booking.scheduledDate) < new Date(today.getTime() + 24 * 60 * 60 * 1000)).length,
      pending: bookings.filter((booking) => booking.status === "PENDING").length,
      monthlyRevenue: bookings.filter((booking) => new Date(booking.scheduledDate) >= thisMonth).reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
      staffCount: staffList.length,
    };
  }, [bookings, staffList]);

  const weeklyRevenue = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);
      const label = date.toLocaleDateString("en-US", { weekday: "short" });
      const value = bookings
        .filter((booking) => {
          const bookingDate = new Date(booking.scheduledDate);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === date.getTime();
        })
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

      return { label, revenue: value };
    });

    return days;
  }, [bookings]);

  async function updateBookingStatus(bookingId: number, status: string) {
    setUpdatingId(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update booking");
      setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status } : booking));
    } catch (error) {
      console.error("Update status failed", error);
      alert(error instanceof Error ? error.message : "Unable to update booking status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function assignStaff(bookingId: number, staffId: string) {
    setUpdatingId(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: staffId ? Number(staffId) : null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to assign staff");
      setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, staffId: staffId ? Number(staffId) : null } : booking));
    } catch (error) {
      console.error("Assign staff failed", error);
      alert(error instanceof Error ? error.message : "Unable to assign booking to staff");
    } finally {
      setUpdatingId(null);
    }
  }

  async function setQuotedPrice(bookingId: number, price: string) {
    const numericPrice = price === "" ? null : Number(price);
    if (price !== "" && isNaN(Number(price))) return;
    setUpdatingId(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotedPrice: numericPrice }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to set price");
      setBookings((current) => current.map((b) => b.id === bookingId ? { ...b, quotedPrice: numericPrice } : b));
    } catch (error) {
      console.error("Set price failed", error);
      alert(error instanceof Error ? error.message : "Unable to update price");
    } finally {
      setUpdatingId(null);
    }
  }

  async function markAsServed(bookingId: number) {
    setUpdatingId(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to mark booking as served");
      setBookings((current) =>
        current.map((b) => b.id === bookingId ? { ...b, status: "COMPLETED" } : b)
      );
    } catch (error) {
      console.error("Mark served failed", error);
      alert(error instanceof Error ? error.message : "Unable to mark booking as served");
    } finally {
      setUpdatingId(null);
    }
  }

  function removeFromView(bookingId: number) {
    setBookings((current) => current.filter((b) => b.id !== bookingId));
  }

  function exportCsv() {
    const rows = [
      ["Booking ID", "Customer", "Service", "Date", "Time", "Status", "Price", "Staff ID"],
      ...filteredBookings.map((booking) => [
        booking.id,
        booking.customerName || "",
        serviceMap.get(booking.serviceId) || `Service ${booking.serviceId}`,
        booking.scheduledDate?.slice(0, 10) || "",
        booking.scheduledTime?.slice(11, 16) || "",
        booking.status,
        booking.totalPrice || 0,
        booking.staffId ?? "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "admin-bookings.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!isLoaded || !roleReady) {
    return <main className="min-h-screen bg-[var(--bg-primary)] p-8 text-[var(--text-primary)]">Loading admin access…</main>;
  }

  if (role !== "ADMIN") {
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Admin dashboard</p>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">Operations overview</h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">Monitor bookings, assign staff, update status, and review weekly revenue from one responsive view.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Today’s Bookings", stats.todayBookings],
            ["Pending", stats.pending],
            ["Monthly Revenue", formatCurrency(stats.monthlyRevenue)],
            ["Staff Count", stats.staffCount],
          ].map(([label, value]) => (
            <article key={label as string} className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-2xl shadow-black/20">
              <p className="text-sm text-[var(--text-secondary)]">{label as string}</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">{value as string}</p>
            </article>
          ))}
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-2xl shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Bookings</h2>
                <p className="text-sm text-[var(--text-secondary)]">Filter by status and date, then update records in place.</p>
              </div>
              <button type="button" onClick={exportCsv} className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Export to CSV</button>
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:hidden">
              <button type="button" onClick={() => setFiltersOpen((prev) => !prev)} className="h-11 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]">{filtersOpen ? "Hide filters" : "Show filters"}</button>
              {filtersOpen ? (
                <div className="grid gap-3">
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-3 text-sm text-[var(--text-primary)]">
                  {['ALL_PENDING','PENDING','PENDING_QUOTE','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED'].map((status) => <option key={status} value={status === 'ALL_PENDING' ? 'ALL' : status}>{status === 'ALL_PENDING' ? 'All statuses' : status.replace('_', ' ')}</option>)}
                  </select>
                  <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-3 text-sm text-[var(--text-primary)]" />
                </div>
              ) : null}
            </div>

            <div className="mt-4 hidden flex-wrap gap-3 lg:flex">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]">
                <option value="ALL">All statuses</option>
                {['PENDING','PENDING_QUOTE','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED'].map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
              </select>
              <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]" />
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-[720px] divide-y divide-[var(--border-color)] text-left text-sm text-[var(--text-secondary)]">
                <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3">Service</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Staff</th>
                    <th className="px-3 py-3">Quoted Price (RWF)</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-[var(--bg-secondary)]/40">
                      <td className="px-3 py-4 text-[var(--text-primary)]">{booking.customerName || booking.email || `Booking ${booking.id}`}</td>
                      <td className="px-3 py-4">{serviceMap.get(booking.serviceId) || `Service ${booking.serviceId}`}</td>
                      <td className="px-3 py-4">{formatDate(booking.scheduledDate)}</td>
                      <td className="px-3 py-4">
                        <select value={booking.status} onChange={(event) => void updateBookingStatus(booking.id, event.target.value)} disabled={updatingId === booking.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]">
                          {['PENDING_QUOTE','PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED'].map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-4">
                        <select value={booking.staffId ?? ""} onChange={(event) => void assignStaff(booking.id, event.target.value)} disabled={updatingId === booking.id} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)]">
                          <option value="">Unassigned</option>
                          {staffList.map((staff) => <option key={staff.id} value={staff.id}>Staff #{staff.id}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-4">
                        <input
                          type="number"
                          min="0"
                          placeholder="Enter price…"
                          defaultValue={booking.quotedPrice ?? ""}
                          onBlur={(e) => void setQuotedPrice(booking.id, e.target.value)}
                          disabled={updatingId === booking.id}
                          className="w-32 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-cyan-400 focus:outline-none disabled:opacity-50"
                        />
                        {booking.quotedPrice != null && (
                          <p className="mt-1 text-xs text-cyan-400">{booking.quotedPrice.toLocaleString()} RWF</p>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          {booking.status !== "COMPLETED" && booking.status !== "CANCELLED" && (
                            <button
                              type="button"
                              onClick={() => void markAsServed(booking.id)}
                              disabled={updatingId === booking.id}
                              className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                            >
                              {updatingId === booking.id ? "Saving…" : "✓ Mark Served"}
                            </button>
                          )}
                          {(booking.status === "COMPLETED" || booking.status === "CANCELLED") && (
                            <button
                              type="button"
                              onClick={() => removeFromView(booking.id)}
                              className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-2xl shadow-black/20">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Weekly revenue</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Revenue trend for the last 7 days.</p>
            <div className="mt-5 h-72 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyRevenue}>
                  <CartesianGrid stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="label" stroke="#cbd5e1" tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value || 0))} />
                  <Bar dataKey="revenue" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
