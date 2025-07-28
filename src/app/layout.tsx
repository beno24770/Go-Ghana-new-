import type { Metadata } from 'next';
import { PT_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Logo } from '@/components/logo';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
});

export const metadata: Metadata = {
  title: 'GoGhana Planner',
  description: 'Your AI-powered guide to planning the perfect trip to Ghana. Estimate budgets, generate itineraries, and get personalized packing lists and language guides.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("font-body antialiased", ptSans.variable, playfairDisplay.variable)}>
        <div className="flex min-h-screen flex-col">
           <header className="container mx-auto max-w-5xl px-4 py-6">
             <Link href="/">
                <Logo />
             </Link>
           </header>
          {children}
          <footer className="container mx-auto max-w-5xl px-4 py-6 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} GoGhana Planner. All rights reserved.</p>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
