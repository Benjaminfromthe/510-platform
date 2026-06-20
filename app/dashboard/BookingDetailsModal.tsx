"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

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

export default function BookingDetailsModal({ booking, serviceName, onClose }: BookingDetailsModalProps) {
  const t = useTranslations("bookingModal");

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
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{t("title")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{serviceName}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("status")}: <span className="font-medium text-[var(--text-primary)]">{booking.status.replace("_", " ")}</span></p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:border-cyan-400 hover:text-[var(--text-primary)]"
          >
            {t("close")}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">{t("schedule")}</p>
            <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">{formatDate(booking.scheduledDate)}</p>
            <p className="text-[var(--text-secondary)]">{formatTime(booking.scheduledTime)}</p>
          </article>

          <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">{t("price")}</p>
            <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
              {booking.totalPrice != null ? `${booking.totalPrice.toLocaleString("en-US")} RWF` : t("quotePending")}
            </p>
            <p className="text-[var(--text-secondary)]">{t("quantity")}: {booking.quantity}</p>
          </article>

          <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)] md:col-span-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">{t("contact")}</p>
            <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">{booking.customerName || "—"}</p>
            <p className="text-[var(--text-secondary)]">{booking.phone || t("noPhone")}</p>
            <p className="text-[var(--text-secondary)]">{booking.email || t("noEmail")}</p>
          </article>

          <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)] md:col-span-2">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">{t("addressNotes")}</p>
            <p className="mt-2 font-medium text-[var(--text-primary)]">{booking.address}</p>
            <p className="mt-1 text-[var(--text-secondary)]">{booking.notes || t("noNotes")}</p>
          </article>

          {booking.addOns && booking.addOns.length > 0 ? (
            <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)] md:col-span-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">{t("addOns")}</p>
              <p className="mt-2 text-[var(--text-secondary)]">{booking.addOns.join(", ")}</p>
            </article>
          ) : null}
        </div>
      </div>
    </div>
  );
}
