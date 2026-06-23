'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, RotateCw, Home, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import UserButtonWithTheme from './UserButtonWithTheme';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';

const PAGES_WITH_OWN_NAV = ['/'];

export default function PageNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');
  const [menuOpen, setMenuOpen] = useState(false);

  if (PAGES_WITH_OWN_NAV.includes(pathname)) return null;

  const navLinks = [
    { href: '/services', label: t('services') },
    { href: '/book', label: t('bookNow') },
    { href: '/dashboard', label: t('myBookings') },
    { href: '/subscriptions', label: t('subscriptions') },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-[var(--border-color)] bg-[var(--bg-primary)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">

          {/* Left — nav arrows + home */}
          <div className="flex items-center gap-1 shrink-0">
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
              aria-label="Refresh"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-cyan-400 hover:text-cyan-500"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <Link
              href="/"
              aria-label="Home"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] transition hover:border-cyan-400 hover:text-cyan-500"
            >
              <Home className="h-4 w-4" />
            </Link>
          </div>

          {/* Center — brand + desktop links */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-black tracking-tight text-[var(--text-primary)] dark:text-cyan-300">
              510
            </Link>
            <div className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-sm transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] ${
                    pathname === link.href
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-medium'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right — theme, language, auth, mobile menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle />
            <LanguageSwitcher />
            {/* Auth — always visible on all screen sizes */}
            <SignedIn>
              <UserButtonWithTheme />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition">
                  {t('signIn')}
                </button>
              </SignInButton>
            </SignedOut>
            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((p) => !p)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] lg:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="border-t border-[var(--border-color)] bg-[var(--bg-primary)]/98 px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    pathname === link.href
                      ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
