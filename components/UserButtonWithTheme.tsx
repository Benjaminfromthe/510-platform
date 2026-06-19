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
        elements: {
          avatarBox: 'w-8 h-8',

          // Popover card — the dropdown container
          userButtonPopoverCard: isDark
            ? 'bg-[#0f172a] border border-[#1e293b] shadow-2xl shadow-black/60 rounded-xl'
            : 'bg-white border border-gray-200 shadow-2xl shadow-gray-300/40 rounded-xl',

          // User name / email inside dropdown header
          userPreviewMainIdentifier: isDark
            ? 'text-white font-semibold'
            : 'text-gray-900 font-semibold',

          userPreviewSecondaryIdentifier: isDark
            ? 'text-slate-400 text-sm'
            : 'text-gray-500 text-sm',

          userPreviewTextContainer: 'text-left',

          // Menu rows (Manage account, Sign out, etc.)
          menuItem: isDark
            ? 'text-slate-200 hover:bg-slate-800 hover:text-white focus:bg-slate-800 rounded-lg transition-colors'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 rounded-lg transition-colors',

          menuItemButton: isDark
            ? 'text-slate-200 hover:bg-slate-800 hover:text-white focus:bg-slate-800 rounded-lg transition-colors'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 rounded-lg transition-colors',

          menuItemIcon: isDark ? 'text-slate-400' : 'text-gray-500',

          dividerLine: isDark ? 'bg-slate-700' : 'bg-gray-200',

          profileSectionTitle: isDark
            ? 'text-slate-400 text-xs uppercase tracking-wider'
            : 'text-gray-500 text-xs uppercase tracking-wider',

          profileSectionPrimaryButton: isDark
            ? 'text-slate-200 hover:bg-slate-800 hover:text-white rounded-lg'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg',

          // The card that wraps everything inside the popover
          card: isDark
            ? 'bg-[#0f172a] border-[#1e293b]'
            : 'bg-white border-gray-200',
        },
      }}
    />
  );
}
