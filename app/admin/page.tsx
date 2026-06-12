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
      return "bg-amber-500/10 text-amber-100 border-amber-500/30";
    case "CONFIRMED":
    case "IN_PROGRESS":
      return "bg-cyan-500/10 text-cyan-100 border-cyan-500/30";
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-100 border-emerald-500/30";
    case "CANCELLED":
      return "bg-rose-500/10 text-rose-100 border-rose-500/30";
    default:
      return "bg-slate-500/10 text-slate-100 border-slate-500/30";
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
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const role = String(user?.publicMetadata?.role || user?.unsafeMetadata?.role || "").toUpperCase();

  useEffect(() => {
    if (!isLoaded) return;
    if (role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isLoaded, role, router]);

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

  if (!isLoaded) {
    return <main className="min-h-screen bg-slate-950 p-8 text-slate-100">Loading admin access…</main>;
  }

  if (role !== "ADMIN") {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Admin dashboard</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Operations overview</h1>
          <p className="max-w-2xl text-slate-300">Monitor bookings, assign staff, update status, and review weekly revenue from one responsive view.</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Today’s Bookings", stats.todayBookings],
            ["Pending", stats.pending],
            ["Monthly Revenue", formatCurrency(stats.monthlyRevenue)],
            ["Staff Count", stats.staffCount],
          ].map(([label, value]) => (
            <article key={label as string} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/20">
              <p className="text-sm text-slate-300">{label as string}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{value as string}</p>
            </article>
          ))}
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Bookings</h2>
                <p className="text-sm text-slate-300">Filter by status and date, then update records in place.</p>
              </div>
              <button type="button" onClick={exportCsv} className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Export to CSV</button>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100">
                <option value="ALL">All statuses</option>
                {['PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED'].map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100" />
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
                <thead className="bg-slate-950/80 text-slate-300">
                  <tr>
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3">Service</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Staff</th>
                    <th className="px-3 py-3">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-800/40">
                      <td className="px-3 py-4 text-white">{booking.customerName || booking.email || `Booking ${booking.id}`}</td>
                      <td className="px-3 py-4">{serviceMap.get(booking.serviceId) || `Service ${booking.serviceId}`}</td>
                      <td className="px-3 py-4">{formatDate(booking.scheduledDate)}</td>
                      <td className="px-3 py-4">
                        <select value={booking.status} onChange={(event) => void updateBookingStatus(booking.id, event.target.value)} disabled={updatingId === booking.id} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100">
                          {['PENDING','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED'].map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-4">
                        <select value={booking.staffId ?? ""} onChange={(event) => void assignStaff(booking.id, event.target.value)} disabled={updatingId === booking.id} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100">
                          <option value="">Unassigned</option>
                          {staffList.map((staff) => <option key={staff.id} value={staff.id}>Staff #{staff.id}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-4">{formatCurrency(booking.totalPrice || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/20">
            <h2 className="text-xl font-semibold text-white">Weekly revenue</h2>
            <p className="mt-1 text-sm text-slate-300">Revenue trend for the last 7 days.</p>
            <div className="mt-5 h-72 w-full">
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
