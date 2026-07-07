"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

type Review = {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  serviceName: string;
  createdAt: string;
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  const t = useTranslations("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(Array.isArray(d.reviews) ? d.reviews.slice(0, 6) : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return t("today");
    if (days === 1) return t("yesterday");
    if (days < 7) return t("daysAgo", { days });
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return t("weekAgo");
    if (weeks < 5) return t("weeksAgo", { weeks });
    const months = Math.floor(days / 30);
    if (months === 1) return t("monthAgo");
    return t("monthsAgo", { months });
  }

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">{t("eyebrow")}</p>
          <h2 className="mt-1 text-2xl font-black text-[var(--text-primary)]">
            {t("title")}
            {avgRating && (
              <span className="ml-3 text-lg font-bold text-yellow-400">⭐ {avgRating}</span>
            )}
          </h2>
        </div>
        <Link
          href="/review"
          className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition"
        >
          {t("leaveReview")}
        </Link>
      </div>

      {/* Reviews grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 animate-pulse">
              <div className="h-4 w-20 rounded bg-[var(--bg-secondary)]" />
              <div className="mt-3 h-3 w-full rounded bg-[var(--bg-secondary)]" />
              <div className="mt-2 h-3 w-3/4 rounded bg-[var(--bg-secondary)]" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] p-8 text-center">
          <p className="text-[var(--text-secondary)]">{t("noReviews")}</p>
          <Link href="/review" className="mt-3 inline-flex rounded-full bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition">
            {t("writeReview")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{review.customerName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{review.serviceName}</p>
                </div>
                <p className="text-xs text-[var(--text-secondary)] shrink-0">{timeAgo(review.createdAt)}</p>
              </div>
              <StarDisplay rating={review.rating} />
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
