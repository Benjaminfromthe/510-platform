"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] as const;

const SERVICES = [
  { id: 1, name: "Laptop & Computer", duration: 30, emoji: "💻" },
  { id: 2, name: "Phone & Tablet", duration: 20, emoji: "📱" },
];

function formatYMD(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isPastDay(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function formatTimeLabel(value: string) {
  const [h, m] = value.split(":").map(Number);
  const d = new Date(2024, 0, 1, h, m);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getDaysInMonth(year: number, month: number) {
  const days = [];
  const firstDay = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  // pad start
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= total; d++) days.push(new Date(year, month, d));
  return days;
}

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export default function CampusBookForm() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const searchParams = useSearchParams();
  const serviceIdParam = Number(searchParams.get("serviceId") || 1);
  const t = useTranslations();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState(
    SERVICES.find(s => s.id === serviceIdParam) ?? SERVICES[0]
  );
  const [name, setName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [error, setError] = useState("");

  // Pre-fill name from Clerk
  useEffect(() => {
    if (user?.fullName) setName(user.fullName);
  }, [user]);

  // Auth gate
  if (isLoaded && !userId) {
    const signInUrl = `/sign-in?redirect_url=/book`;
    const signUpUrl = `/sign-up?redirect_url=/book`;
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 shadow-2xl">
            <span className="text-4xl">🔐</span>
            <h1 className="mt-4 text-xl font-black text-[var(--text-primary)]">{t("auth.bookingGateTitle")}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{t("auth.bookingGateText")}</p>
            <div className="mt-5 flex flex-col gap-3">
              <a href={signInUrl} className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 text-center hover:bg-cyan-300 transition">{t("auth.signInToContinue")}</a>
              <a href={signUpUrl} className="w-full rounded-xl border border-[var(--border-color)] py-3 text-sm font-semibold text-[var(--text-primary)] text-center hover:border-cyan-400 transition">{t("auth.createAccountToContinue")}</a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="rounded-3xl border border-emerald-400/30 bg-[var(--bg-card)] p-8 shadow-2xl">
            <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto" />
            <h1 className="mt-4 text-2xl font-black text-[var(--text-primary)]">You&apos;re booked! 🎉</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">We&apos;ll reach you on WhatsApp to confirm your time.</p>
            <div className="mt-4 rounded-2xl bg-[var(--bg-secondary)] p-4">
              <p className="text-xs text-[var(--text-secondary)]">Booking reference</p>
              <p className="text-2xl font-black text-emerald-500">#{bookingRef}</p>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              <a href="https://wa.me/250787769046" target="_blank" rel="noreferrer"
                className="w-full rounded-xl bg-emerald-400 py-3 text-sm font-semibold text-slate-950 text-center">
                Chat on WhatsApp
              </a>
              <Link href="/dashboard" className="w-full rounded-xl border border-[var(--border-color)] py-3 text-sm font-semibold text-[var(--text-primary)] text-center hover:border-cyan-400 transition">
                View my bookings
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const days = getDaysInMonth(viewYear, viewMonth);
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  minDate.setHours(0, 0, 0, 0);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  async function handleBook() {
    if (!selectedDate || !selectedTime) { setError("Pick a day and time first."); return; }
    if (!name.trim() || name.trim().length < 2) { setError("Enter your name."); return; }
    if (!phone.trim() || phone.trim().length < 7) { setError("Enter your phone number."); return; }

    setError("");
    setSubmitting(true);
    try {
      const email = user?.primaryEmailAddress?.emailAddress ?? `${phone}@campus.student`;
      const dateStr = formatYMD(selectedDate);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          quantity: 1,
          scheduledDate: dateStr,
          scheduledTime: selectedTime,
          address: "On campus",
          customerName: name.trim(),
          phone: phone.trim(),
          email,
          quoteDescription: `${selectedService.name} cleaning requested by campus student`,
          clerkUserId: userId ?? undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed.");
      setBookingRef(String(data.bookingId || "REQ-" + Date.now()));
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-lg space-y-5">

        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">Book a clean</p>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Get your device cleaned ✨</h1>
          <p className="text-sm text-[var(--text-secondary)]">500 RWF · We come to you on campus</p>
        </div>

        {/* Service picker */}
        <div className="grid grid-cols-2 gap-3">
          {SERVICES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedService(s)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedService.id === s.id
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-cyan-400/60"
              }`}
            >
              <span className="text-2xl">{s.emoji}</span>
              <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{s.name}</p>
              <p className="text-xs text-[var(--text-secondary)]">{s.duration} min · 500 RWF</p>
            </button>
          ))}
        </div>

        {/* Calendar */}
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="h-8 w-8 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-400 hover:text-cyan-500 flex items-center justify-center text-sm font-bold">‹</button>
            <p className="font-semibold text-[var(--text-primary)]">{MONTH_NAMES[viewMonth]} {viewYear}</p>
            <button type="button" onClick={nextMonth} className="h-8 w-8 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-400 hover:text-cyan-500 flex items-center justify-center text-sm font-bold">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-[var(--text-secondary)] mb-2">
            {DAY_NAMES.map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <span key={i} />;
              const isDisabled = isPastDay(day) || day.getDay() === 0;
              const isSelected = selectedDate && formatYMD(day) === formatYMD(selectedDate);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && setSelectedDate(day)}
                  className={`rounded-full py-1.5 text-xs font-medium transition ${
                    isSelected ? "bg-cyan-500 text-white font-bold" :
                    isDisabled ? "text-[var(--text-secondary)] opacity-30 cursor-not-allowed" :
                    "text-[var(--text-primary)] hover:bg-cyan-400/20 hover:text-cyan-600"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300 mb-3">Pick a time</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition ${
                    selectedTime === slot
                      ? "bg-cyan-500 text-white"
                      : "border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-cyan-400"
                  }`}
                >
                  {formatTimeLabel(slot)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {selectedDate && selectedTime && (
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">Your info</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-cyan-500"
            />
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Phone number (WhatsApp)"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="rounded-xl bg-rose-500/10 border border-rose-400/30 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</p>
        )}

        {/* Book button */}
        <button
          type="button"
          onClick={handleBook}
          disabled={submitting || !selectedDate || !selectedTime}
          className="w-full rounded-2xl bg-cyan-400 py-4 text-base font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-cyan-400/20"
        >
          {submitting ? "Booking…" : "Book Now — 500 RWF 🚀"}
        </button>

          <p className="text-center text-xs text-[var(--text-secondary)]">No payment now &middot; We confirm via WhatsApp</p>

      </div>
    </main>
  );
}
