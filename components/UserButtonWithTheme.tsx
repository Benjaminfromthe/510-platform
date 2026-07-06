'use client';

import { UserButton as ClerkUserButton } from '@clerk/nextjs';

// Campus version — always white card (light mode) since we use white cards everywhere
export default function UserButtonWithTheme() {
  return (
    <ClerkUserButton
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorBackground: '#ffffff',
          colorText: '#0f172a',
          colorTextSecondary: '#64748b',
          colorInputBackground: '#f8fafc',
          colorInputText: '#0f172a',
          colorPrimary: '#0891b2',
          borderRadius: '12px',
        },
        elements: {
          avatarBox: 'w-8 h-8',
          userButtonPopoverCard: 'shadow-xl shadow-black/10',
          menuItemButton: '!text-slate-700 hover:!bg-slate-100 hover:!text-slate-900 font-medium',
          menuItemIcon: '!text-slate-500',
          dividerLine: '!bg-slate-200',
          userPreviewMainIdentifier: '!text-slate-900 font-semibold',
          userPreviewSecondaryIdentifier: '!text-slate-500 text-sm',
        },
      }}
    />
  );
}
