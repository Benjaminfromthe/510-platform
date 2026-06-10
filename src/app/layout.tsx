import React from 'react';
import './globals.css';

export const metadata = {
  title: '510 Platform',
  description: 'A platform built with Next.js 14, TypeScript, and Tailwind CSS',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;