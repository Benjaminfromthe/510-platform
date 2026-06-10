"use client";

import { useEffect, useMemo, useState } from "react";
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

type AddOn = {
  id: string;
  label: string;
  price: number;
};

const addOns: AddOn[] = [
  { id: "polish", label: "Furniture polish", price: 2500 },
  { id: "deodorizer", label: "Eco deodorizer", price: 1800 },
  { id: "spot-treatment", label: "Spot treatment", price: 3200 },
];

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
});

function isSunday(value: string) {
  return new Date(value).getDay() === 0;
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-US") + " RWF";
}

export default function BookForm() {
  const searchParams = useSearchParams();
  const serviceId = Number(searchParams.get("serviceId") || 0);

  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
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

  const totalPrice = useMemo(() => {
    const base = service?.price || 0;
    const addOnTotal = addOns
      .filter((item) => selectedAddOns.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
    return (base * quantity) + addOnTotal;
  }, [quantity, selectedAddOns, service]);

  const minDate = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  }, []);

  const timeSlots = Array.from({ length: 10 }, (_, index) => `${index + 8}:00`);

  function validateStep(targetStep: number) {
    const localErrors: Record<string, string> = {};

    if (targetStep === 1) {
      if (!service) localErrors.service = "Please select a valid service.";
      if (quantity < 1) localErrors.quantity = "Quantity must be at least 1.";
    }

    if (targetStep === 2) {
      if (!scheduledDate) localErrors.scheduledDate = "Choose a booking date.";
      if (scheduledDate && isSunday(scheduledDate)) localErrors.scheduledDate = "Sundays are unavailable.";
      if (!scheduledTime) localErrors.scheduledTime = "Choose a time slot.";
      if (!address.trim()) localErrors.address = "Address is required.";
    }

    if (targetStep === 3) {
      const parsed = bookingSchema.safeParse({
        serviceId,
        quantity,
        addOns: selectedAddOns,
        scheduledDate,
        scheduledTime,
        address,
        notes,
        customerName,
        phone,
        email,
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
          addOns: selectedAddOns,
          scheduledDate,
          scheduledTime,
          address,
          notes,
          customerName,
          phone,
          email,
          totalPrice,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Booking failed.");

      setSuccessMessage(`Booking confirmed for ${service?.name || "your selected service"}.`);
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
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Book a service</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl">Three simple steps to confirm your booking</h1>
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

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Step 1 — Service Details</h2>
                  <p className="text-slate-300">Choose the quantity and optional add-ons for your selected service.</p>
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
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">{formatCurrency(service.price)}</span>
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

                <div>
                  <p className="mb-2 text-sm text-slate-200">Optional add-ons</p>
                  <div className="grid gap-3">
                    {addOns.map((item) => (
                      <label key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100">
                        <span className="flex items-center gap-3">
                          <input type="checkbox" checked={selectedAddOns.includes(item.id)} onChange={() => setSelectedAddOns((prev) => prev.includes(item.id) ? prev.filter((entry) => entry !== item.id) : [...prev, item.id])} />
                          {item.label}
                        </span>
                        <strong className="text-cyan-200">+ {formatCurrency(item.price)}</strong>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Step 2 — Schedule</h2>
                  <p className="text-slate-300">Choose a date, time, and your service address.</p>
                </div>

                <label className="space-y-1 text-sm text-slate-200">
                  <span>Date</span>
                  <input type="date" min={minDate} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
                  {errors.scheduledDate ? <span className="text-rose-300">{errors.scheduledDate}</span> : null}
                </label>

                <label className="space-y-1 text-sm text-slate-200">
                  <span>Time slot</span>
                  <select value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white">
                    {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                  {errors.scheduledTime ? <span className="text-rose-300">{errors.scheduledTime}</span> : null}
                </label>

                <label className="space-y-1 text-sm text-slate-200">
                  <span>Address</span>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g., Kacyiru, Kigali" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
                  {errors.address ? <span className="text-rose-300">{errors.address}</span> : null}
                </label>

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
                  <h2 className="text-2xl font-semibold text-white">Step 3 — Confirm & Pay</h2>
                  <p className="text-slate-300">Confirm the customer details and place the booking.</p>
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
                <button type="submit" disabled={submitting} className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Confirming…" : "Confirm Booking"}</button>
              )}
            </div>
          </section>

          <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
            <div>
              <h2 className="text-xl font-semibold text-white">Order summary</h2>
              <p className="text-sm text-slate-300">Review your selected package before confirming.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200">
              <div className="flex items-center justify-between">
                <span>Service</span>
                <strong>{service?.name || "Selected service"}</strong>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Quantity</span>
                <strong>{quantity}</strong>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Base price</span>
                <strong>{service ? formatCurrency(service.price * quantity) : "0 RWF"}</strong>
              </div>
              {selectedAddOns.length ? (
                <div className="mt-2 space-y-1 text-slate-300">
                  {selectedAddOns.map((id) => {
                    const item = addOns.find((entry) => entry.id === id);
                    return <div key={id} className="flex justify-between"><span>{item?.label}</span><strong className="text-cyan-200">+ {formatCurrency(item?.price || 0)}</strong></div>;
                  })}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-sm text-cyan-100">Estimated total</p>
              <p className="mt-1 text-3xl font-semibold text-white">{formatCurrency(totalPrice)}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
              <p><strong>Date:</strong> {scheduledDate || "—"}</p>
              <p className="mt-2"><strong>Time:</strong> {scheduledTime || "—"}</p>
              <p className="mt-2"><strong>Address:</strong> {address || "—"}</p>
            </div>
          </aside>
        </form>
      </section>
    </main>
  );
}
