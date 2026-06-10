import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-20 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-semibold tracking-tight text-white">510 Platform</Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/services" className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-cyan-400 hover:text-white">Services</Link>
            <Link href="/book" className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-cyan-400 hover:text-white">Book now</Link>
            <Link href="/dashboard" className="rounded-full border border-slate-700 px-3 py-2 text-slate-200 hover:border-cyan-400 hover:text-white">My bookings</Link>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-full border border-slate-700 px-4 py-2 font-semibold text-slate-100 hover:border-cyan-400 hover:text-white">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300">Create account</button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </nav>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-7xl flex-col justify-center gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Clerk-enabled booking portal</p>
          <h1 className="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">Book premium cleaning services with secure sign-in and protected dashboards.</h1>
          <p className="max-w-2xl text-lg text-slate-300">Browse our catalogue, create bookings, and manage your account with Clerk authentication and Prisma-backed data.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Browse services", "/services"],
            ["Start a booking", "/book"],
            ["Go to dashboard", "/dashboard"],
          ].map(([label, href]) => (
            <Link
              key={label}
              href={href as string}
              className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-400/70"
            >
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Quick link</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{label}</h2>
              <p className="mt-2 text-sm text-slate-300">Open the related area of the platform.</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
