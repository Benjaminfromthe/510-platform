"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { GraduationCap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function StudentPage() {
  const t = useTranslations("student");
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [university, setUniversity] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [verifiedUniversity, setVerifiedUniversity] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.replace("/sign-in?redirect_url=/student");
      return;
    }
    // Check if already a student
    const meta = (user?.publicMetadata ?? {}) as Record<string, unknown>;
    if (meta.isStudent === true) {
      setAlreadyVerified(true);
      setVerifiedUniversity(String(meta.university ?? ""));
    }
  }, [isLoaded, userId, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!university.trim()) { setError(t("errorUniversity")); return; }
    if (!agreed) { setError(t("errorAgree")); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ university: university.trim(), agreed: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      // Reload user to get updated metadata
      await user?.reload();
      setAlreadyVerified(true);
      setVerifiedUniversity(university.trim());
      // Redirect to book after 1.5s
      setTimeout(() => router.push("/book"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneral"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-12 sm:px-6">

        <header className="space-y-3 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-500 mx-auto">
            <GraduationCap className="h-8 w-8" />
          </span>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{t("eyebrow")}</p>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">{t("title")}</h1>
          <p className="text-[var(--text-secondary)]">{t("subtitle")}</p>
        </header>

        {/* Discount highlight */}
        <div className="rounded-2xl border-2 border-cyan-400/40 bg-cyan-400/10 p-5 text-center">
          <p className="text-4xl font-black text-cyan-500">10%</p>
          <p className="mt-1 font-semibold text-[var(--text-primary)]">{t("discountLabel")}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{t("discountNote")}</p>
        </div>

        {alreadyVerified ? (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{t("alreadyVerified")}</h2>
            <p className="text-[var(--text-secondary)]">{verifiedUniversity}</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-300 font-medium">{t("discountActive")}</p>
            <Link href="/book" className="mt-4 inline-flex rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
              {t("bookNow")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 space-y-5 shadow-xl">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-primary)]" htmlFor="university">
                {t("universityLabel")}
              </label>
              <input
                id="university"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder={t("universityPlaceholder")}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-secondary)] outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-400 accent-cyan-500"
              />
              <span className="text-sm text-[var(--text-secondary)]">{t("agreeText")}</span>
            </label>

            {error && <p className="text-sm text-rose-500 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {submitting ? t("verifying") : t("verifyButton")}
            </button>

            <p className="text-xs text-[var(--text-secondary)] text-center">{t("disclaimer")}</p>
          </form>
        )}

        <Link href="/services" className="text-center text-sm text-[var(--text-secondary)] hover:text-cyan-500">
          {t("skipLink")}
        </Link>

      </section>
    </main>
  );
}
