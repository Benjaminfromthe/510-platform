"use client";

import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CheckCircle2, Star } from "lucide-react";
import Link from "next/link";

const SERVICES = ["Laptop & Computer Cleaning", "Phone & Tablet Cleaning", "Other"];

export default function ReviewPage() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState(user?.fullName ?? "");
  const [service, setService] = useState(SERVICES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill name
  useState(() => {
    if (user?.fullName) setName(user.fullName);
  });

  if (!isLoaded) return null;

  if (!userId) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-8 shadow-2xl">
            <span className="text-4xl">⭐</span>
            <h1 className="mt-4 text-xl font-black text-[var(--text-primary)]">Sign in to leave a review</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">We want to make sure reviews come from real customers.</p>
            <div className="mt-5 flex flex-col gap-3">
              <a href="/sign-in?redirect_url=/review" className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 text-center hover:bg-cyan-300 transition">
                Sign In
              </a>
              <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-cyan-400">← Back to home</Link>
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
            <h1 className="mt-4 text-2xl font-black text-[var(--text-primary)]">Thank you! 🙏</h1>
            <p className="mt-2 text-[var(--text-secondary)]">Your review helps other students find us. We really appreciate it.</p>
            <div className="mt-5 flex flex-col gap-3">
              <Link href="/" className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 text-center hover:bg-cyan-300 transition">
                Back to home
              </Link>
              <Link href="/dashboard" className="text-sm text-[var(--text-secondary)] hover:text-cyan-400">
                View my bookings
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating."); return; }
    if (!name.trim() || name.trim().length < 2) { setError("Enter your name."); return; }
    if (!comment.trim() || comment.trim().length < 5) { setError("Write at least a short comment."); return; }

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          rating,
          comment: comment.trim(),
          serviceName: service,
          clerkUserId: userId ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <span className="text-4xl">⭐</span>
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Leave a Review</h1>
          <p className="text-sm text-[var(--text-secondary)]">How was your experience with 510 Cleaning?</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-5 shadow-xl">

          {/* Star rating */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--text-primary)]">Your rating</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-[var(--text-secondary)]"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-yellow-400 font-medium">
                {rating === 5 ? "Excellent! 🎉" : rating === 4 ? "Great! 👍" : rating === 3 ? "Good 👌" : rating === 2 ? "Could be better 😐" : "Not satisfied 😞"}
              </p>
            )}
          </div>

          {/* Service */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">Service you used</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {SERVICES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setService(s)}
                  className={`rounded-xl border px-3 py-2 text-sm transition ${
                    service === s
                      ? "border-cyan-500 bg-cyan-500/10 text-cyan-300 font-semibold"
                      : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-cyan-400"
                  }`}
                >
                  {s === "Laptop & Computer Cleaning" ? "💻 Laptop" : s === "Phone & Tablet Cleaning" ? "📱 Phone" : "Other"}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Benjamin"
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-cyan-500"
            />
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">Your comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="The cleaning was fast and my laptop looks brand new..."
              rows={4}
              maxLength={500}
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-cyan-500 resize-none"
            />
            <p className="text-xs text-[var(--text-secondary)] text-right">{comment.length}/500</p>
          </div>

          {error && <p className="rounded-xl bg-rose-500/10 border border-rose-400/30 px-4 py-3 text-sm text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Submitting…" : "Submit Review ⭐"}
          </button>
        </form>

        <Link href="/" className="block text-center text-sm text-[var(--text-secondary)] hover:text-cyan-400">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
