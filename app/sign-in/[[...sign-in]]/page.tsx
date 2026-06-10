import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Secure sign in</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Welcome back</h1>
          <p className="mt-3 text-slate-300">Sign in to manage your bookings and access the protected dashboard.</p>
          <div className="mt-8 flex justify-center">
            <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
          </div>
        </div>
      </section>
    </main>
  );
}
