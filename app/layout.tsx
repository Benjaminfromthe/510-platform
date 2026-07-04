import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import AIAssistant from '../components/AIAssistant';
import MoMoTicker from '../components/MoMoTicker';
import PageNav from '../components/PageNav';
import Providers from '../components/Providers';
import ToastProvider from '../components/ToastProvider';
import WhatsAppFloat from '../components/WhatsAppFloat';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '510 | Professional Cleaning Services Kigali',
  description: 'Book professional foam cleaning for electronics and furniture in Kigali, Rwanda. We come to you.',
  keywords: ['cleaning services kigali', 'foam cleaning', 'electronics cleaning rwanda', 'furniture cleaning'],
  openGraph: {
    title: '510 | Professional Cleaning Services Kigali',
    description: 'Book professional foam cleaning for electronics and furniture in Kigali, Rwanda. We come to you.',
    url: 'https://510.rw',
    siteName: '510 Cleaning Services',
    images: [],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '510 | Professional Cleaning Services Kigali',
    description: 'Book professional foam cleaning for electronics and furniture in Kigali, Rwanda. We come to you.',
    images: [],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased" style={{ fontFamily: 'var(--font-inter), Arial, sans-serif' }}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ClerkProvider>
            <ToastProvider>
              <Providers>
                {/* Global background — clean modern interior, specific to cleaning business */}
                <div
                  className="fixed inset-0 -z-10"
                  aria-hidden="true"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=60')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* Dark mode overlay — deep navy tint */}
                  <div className="absolute inset-0 hidden dark:block" style={{ backgroundColor: 'rgba(10,15,30,0.93)' }} />
                  {/* Light mode overlay — clean white tint */}
                  <div className="absolute inset-0 dark:hidden" style={{ backgroundColor: 'rgba(248,250,252,0.93)' }} />
                </div>
                <MoMoTicker />
                <PageNav />
                {children}
                <WhatsAppFloat />
                <AIAssistant />
              </Providers>
            </ToastProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
