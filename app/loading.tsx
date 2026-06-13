"use client";

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl shadow-black/20">
          <div className="h-4 w-32 rounded bg-[var(--bg-secondary)] shimmer-card" />
          <div className="mt-4 h-10 w-72 rounded bg-[var(--bg-secondary)] shimmer-card" />
          <div className="mt-3 h-4 w-96 rounded bg-[var(--bg-secondary)] shimmer-card" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <article key={index} className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-2xl shadow-black/20">
              <div className="h-36 rounded-2xl bg-[var(--bg-secondary)] shimmer-card" />
              <div className="mt-4 h-5 w-2/3 rounded bg-[var(--bg-secondary)] shimmer-card" />
              <div className="mt-3 h-4 w-full rounded bg-[var(--bg-secondary)] shimmer-card" />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
