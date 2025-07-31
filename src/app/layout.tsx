
import type { Metadata, Manifest } from 'next';
import { PT_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const ptSans = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display',
});

export const metadata: Metadata = {
  title: 'GoGhana Planner',
  description: 'Your trusted guide to Ghana, powered by local expertise. Get realistic budgets, authentic itineraries, and travel tips from a real Ghanaian perspective.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("font-body antialiased", ptSans.variable, playfairDisplay.variable)}>
        <div className="flex min-h-screen flex-col">
           <header className="container mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:py-6">
             <Link href="/">
                <Logo />
             </Link>
             <nav className="hidden items-center gap-2 sm:flex">
                <Button asChild variant="ghost">
                    <Link href="/">Home</Link>
                </Button>
                 <Button asChild variant="ghost">
                    <Link href="/events">Events</Link>
                </Button>
                <Button asChild variant="ghost">
                    <Link href="/planner">Planner</Link>
                </Button>
                <Button asChild variant="ghost">
                    <Link href="/drivers">Drivers</Link>
                </Button>
             </nav>
             <div className="sm:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <nav className="flex flex-col gap-6 pt-12 text-lg font-medium">
                            <SheetClose asChild>
                                <Link href="/">Home</Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/events">Events</Link>
                            </SheetClose>
                            <SheetClose asChild>
                                <Link href="/planner">Planner</Link>
                            </SheetClose>
                            <SheetClose asChild>
                                <Link href="/drivers">Drivers</Link>
                            </SheetClose>
                        </nav>
                    </SheetContent>
                </Sheet>
             </div>
           </header>
          <main className="flex-1">{children}</main>
          <footer className="container mx-auto max-w-5xl px-4 py-6 text-center text-sm text-muted-foreground">
            <p>© 2025 GoGhana Planner | Powered by LetVisitGhana.</p>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
