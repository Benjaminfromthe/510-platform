"use client";

export default function BookLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
            <div className="h-4 w-28 rounded bg-slate-800 shimmer-card" />
            <div className="mt-4 h-8 w-2/3 rounded bg-slate-800 shimmer-card" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 rounded-2xl bg-slate-800 shimmer-card" />
              ))}
            </div>
          </article>
          <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
            <div className="h-4 w-32 rounded bg-slate-800 shimmer-card" />
            <div className="mt-4 h-28 rounded-2xl bg-slate-800 shimmer-card" />
            <div className="mt-4 h-10 rounded-xl bg-slate-800 shimmer-card" />
          </aside>
        </div>
      </section>
    </main>
  );
}
