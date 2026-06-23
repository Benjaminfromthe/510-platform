'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, RotateCw, Home } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import UserButtonWithTheme from './UserButtonWithTheme';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';

// Pages that have their own full navbar — PageNav should NOT render on these
const PAGES_WITH_OWN_NAV = ['/'];

export default function PageNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');

  // Don't render on homepage — it has its own full navbar
  if (PAGES_WITH_OWN_NAV.includes(pathname)) return null;

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">

        {/* Left — navigation controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-cyan-400 hover:text-cyan-500"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => router.forward()}
            aria-label="Go forward"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-cyan-400 hover:text-cyan-500"
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => router.refresh()}
            aria-label="Refresh page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-cyan-400 hover:text-cyan-500"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          <Link
            href="/"
            aria-label="Go home"
            className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-cyan-400 hover:text-cyan-500"
          >
            <Home className="h-4 w-4" />
          </Link>
        </div>

        {/* Center — brand + page links */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-black tracking-tight text-[var(--text-primary)] dark:text-cyan-300">
            510
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
            <Link href="/services" className={`rounded-full px-3 py-1.5 text-sm transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] ${pathname === '/services' ? 'bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 font-medium' : 'text-[var(--text-secondary)]'}`}>
              {t('services')}
            </Link>
            <Link href="/book" className={`rounded-full px-3 py-1.5 text-sm transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] ${pathname === '/book' ? 'bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 font-medium' : 'text-[var(--text-secondary)]'}`}>
              {t('bookNow')}
            </Link>
            <Link href="/dashboard" className={`rounded-full px-3 py-1.5 text-sm transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] ${pathname === '/dashboard' ? 'bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 font-medium' : 'text-[var(--text-secondary)]'}`}>
              {t('myBookings')}
            </Link>
          </div>
        </div>

        {/* Right — theme, language, auth */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <SignedIn>
            <UserButtonWithTheme />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="hidden rounded-full border border-[var(--border-color)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:border-cyan-400 hover:text-[var(--text-primary)] sm:inline-flex">
                {t('signIn')}
              </button>
            </SignInButton>
          </SignedOut>
        </div>

      </div>
    </nav>
  );
}
