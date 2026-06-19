'use client';

import { UserButton as ClerkUserButton } from '@clerk/nextjs';
import { useTheme } from 'next-themes';

export default function UserButtonWithTheme() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <ClerkUserButton
      afterSignOutUrl="/"
      appearance={{
        // variables map directly to Clerk's internal CSS tokens — highest specificity
        variables: isDark
          ? {
              colorBackground: '#1e293b',      // slate-800: clearly visible dark card
              colorText: '#f1f5f9',             // slate-100: bright readable text
              colorTextSecondary: '#94a3b8',    // slate-400: email / secondary text
              colorInputBackground: '#0f172a',  // darker input bg
              colorInputText: '#f1f5f9',
              borderRadius: '12px',
            }
          : {
              colorBackground: '#ffffff',
              colorText: '#0f172a',
              colorTextSecondary: '#64748b',
              colorInputBackground: '#f8fafc',
              colorInputText: '#0f172a',
              borderRadius: '12px',
            },
        elements: {
          avatarBox: 'w-8 h-8',
          userButtonPopoverCard: isDark
            ? 'shadow-2xl shadow-black/70'
            : 'shadow-xl shadow-gray-300/50',
        },
      }}
    />
  );
}
