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
        variables: isDark
          ? {
              colorBackground: '#1e293b',
              colorText: '#f1f5f9',
              colorTextSecondary: '#cbd5e1',
              colorInputBackground: '#0f172a',
              colorInputText: '#f1f5f9',
              colorPrimary: '#22d3ee',
              borderRadius: '12px',
            }
          : {
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
          // Force text colors on every element that shows text
          userPreviewMainIdentifier: isDark ? '!text-white font-semibold' : '!text-gray-900 font-semibold',
          userPreviewSecondaryIdentifier: isDark ? '!text-slate-300 text-sm' : '!text-gray-500 text-sm',
          menuItemButton: isDark
            ? '!text-slate-100 hover:!bg-slate-700 hover:!text-white font-medium'
            : '!text-gray-700 hover:!bg-gray-100 hover:!text-gray-900 font-medium',
          menuItemIcon: isDark ? '!text-slate-400' : '!text-gray-400',
          dividerLine: isDark ? '!bg-slate-600' : '!bg-gray-200',
          footerActionText: isDark ? '!text-slate-400 text-xs' : '!text-gray-400 text-xs',
          footerActionLink: isDark ? '!text-cyan-400 text-xs' : '!text-blue-600 text-xs',
        },
      }}
    />
  );
}
