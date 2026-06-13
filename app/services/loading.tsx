"use client";

export default function ServicesLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded bg-slate-800 shimmer-card" />
          <div className="h-10 w-72 rounded bg-slate-800 shimmer-card" />
          <div className="h-4 w-96 rounded bg-slate-800 shimmer-card" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <article key={index} className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/20">
              <div className="h-36 rounded-2xl shimmer-card" />
              <div className="mt-4 h-5 w-2/3 rounded bg-slate-800 shimmer-card" />
              <div className="mt-3 h-4 w-full rounded bg-slate-800 shimmer-card" />
              <div className="mt-2 h-4 w-5/6 rounded bg-slate-800 shimmer-card" />
              <div className="mt-4 h-10 rounded-xl bg-slate-800 shimmer-card" />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
