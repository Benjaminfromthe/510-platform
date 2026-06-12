import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import AIAssistant from '../components/AIAssistant';
import Providers from '../components/Providers';
import ToastProvider from '../components/ToastProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        <ClerkProvider>
          <ToastProvider>
            <Providers>
              {children}
              <AIAssistant />
            </Providers>
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
