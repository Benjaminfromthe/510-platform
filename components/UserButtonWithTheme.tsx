'use client';

import { UserButton as ClerkUserButton } from '@clerk/nextjs';
import { useTheme } from 'next-themes';

export default function UserButtonWithTheme() {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme === 'dark';

  return (
    <ClerkUserButton
      afterSignOutUrl="/"
      appearance={
        isDarkTheme
          ? {
              elements: {
                avatarBox: 'w-8 h-8',
                card: 'bg-gray-950 border border-gray-700 shadow-2xl shadow-black/50',
                userButtonPopoverCard:
                  'bg-gray-950 border border-gray-700 shadow-2xl shadow-black/50 rounded-lg',
                userPreviewMainIdentifier: 'text-white font-semibold',
                userPreviewSecondaryIdentifier: 'text-gray-400 text-sm',
                userPreviewTextContainer: 'text-left',
                menuItem:
                  'text-gray-100 hover:bg-gray-800 focus:bg-gray-800 transition-colors duration-150',
                menuItemButton:
                  'text-gray-100 hover:bg-gray-800 focus:bg-gray-800 transition-colors duration-150',
                menuItemIcon: 'text-gray-400',
                dividerLine: 'bg-gray-700',
                profileSectionTitle: 'text-gray-300 text-xs uppercase tracking-wider',
                profileSectionPrimaryButton:
                  'text-gray-100 hover:bg-gray-800 focus:bg-gray-800',
              },
            }
          : {
              elements: {
                avatarBox: 'w-8 h-8',
                card: 'bg-white border border-gray-300 shadow-2xl shadow-gray-400/30',
                userButtonPopoverCard:
                  'bg-white border border-gray-300 shadow-2xl shadow-gray-400/30 rounded-lg',
                userPreviewMainIdentifier: 'text-gray-900 font-semibold',
                userPreviewSecondaryIdentifier: 'text-gray-500 text-sm',
                userPreviewTextContainer: 'text-left',
                menuItem:
                  'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 transition-colors duration-150',
                menuItemButton:
                  'text-gray-700 hover:bg-gray-100 focus:bg-gray-100 transition-colors duration-150',
                menuItemIcon: 'text-gray-500',
                dividerLine: 'bg-gray-200',
                profileSectionTitle: 'text-gray-600 text-xs uppercase tracking-wider',
                profileSectionPrimaryButton:
                  'text-gray-700 hover:bg-gray-100 focus:bg-gray-100',
              },
            }
      }
    />
  );
}
