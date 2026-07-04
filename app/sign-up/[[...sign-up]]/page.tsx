import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] p-6 text-[var(--text-primary)]">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center rounded-3xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-2xl shadow-black/20">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Create your account</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">Start booking in minutes</h1>
          <p className="mt-3 text-[var(--text-secondary)]">Sign up to save your bookings, manage scheduling, and access your protected dashboard.</p>
          <div className="mt-8 flex justify-center">
            <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
          </div>
        </div>
      </section>
    </main>
  );
}
