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
  beforePhotoUrl?: string | null;
  afterPhotoUrl?: string | null;
  reportNote?: string | null;
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

/** Maps a BookingStatus to a 0-based step index (0–4) */
function statusToStep(status: string): number {
  switch (status) {
    case "PENDING":
    case "PENDING_QUOTE": return 0;
    case "CONFIRMED":     return 1;
    case "IN_PROGRESS":   return 2;
    // COMPLETED is step 4 (last), but we skip step 3 "Cleaning" label and show it done
    case "COMPLETED":     return 4;
    default:              return 0;
  }
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

  const isCancelled = booking.status === "CANCELLED";
  const isActive = !isCancelled && booking.status !== "COMPLETED";
  const currentStep = isCancelled ? -1 : statusToStep(booking.status);

  const steps = [
    { label: t("trackerStep1"), sub: t("trackerStep1Sub"), icon: "📬" },
    { label: t("trackerStep2"), sub: t("trackerStep2Sub"), icon: "✅" },
    { label: t("trackerStep3"), sub: t("trackerStep3Sub"), icon: "🚶" },
    { label: t("trackerStep4"), sub: t("trackerStep4Sub"), icon: "🧹" },
    { label: t("trackerStep5"), sub: t("trackerStep5Sub"), icon: "✨" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-y-auto max-h-[90vh] rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl shadow-black/30">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{t("title")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{serviceName}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:border-cyan-400 hover:text-[var(--text-primary)]"
          >
            {t("close")}
          </button>
        </div>

        {/* ── Live Tracker ── */}
        <div className="mt-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {isCancelled ? "🚫 " + t("trackerCancelled") : "📡 " + t("trackerTitle")}
            </p>
            {isActive && (
              <span className="flex items-center gap-1.5 text-xs text-cyan-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {t("trackerRefresh")}
              </span>
            )}
          </div>

          {isCancelled ? (
            <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
              <span className="text-xl">❌</span>
              <div>
                <p className="text-sm font-semibold text-rose-400">{t("trackerCancelled")}</p>
                <p className="text-xs text-[var(--text-secondary)]">{t("trackerCancelledSub")}</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-[var(--border-color)]" />
              <div
                className="absolute left-5 top-5 w-0.5 bg-gradient-to-b from-cyan-400 to-cyan-300 transition-all duration-700"
                style={{ height: currentStep === 0 ? "0%" : `${Math.min(currentStep / 4, 1) * 100}%` }}
              />

              <ul className="relative space-y-4">
                {steps.map((step, index) => {
                  const done = index < currentStep;
                  const active = index === currentStep;
                  return (
                    <li key={index} className="flex items-start gap-4">
                      {/* Step circle */}
                      <div
                        className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm transition-all duration-300 ${
                          done
                            ? "border-cyan-400 bg-cyan-400 text-slate-950 font-bold"
                            : active
                            ? "border-cyan-400 bg-cyan-400/20 text-cyan-400 shadow-lg shadow-cyan-400/30"
                            : "border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] opacity-40"
                        }`}
                      >
                        {done ? "✓" : step.icon}
                      </div>
                      {/* Step label */}
                      <div className={`pt-1.5 transition-opacity duration-300 ${active || done ? "opacity-100" : "opacity-40"}`}>
                        <p className={`text-sm font-semibold ${active ? "text-cyan-400" : done ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                          {step.label}
                          {active && (
                            <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse align-middle" />
                          )}
                        </p>
                        {(active || done) && (
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{step.sub}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Details grid */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
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

          {/* ── Cleaning Report ── */}
          {(booking.beforePhotoUrl || booking.afterPhotoUrl || booking.reportNote) ? (
            <article className="rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-4 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📸</span>
                <p className="text-sm font-semibold text-cyan-400">{t("reportTitle")}</p>
                <span className="ml-auto rounded-full bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">{t("reportBadge")}</span>
              </div>

              {/* Before / After photos */}
              {(booking.beforePhotoUrl || booking.afterPhotoUrl) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {booking.beforePhotoUrl && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">{t("reportBefore")}</p>
                      <a href={booking.beforePhotoUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                          src={booking.beforePhotoUrl}
                          alt="Before cleaning"
                          className="w-full rounded-xl object-cover border border-[var(--border-color)] hover:opacity-80 transition max-h-48"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </a>
                    </div>
                  )}
                  {booking.afterPhotoUrl && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)]">{t("reportAfter")}</p>
                      <a href={booking.afterPhotoUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                          src={booking.afterPhotoUrl}
                          alt="After cleaning"
                          className="w-full rounded-xl object-cover border border-cyan-400/30 hover:opacity-80 transition max-h-48"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Technician note */}
              {booking.reportNote && (
                <div className="mt-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)] mb-1">{t("reportNote")}</p>
                  <p className="text-sm text-[var(--text-primary)]">&ldquo;{booking.reportNote}&rdquo;</p>
                </div>
              )}
            </article>
          ) : null}
        </div>
      </div>
    </div>
  );
}
