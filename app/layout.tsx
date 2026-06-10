import { ClerkProvider } from '@clerk/nextjs';
import '../src/app/globals.css';
import AIAssistant from '../components/AIAssistant';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        <ClerkProvider>
          {children}
          <AIAssistant />
        </ClerkProvider>
      </body>
    </html>
  );
}
