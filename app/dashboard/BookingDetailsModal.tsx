"use client";

import { useEffect } from "react";

export type BookingRecord = {
  id: number;
  serviceId: number;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  totalPrice: number | null;
  quantity: number;
  address: string;
  notes?: string | null;
  customerName?: string | null;
  phone?: string | null;
  email?: string | null;
  addOns?: string[] | null;
};

type BookingDetailsModalProps = {
  booking: BookingRecord | null;
  serviceName: string;
  onClose: () => void;
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
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

function formatCurrency(value: number) {
  return `${value.toLocaleString("en-US")} RWF`;
}

export default function BookingDetailsModal({ booking, serviceName, onClose }: BookingDetailsModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl shadow-black/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Booking details</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{serviceName}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Status: {booking.status}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:border-cyan-400 hover:text-[var(--text-primary)]"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">Schedule</p>
            <p className="mt-2 text-base text-[var(--text-primary)]">{formatDate(booking.scheduledDate)}</p>
            <p className="text-[var(--text-secondary)]">{formatTime(booking.scheduledTime)}</p>
          </article>
          <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">Price</p>
            <p className="mt-2 text-base text-[var(--text-primary)]">{formatCurrency(booking.totalPrice || 0)}</p>
            <p className="text-[var(--text-secondary)]">Quantity: {booking.quantity}</p>
          </article>
          <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)] md:col-span-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">Contact</p>
            <p className="mt-2 text-base text-[var(--text-primary)]">{booking.customerName || "Customer"}</p>
            <p className="text-[var(--text-secondary)]">{booking.phone || "No phone on file"}</p>
            <p className="text-[var(--text-secondary)]">{booking.email || "No email on file"}</p>
          </article>
          <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)] md:col-span-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">Address & notes</p>
            <p className="mt-2 text-[var(--text-primary)]">{booking.address}</p>
            <p className="mt-1 text-[var(--text-secondary)]">{booking.notes || "No notes provided."}</p>
          </article>
          <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)] md:col-span-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">Add-ons</p>
            <p className="mt-2 text-[var(--text-secondary)]">{booking.addOns && booking.addOns.length ? booking.addOns.join(", ") : "No add-ons selected"}</p>
          </article>
        </div>
      </div>
    </div>
  );
}
