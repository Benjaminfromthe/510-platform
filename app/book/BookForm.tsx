"use client";

import "react-datepicker/dist/react-datepicker.css";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { useSearchParams } from "next/navigation";
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
const TIME_SLOTS = [
  { label: "8AM", value: "08:00" },
  { label: "9AM", value: "09:00" },
  { label: "10AM", value: "10:00" },
  { label: "11AM", value: "11:00" },
  { label: "2PM", value: "14:00" },
  { label: "3PM", value: "15:00" },
  { label: "4PM", value: "16:00" },
];

function formatYMD(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isHoliday(date: Date) {
  return PUBLIC_HOLIDAYS.includes(`${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`);
}

function isPastDay(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
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
  const searchParams = useSearchParams();
  const serviceId = Number(searchParams.get("serviceId") || 0);

  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadService() {
      setLoading(true);
      try {
        const response = await fetch("/api/services", { cache: "no-store" });
        const data = await response.json();
        const selected = data.services?.find((item: Service) => item.id === serviceId) || null;
        if (isMounted) setService(selected);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadService();
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
        const response = await fetch(`/api/availability?month=${monthKey}`, { cache: "no-store" });
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
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
      setErrors({});
    }
  }

  async function handleBack() {
    setStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!validateStep(3)) return;

    setSubmitting(true);
    setSuccessMessage("");

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
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Booking failed.");

      setSuccessMessage(`Quote request sent for ${service?.name || "your selected service"}.`);
      setStep(3);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  }

  const progress = [25, 50, 100][step - 1];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Quote request</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Smart booking calendar with live availability</h1>
        </header>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/20">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Progress</span>
            <strong>{step} / 3</strong>
          </div>
          <div className="h-2 rounded-full bg-slate-800">
            <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {errors.form ? <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{errors.form}</p> : null}
        {successMessage ? <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-100">{successMessage}</p> : null}

        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Step 1 — Service Details</h2>
                  <p className="text-slate-300">Choose the quantity and confirm the service you want quoted.</p>
                </div>

                {loading ? <p className="text-slate-300">Loading selected service…</p> : service ? (
                  <article className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                    <img src={service.imageUrl || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80"} alt={service.name} className="h-36 w-full rounded-2xl object-cover" />
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">{service.category.toLowerCase()}</p>
                        <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                        <p className="mt-2 text-sm text-slate-300">{service.description}</p>
                      </div>
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm font-semibold text-cyan-200">Free quote</span>
                    </div>
                  </article>
                ) : <p className="text-rose-200">No service was selected. Go back and choose a service first.</p>}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-200">
                    <span>Quantity</span>
                    <input type="number" min="1" max="10" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
                    {errors.quantity ? <span className="text-rose-300">{errors.quantity}</span> : null}
                  </label>

                  <label className="space-y-1 text-sm text-slate-200">
                    <span>Duration</span>
                    <input value={`${service?.duration || 0} minutes`} readOnly className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-300" />
                  </label>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Step 2 — Pick your date and time</h2>
                  <p className="text-slate-300">Choose a day from the live calendar and lock in the best available slot for your quote.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Availability</p>
                        <h3 className="text-xl font-semibold text-white">Interactive calendar</h3>
                      </div>
                      <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">Live updates</span>
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
                            {entry?.status === "full" ? <span className="text-[10px] text-rose-200">Full</span> : entry?.bookings ? <span className="text-[10px] text-cyan-200">{entry.bookings} booked</span> : null}
                          </span>
                        );
                      }}
                    />

                    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
                      <p>• Past dates, Sundays, and public holidays are blocked.</p>
                      <p>• Cyan highlights show available days with live booking counts.</p>
                      <p>• Dates with 5+ bookings are marked as fully booked.</p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Time slots</p>
                      <h3 className="text-xl font-semibold text-white">Choose a time</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {TIME_SLOTS.map((slot, index) => {
                        const occupied = bookedSlots.has(index);
                        const disabled = occupied || (selectedAvailability?.status === "full");
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            onClick={() => setScheduledTime(slot.value)}
                            disabled={disabled}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${scheduledTime === slot.value ? "border-cyan-400 bg-cyan-400/15 text-cyan-50" : "border-slate-700 bg-slate-900 text-slate-100 hover:border-cyan-400/60 hover:bg-slate-800"}${disabled ? " cursor-not-allowed opacity-40" : ""}`}
                          >
                            <span className="block text-sm font-semibold">{slot.label}</span>
                            <span className="text-xs text-slate-400">{slot.value}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
                      {selectedAvailability?.status === "full" ? <p>Fully booked for this date — please select another day.</p> : availableSlotsLeft <= 2 && scheduledDate ? <p>Only {availableSlotsLeft} slots left — book soon to secure your preferred time.</p> : <p>Available slots update with the selected day and current booking demand.</p>}
                    </div>

                    {errors.scheduledDate ? <p className="text-sm text-rose-300">{errors.scheduledDate}</p> : null}
                    {errors.scheduledTime ? <p className="text-sm text-rose-300">{errors.scheduledTime}</p> : null}
                  </div>
                </div>

                <label className="space-y-1 text-sm text-slate-200">
                  <span>Address</span>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., Kacyiru, Kigali" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
                  {errors.address ? <span className="text-rose-300">{errors.address}</span> : null}
                </label>

                <label className="space-y-1 text-sm text-slate-200">
                  <span>Describe your cleaning needs</span>
                  <textarea value={quoteDescription} onChange={(e) => setQuoteDescription(e.target.value)} rows={4} placeholder="Tell us what needs cleaning, any stains, rooms, or special requests..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
                  {errors.quoteDescription ? <span className="text-rose-300">{errors.quoteDescription}</span> : null}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-200">
                    <span>Property size</span>
                    <select value={propertySize} onChange={(e) => setPropertySize(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white">
                      <option value="">Select size</option>
                      <option value="Small room">Small room</option>
                      <option value="Large room">Large room</option>
                      <option value="Full apartment">Full apartment</option>
                      <option value="Full house">Full house</option>
                      <option value="Office">Office</option>
                    </select>
                    {errors.propertySize ? <span className="text-rose-300">{errors.propertySize}</span> : null}
                  </label>

                  <label className="space-y-1 text-sm text-slate-200">
                    <span>Urgency</span>
                    <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white">
                      <option value="">Select urgency</option>
                      <option value="Flexible">Flexible</option>
                      <option value="This week">This week</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="Today (urgent)">Today (urgent)</option>
                    </select>
                    {errors.urgency ? <span className="text-rose-300">{errors.urgency}</span> : null}
                  </label>
                </div>

                <label className="space-y-1 text-sm text-slate-200">
                  <span>Special instructions</span>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Any special requests?" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
                  {errors.notes ? <span className="text-rose-300">{errors.notes}</span> : null}
                </label>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Step 3 — Contact details</h2>
                  <p className="text-slate-300">Provide your contact details so our team can send the quote.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-200">
                    <span>Full name</span>
                    <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
                    {errors.customerName ? <span className="text-rose-300">{errors.customerName}</span> : null}
                  </label>

                  <label className="space-y-1 text-sm text-slate-200">
                    <span>Phone</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
                    {errors.phone ? <span className="text-rose-300">{errors.phone}</span> : null}
                  </label>

                  <label className="space-y-1 text-sm text-slate-200 sm:col-span-2">
                    <span>Email</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
                    {errors.email ? <span className="text-rose-300">{errors.email}</span> : null}
                  </label>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button type="button" onClick={handleBack} disabled={step === 1} className="rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-40">Back</button>
              {step < 3 ? (
                <button type="button" onClick={handleNext} className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">Continue</button>
              ) : (
                <button type="submit" disabled={submitting} className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Sending…" : "Send Quote Request"}</button>
              )}
            </div>
          </section>

          <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
            <div>
              <h2 className="text-xl font-semibold text-white">Live booking summary</h2>
              <p className="text-sm text-slate-300">Your quote updates instantly as you choose the date, time, and service.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200">
              <div className="flex items-center justify-between"><span>Service</span><strong>{service?.name || "Selected service"}</strong></div>
              <div className="mt-2 flex items-center justify-between"><span>Quantity</span><strong>{quantity}</strong></div>
              <div className="mt-2 flex items-center justify-between"><span>Duration</span><strong>{service?.duration || 0} min</strong></div>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-sm text-cyan-100">Quote status</p>
              <p className="mt-1 text-xl font-semibold text-white">Pending quote review</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300 space-y-2">
              <p><strong>Date:</strong> {scheduledDate || "—"}</p>
              <p><strong>Time:</strong> {TIME_SLOTS.find((slot) => slot.value === scheduledTime)?.label || scheduledTime || "—"}</p>
              <p><strong>Availability:</strong> {selectedAvailability?.status === "full" ? "Fully booked" : selectedAvailability?.status === "limited" ? "Limited availability" : "Open"}</p>
              <p><strong>Address:</strong> {address || "—"}</p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              <p className="font-semibold">Why this date works</p>
              <p className="mt-1">{selectedAvailability?.bookings ? `${selectedAvailability.bookings} existing bookings on this date.` : "No bookings have been placed on this date yet."}</p>
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}
