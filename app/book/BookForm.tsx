"use client";

// NO HARDCODED STRINGS - use t('key') always

import "react-datepicker/dist/react-datepicker.css";

import { Monitor, Sofa, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";

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

type AvailabilityRecord = {
  date: string;
  bookings: number;
  status: "available" | "limited" | "full";
};

const bookingSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(10),
  addOns: z.array(z.string()).default([]),
  scheduledDate: z.string().min(1, "Pick a date"),
  scheduledTime: z.string().min(1, "Pick a time"),
  address: z.string().min(5, "Address is required"),
  notes: z.string().max(250).optional().or(z.literal("")),
  customerName: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Phone number is required"),
  email: z.string().email("A valid email is required"),
  quoteDescription: z.string().min(10, "Please describe the cleaning needs in at least 10 characters."),
  propertySize: z.string().min(1, "Property size is required"),
  urgency: z.string().min(1, "Urgency is required"),
});

const PUBLIC_HOLIDAYS = ["01-01", "04-07", "07-04", "08-15", "12-25"];
const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] as const;

function formatYMD(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(locale: string, dateValue: string) {
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" }).format(new Date(`${dateValue}T00:00:00`));
}

function formatTimeLabel(locale: string, value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(new Date(2024, 0, 1, hours, minutes));
}

function isHoliday(date: Date) {
  return PUBLIC_HOLIDAYS.includes(`${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
}

function isPastDay(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function serviceIcon(category: ServiceCategory) {
  if (category === "ELECTRONICS") return Monitor;
  if (category === "FURNITURE") return Sofa;
  return Sparkles;
}

function getBookedSlotsForDate(date: string, count: number) {
  const seed = new Date(`${date}T00:00:00`).getDate() % TIME_SLOTS.length;
  const occupied = new Set<number>();

  for (let index = 0; index < Math.min(count, TIME_SLOTS.length); index += 1) {
    occupied.add((seed + index) % TIME_SLOTS.length);
  }

  return occupied;
}

export default function BookForm() {
  const t = useTranslations("booking");
  const globalT = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = Number(searchParams.get("serviceId") || 0);

  const [step, setStep] = useState(serviceId ? 1 : 0);
  const [service, setService] = useState<Service | null>(null);
  const [serviceOptions, setServiceOptions] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availability, setAvailability] = useState<AvailabilityRecord[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [quoteDescription, setQuoteDescription] = useState("");
  const [propertySize, setPropertySize] = useState("");
  const [urgency, setUrgency] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const bookingT = useTranslations("booking");

  useEffect(() => {
    let isMounted = true;

    async function loadServices() {
      setLoading(true);
      setServicesLoading(true);
      try {
        const response = await fetch("/api/services", { cache: "force-cache" });
        const data = await response.json();
        const services = Array.isArray(data.services) ? data.services : [];
        const selected = services.find((item: Service) => item.id === serviceId) || null;

        if (isMounted) {
          setServiceOptions(services);
          setService(selected);
          setStep(serviceId && selected ? 1 : 0);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setServiceOptions([]);
          setService(null);
          setStep(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setServicesLoading(false);
        }
      }
    }

    void loadServices();
    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    setSelectedDate(tomorrow);
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setScheduledDate(formatYMD(selectedDate));
  }, [selectedDate]);

  const minDate = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  useEffect(() => {
    async function loadAvailability() {
      if (!selectedDate) return;
      setAvailabilityLoading(true);
      const monthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}`;
      try {
        const response = await fetch(`/api/availability?month=${monthKey}`, { cache: "force-cache" });
        const data = await response.json();
        if (Array.isArray(data.availability)) setAvailability(data.availability);
      } catch (error) {
        console.error(error);
      } finally {
        setAvailabilityLoading(false);
      }
    }

    void loadAvailability();
  }, [selectedDate]);

  const selectedAvailability = useMemo(() => {
    if (!scheduledDate) return null;
    return availability.find((entry) => entry.date === scheduledDate) ?? null;
  }, [availability, scheduledDate]);

  const bookedSlots = useMemo(() => {
    if (!scheduledDate) return new Set<number>();
    const count = selectedAvailability?.bookings ?? 0;
    return getBookedSlotsForDate(scheduledDate, count);
  }, [scheduledDate, selectedAvailability]);

  const availableSlotsLeft = useMemo(() => {
    const count = selectedAvailability?.bookings ?? 0;
    return Math.max(0, TIME_SLOTS.length - Math.min(count, TIME_SLOTS.length));
  }, [selectedAvailability]);

  function validateStep(targetStep: number) {
    const localErrors: Record<string, string> = {};

    if (targetStep === 0) {
      if (!service) localErrors.service = "Please select a service to continue.";
    }

    if (targetStep === 1) {
      if (!service) localErrors.service = "Please select a valid service.";
      if (quantity < 1) localErrors.quantity = "Quantity must be at least 1.";
    }

    if (targetStep === 2) {
      if (!scheduledDate) localErrors.scheduledDate = "Choose a booking date.";
      if (scheduledDate && (isHoliday(new Date(`${scheduledDate}T00:00:00`)) || new Date(scheduledDate).getDay() === 0)) {
        localErrors.scheduledDate = "Sundays and public holidays are unavailable.";
      }
      if (!scheduledTime) localErrors.scheduledTime = "Choose a time slot.";
      if (!address.trim()) localErrors.address = "Address is required.";
      if (!quoteDescription.trim()) localErrors.quoteDescription = "Please describe your cleaning needs.";
      if (!propertySize) localErrors.propertySize = "Please choose the property size.";
      if (!urgency) localErrors.urgency = "Please choose the urgency.";
    }

    if (targetStep === 3) {
      const parsed = bookingSchema.safeParse({
        serviceId,
        quantity,
        addOns: [],
        scheduledDate,
        scheduledTime,
        address,
        notes,
        customerName,
        phone,
        email,
        quoteDescription,
        propertySize,
        urgency,
      });

      if (!parsed.success) {
        for (const issue of parsed.error.issues) {
          const key = issue.path[0]?.toString() || "form";
          localErrors[key] = issue.message;
        }
      }
    }

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  }

  async function handleNext() {
    if (step === 0) {
      if (!service) {
        setErrors({ service: "Please select a service to continue." });
        return;
      }

      setStep(1);
      setErrors({});
      scrollToTop();
      return;
    }

    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
      setErrors({});
      scrollToTop();
    }
  }

  async function handleBack() {
    setStep((prev) => Math.max(prev - 1, 0));
    setErrors({});
    scrollToTop();
  }

  async function submitBooking() {
    if (!validateStep(3)) return;

    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          quantity,
          scheduledDate,
          scheduledTime,
          address,
          notes,
          customerName,
          phone,
          email,
          quoteDescription,
          propertySize,
          urgency,
          name: customerName,
          date: scheduledDate,
          time: scheduledTime,
          description: quoteDescription,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Booking failed.");

      setBookingReference(String(data.bookingId || "REQ-" + Date.now()));
      setSubmitted(true);
      setStep(3);
      scrollToTop();
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await submitBooking();
  }

  const progress = step === 0 ? 0 : [25, 50, 100][step - 1];
  const stepLabels = [
    { id: 1, label: bookingT("stepLabelChoose") },
    { id: 2, label: bookingT("stepLabelSchedule") },
    { id: 3, label: bookingT("stepLabelConfirm") },
  ];

  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("title")}</p>
          <h1 className="text-4xl font-semibold text-[var(--text-primary)] sm:text-5xl">{t("subtitle")}</h1>
        </header>

        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-2xl shadow-black/20">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
            <span>{bookingT("progress")}</span>
            <strong>{bookingT("stepCounter", { current: step + 1, total: 3 })}</strong>
          </div>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-2">
            {stepLabels.map((item, index) => {
              const isActive = step === index;
              const isDone = step > index;
              return (
                <div key={item.id} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${isActive ? "bg-cyan-400/15 text-cyan-100" : isDone ? "bg-emerald-400/10 text-emerald-100" : "bg-[var(--bg-card)] text-[var(--text-secondary)]"}`}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-semibold">{isDone ? "✓" : item.id}</span>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 h-2 rounded-full bg-[var(--bg-secondary)]">
            <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {errors.form ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">
            <p className="font-medium">{errors.form}</p>
            <button
              type="button"
              onClick={() => void submitBooking()}
              className="mt-3 rounded-xl bg-rose-400/90 px-4 py-2 font-semibold text-slate-950 hover:bg-rose-300"
            >
              Retry submission
            </button>
          </div>
        ) : null}

        {submitted ? (
          <section className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-6 shadow-2xl shadow-black/20">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-100">{bookingT("successEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">{bookingT("successTitle")}</h2>
            <p className="mt-3 text-[var(--text-secondary)]">{bookingT("successText")}</p>
            <div className="mt-5 rounded-2xl border border-emerald-400/30 bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]">
              <p className="text-[var(--text-secondary)]">{bookingT("referenceLabel")}</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-200">#{bookingReference}</p>
            </div>
            <p className="mt-4 text-sm text-emerald-100">{bookingT("contactWithin")}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="https://wa.me/250787769046?text=Hi%20510%20Cleaning%2C%20I%20would%20like%20to%20follow%20up%20on%20my%20quote%20request%20reference%20%23%23" target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950">{bookingT("whatsappFollowUp")}</a>
              <button type="button" onClick={() => { setSubmitted(false); setStep(0); setErrors({}); scrollToTop(); }} className="rounded-xl border border-[var(--border-color)] px-5 py-3 text-sm text-[var(--text-primary)]">{bookingT("bookAnother")}</button>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-2xl shadow-black/20 sm:p-6">
            {step === 0 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{t("selectServiceTitle")}</h2>
                  <p className="text-[var(--text-secondary)]">{t("selectServiceText")}</p>
                </div>

                {servicesLoading ? <p className="text-[var(--text-secondary)]">{t("loadingServices")}</p> : null}

                <div className="grid gap-4 md:grid-cols-2">
                  {serviceOptions.map((item) => {
                    const isSelected = service?.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setService(item);
                          router.replace(`/book?serviceId=${item.id}`, { scroll: false });
                        }}
                        className={`rounded-3xl border p-5 text-left transition ${isSelected ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-500/10" : "border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-cyan-400/70 hover:bg-[var(--bg-card)]"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{globalT(`category.${item.category.toLowerCase() as Lowercase<ServiceCategory>}`)}</p>
                            <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">{item.name}</h3>
                            <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.description}</p>
                          </div>
                          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">{globalT("services.getQuote")}</span>
                        </div>
                        <p className="mt-4 text-xs text-[var(--text-secondary)]">{item.duration} {globalT("common.minutes")} • {globalT(`category.${item.category.toLowerCase() as Lowercase<ServiceCategory>}`)}</p>
                      </button>
                    );
                  })}
                </div>

                {errors.service ? <p className="text-sm text-rose-300">{errors.service}</p> : null}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{t("step1Title")}</h2>
                  <p className="text-[var(--text-secondary)]">{t("step1Text")}</p>
                </div>

                {loading ? <p className="text-[var(--text-secondary)]">{t("loadingSelectedService")}</p> : service ? (
                  <article className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                    <div className="flex h-36 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-card)] to-[var(--bg-primary)]">
                      {(() => {
                        const Icon = serviceIcon(service.category);
                        return <Icon className="h-12 w-12 text-cyan-200" />;
                      })()}
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{globalT(`category.${service.category.toLowerCase() as Lowercase<ServiceCategory>}`)}</p>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)]">{service.name}</h3>
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">{service.description}</p>
                      </div>
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-200">{globalT("services.getQuote")}</span>
                    </div>
                  </article>
                ) : <p className="text-rose-200">{t("noServiceSelected")}</p>}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-[var(--text-secondary)]">
                    <span>{t("quantity")}</span>
                    <input type="number" min="1" max="10" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)]" />
                    {errors.quantity ? <span className="text-rose-300">{errors.quantity}</span> : null}
                  </label>

                  <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 p-4 text-sm text-cyan-50">
                    <p className="text-xs uppercase tracking-[0.35em] text-cyan-200">{bookingT("estimatedTimeLabel")}</p>
                    <p className="mt-2 text-lg font-semibold">{bookingT("estimatedTimeValue", { minutes: service?.duration || 0 })}</p>
                    <p className="mt-1 text-cyan-100/90">{bookingT("estimatedTimeHint")}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{t("step2Title")}</h2>
                  <p className="text-[var(--text-secondary)]">{t("step2Text")}</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                  <div className="w-full overflow-x-auto rounded-3xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{bookingT("availabilityLabel")}</p>
                        <h3 className="text-xl font-semibold text-[var(--text-primary)]">{bookingT("interactiveCalendar")}</h3>
                      </div>
                      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">{bookingT("liveUpdates")}</span>
                    </div>

                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => setSelectedDate(date)}
                      onMonthChange={(date: Date) => setSelectedDate((current) => (current ? new Date(current.setMonth(date.getMonth(), current.getDate())) : date))}
                      minDate={minDate}
                      inline
                      showPopperArrow={false}
                      filterDate={(date) => !isPastDay(date) && date.getDay() !== 0 && !isHoliday(date)}
                      dayClassName={(date) => {
                        const key = formatYMD(date);
                        const entry = availability.find((item) => item.date === key);
                        if (entry?.status === "full") return "bg-rose-500/20 text-rose-100 border border-rose-400/30 rounded-full";
                        if (entry?.status === "limited") return "bg-amber-400/15 text-amber-100 border border-amber-400/30 rounded-full";
                        return "hover:bg-cyan-400/10 rounded-full";
                      }}
                      renderDayContents={(day, date) => {
                        const key = formatYMD(date);
                        const entry = availability.find((item) => item.date === key);
                        return (
                          <span className="flex flex-col items-center gap-1 text-[11px] leading-tight">
                            <span>{day}</span>
                            {entry?.status === "full" ? <span className="text-[10px] text-rose-200">{bookingT("fullyBooked")}</span> : entry?.bookings ? <span className="text-[10px] text-cyan-200">{entry.bookings} booked</span> : null}
                          </span>
                        );
                      }}
                    />

                    <div className="mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 text-xs text-[var(--text-secondary)]">
                      <p>• {bookingT("blockedDates")}</p>
                      <p>• {bookingT("calendarHint")}</p>
                      <p>• {bookingT("calendarFull")}</p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{bookingT("timeSlotsLabel")}</p>
                      <h3 className="text-xl font-semibold text-[var(--text-primary)]">{bookingT("chooseTime")}</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {TIME_SLOTS.map((slot, index) => {
                        const occupied = bookedSlots.has(index);
                        const disabled = occupied || (selectedAvailability?.status === "full");
                        const label = formatTimeLabel(locale, slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setScheduledTime(slot)}
                            disabled={disabled}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${scheduledTime === slot ? "border-cyan-400 bg-cyan-400/15 text-cyan-50" : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-cyan-400/60 hover:bg-[var(--bg-secondary)]"}${disabled ? " cursor-not-allowed opacity-40" : ""}`}
                          >
                            <span className="block text-sm font-semibold">{label}</span>
                            <span className="text-xs text-[var(--text-secondary)]">{slot}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
                      {selectedAvailability?.status === "full" ? <p>{bookingT("fullyBookedMessage")}</p> : availableSlotsLeft <= 2 && scheduledDate ? <p>{bookingT("slotsLeftMessage", { count: availableSlotsLeft })}</p> : <p>{bookingT("availabilityHint")}</p>}
                    </div>

                    {errors.scheduledDate ? <p className="text-sm text-rose-300">{errors.scheduledDate}</p> : null}
                    {errors.scheduledTime ? <p className="text-sm text-rose-300">{errors.scheduledTime}</p> : null}
                  </div>
                </div>

                <label className="space-y-1 text-sm text-[var(--text-secondary)]">
                  <span>{bookingT("addressLabel")}</span>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={bookingT("addressPlaceholder")} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)]" />
                  {errors.address ? <span className="text-rose-300">{errors.address}</span> : null}
                </label>

                <label className="space-y-1 text-sm text-[var(--text-secondary)]">
                  <span>{bookingT("descriptionLabel")}</span>
                  <textarea value={quoteDescription} onChange={(e) => setQuoteDescription(e.target.value)} rows={4} placeholder={bookingT("descriptionPlaceholder")} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)]" />
                  {errors.quoteDescription ? <span className="text-rose-300">{errors.quoteDescription}</span> : null}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-[var(--text-secondary)]">
                    <span>{bookingT("propertySizeLabel")}</span>
                    <select value={propertySize} onChange={(e) => setPropertySize(e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)]">
                      <option value="">{bookingT("selectSize")}</option>
                      <option value="Small room">Small room</option>
                      <option value="Large room">Large room</option>
                      <option value="Full apartment">Full apartment</option>
                      <option value="Full house">Full house</option>
                      <option value="Office">Office</option>
                    </select>
                    {errors.propertySize ? <span className="text-rose-300">{errors.propertySize}</span> : null}
                  </label>

                  <label className="space-y-1 text-sm text-[var(--text-secondary)]">
                    <span>{bookingT("urgencyLabel")}</span>
                    <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)]">
                      <option value="">{bookingT("selectUrgency")}</option>
                      <option value="Flexible">Flexible</option>
                      <option value="This week">This week</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="Today (urgent)">Today (urgent)</option>
                    </select>
                    {errors.urgency ? <span className="text-rose-300">{errors.urgency}</span> : null}
                  </label>
                </div>

                <label className="space-y-1 text-sm text-[var(--text-secondary)]">
                  <span>{bookingT("instructionsLabel")}</span>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder={bookingT("instructionsPlaceholder")} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)]" />
                  {errors.notes ? <span className="text-rose-300">{errors.notes}</span> : null}
                </label>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{t("step3Title")}</h2>
                  <p className="text-[var(--text-secondary)]">{t("step3Text")}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-[var(--text-secondary)]">
                    <span>{bookingT("fullNameLabel")}</span>
                    <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)]" />
                    {errors.customerName ? <span className="text-rose-300">{errors.customerName}</span> : null}
                  </label>

                  <label className="space-y-1 text-sm text-[var(--text-secondary)]">
                    <span>{bookingT("phoneLabel")}</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)]" />
                    {errors.phone ? <span className="text-rose-300">{errors.phone}</span> : null}
                  </label>

                  <label className="space-y-1 text-sm text-[var(--text-secondary)] sm:col-span-2">
                    <span>{bookingT("emailLabel")}</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)]" />
                    {errors.email ? <span className="text-rose-300">{errors.email}</span> : null}
                  </label>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={handleBack} disabled={step === 0 || step === 1 && !serviceId} className="h-11 rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-40">{t("back")}</button>
              {step === 0 ? (
                <button type="button" onClick={handleNext} className="h-11 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">{t("continue")}</button>
              ) : step < 3 ? (
                <button type="button" onClick={handleNext} className="h-11 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">{t("continue")}</button>
              ) : (
                <button type="submit" disabled={submitting} className="h-11 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? bookingT("sending") : bookingT("sendQuoteButton")}</button>
              )}
            </div>
          </section>

          <aside className="space-y-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-2xl shadow-black/20 sm:p-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">{bookingT("summaryTitle")}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{bookingT("summaryText")}</p>
            </div>

            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between"><span>{bookingT("summaryService")}</span><strong>{service?.name || bookingT("selectedService")}</strong></div>
              <div className="mt-2 flex items-center justify-between"><span>{bookingT("summaryQuantity")}</span><strong>{quantity}</strong></div>
              <div className="mt-2 flex items-center justify-between"><span>{bookingT("summaryDuration")}</span><strong>{bookingT("estimatedTimeValue", { minutes: service?.duration || 0 })}</strong></div>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-sm text-cyan-100">{bookingT("quoteStatus")}</p>
              <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">{bookingT("quotePending")}</p>
            </div>

            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>{t("summaryDate")}:</strong> {scheduledDate ? formatDateLabel(locale, scheduledDate) : "—"}</p>
              <p><strong>{t("summaryTime")}:</strong> {scheduledTime ? formatTimeLabel(locale, scheduledTime) : "—"}</p>
              <p><strong>{t("summaryAvailability")}:</strong> {selectedAvailability?.status === "full" ? t("fullyBooked") : selectedAvailability?.status === "limited" ? globalT("booking.availability.limited") : globalT("booking.availability.open")}</p>
              <p><strong>{t("summaryAddress")}:</strong> {address || "—"}</p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              <p className="font-semibold">{bookingT("whyThisDateWorks")}</p>
              <p className="mt-1">{selectedAvailability?.bookings ? bookingT("existingBookings", { count: selectedAvailability.bookings }) : bookingT("noExistingBookings")}</p>
            </div>
          </aside>
        </form>
        )}
      </section>
    </main>
  );
}
