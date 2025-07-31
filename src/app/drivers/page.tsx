
'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import drivers from '@/data/drivers.json';

const DriverProfileCard = dynamic(() => import('@/components/driver-profile-card'), {
    suspense: true,
});

const DriverSkeleton = () => (
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-6">
        <Skeleton className="h-6 w-1/2 rounded" />
        <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
        </div>
        <div className="space-y-4 pt-4">
            <Skeleton className="h-5 w-1/3 rounded" />
            <Skeleton className="h-11 w-full rounded-md" />
        </div>
    </div>
)

export default function DriversPage() {
  return (
    <main className="flex-1">
      <div className="bg-muted py-12 sm:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
            <h1 className="font-headline text-3xl font-bold sm:text-4xl">
                Connect with a Trusted Local Driver
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Travel with confidence. Our vetted drivers are more than just transport—they're your personal guides to experiencing the real Ghana at a fair, negotiated price.
            </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <Button asChild variant="outline" className="mb-8">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
            </Link>
        </Button>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {drivers.map(driver => (
                <Suspense key={driver.id} fallback={<DriverSkeleton />}>
                    <DriverProfileCard {...driver} />
                </Suspense>
            ))}
        </div>

         <div className="mt-16 rounded-lg bg-primary/5 p-8 text-center">
            <h2 className="font-headline text-2xl font-bold">Are You a Driver?</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              If you're a professional, reliable driver with a deep knowledge of Ghana and a passion for tourism, we'd love to hear from you. Join our trusted network.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="https://wa.me/233200635250" target="_blank">
                <UserPlus className="shrink-0" />
                Apply to Join
              </Link>
            </Button>
        </div>
      </div>
    </main>
  );
}
