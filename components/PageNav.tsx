'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, RotateCw, Home, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
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
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(10,15,30,0.92)] backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-2 sm:px-6">

          {/* Left — back + logo only on mobile */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-cyan-400 hover:text-cyan-500"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Refresh + Home — hidden on mobile to save space */}
            <button
              type="button"
              onClick={() => router.refresh()}
              aria-label="Refresh"
              className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-cyan-400 hover:text-cyan-500"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            <Link
              href="/"
              aria-label="Home"
              className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-cyan-400 hover:text-cyan-500"
            >
              <Home className="h-4 w-4" />
            </Link>

            <Link href="/" className="text-lg font-black tracking-tight text-[var(--text-primary)] dark:text-cyan-300">
              510
            </Link>

            {/* Desktop page links */}
            <div className="hidden lg:flex items-center gap-1 ml-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-sm transition hover:bg-[var(--bg-secondary)] ${
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

          {/* Right — compact on mobile */}
          <div className="flex items-center gap-1.5">
            {/* Language switcher */}
            <div className="hidden xs:block">
              <LanguageSwitcher />
            </div>

            {/* Auth */}
            <SignedIn>
              <UserButtonWithTheme />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-full bg-cyan-400 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-300 transition whitespace-nowrap">
                  {t('signIn')}
                </button>
              </SignInButton>
            </SignedOut>

            {/* Hamburger — shows on all non-desktop */}
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setMenuOpen((p) => !p)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] lg:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="border-t border-white/10 bg-[rgba(10,15,30,0.95)] px-3 py-3 lg:hidden">
            {/* Language switcher in mobile menu */}
            <div className="mb-2 xs:hidden">
              <LanguageSwitcher />
            </div>
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
              {/* Refresh + Home in mobile menu */}
              <div className="mt-2 flex gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={() => { router.refresh(); setMenuOpen(false); }}
                  className="flex-1 rounded-xl border border-[var(--border-color)] py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] flex items-center justify-center gap-2"
                >
                  <RotateCw className="h-4 w-4" /> Refresh
                </button>
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-xl border border-[var(--border-color)] py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" /> Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
