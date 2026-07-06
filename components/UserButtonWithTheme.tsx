'use client';

import { UserButton as ClerkUserButton } from '@clerk/nextjs';

export default function UserButtonWithTheme() {
  return (
    <ClerkUserButton
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorBackground: '#1e293b',
          colorText: '#f1f5f9',
          colorTextSecondary: '#cbd5e1',
          colorInputBackground: '#0f172a',
          colorInputText: '#f1f5f9',
          colorPrimary: '#22d3ee',
          borderRadius: '12px',
        },
        elements: {
          avatarBox: 'w-8 h-8',
          userButtonPopoverCard: 'shadow-2xl shadow-black/70',
          menuItemButton: '!text-slate-200 hover:!bg-slate-700 hover:!text-white font-medium',
          menuItemIcon: '!text-slate-400',
          dividerLine: '!bg-slate-600',
          userPreviewMainIdentifier: '!text-white font-semibold',
          userPreviewSecondaryIdentifier: '!text-slate-300 text-sm',
        },
      }}
    />
  );
}
