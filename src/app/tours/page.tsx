
'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import tours from '@/data/tours.json';
import { TourCard } from '@/components/tour-card';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const TourSkeleton = () => (
    <div className="flex flex-col rounded-lg border bg-card shadow-sm">
        <Skeleton className="h-52 w-full rounded-t-lg" />
        <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4 rounded" />
            <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-11 w-full rounded-md mt-4" />
        </div>
    </div>
);

export default function ToursPage() {
  return (
    <main className="flex-1">
      <div className="bg-muted py-12 sm:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
            <h1 className="font-headline text-3xl font-bold sm:text-4xl">
                Our Curated Tours
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Explore our hand-picked selection of tours, designed to offer the best of Ghana at unbeatable prices. When you're ready, book securely on our dedicated tour website.
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
            {tours.map(tour => (
                 <Suspense key={tour.id} fallback={<TourSkeleton />}>
                    <TourCard {...tour} />
                </Suspense>
            ))}
        </div>
      </div>
    </main>
  );
}
