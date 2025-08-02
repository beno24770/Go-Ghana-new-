
'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import tours from '@/data/tours.json';
import { TourCard } from '@/components/tour-card';
import { Suspense, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tour } from '@/lib/types';
import { Card } from '@/components/ui/card';
import dynamic from 'next/dynamic';

const TourItineraryDialog = dynamic(() => import('@/components/tour-itinerary-dialog').then(mod => mod.TourItineraryDialog), {
    suspense: true,
});

const TourSkeleton = () => (
    <div className="flex flex-col rounded-lg border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-6 w-3/4 rounded" />
        <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-5 w-20 rounded" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
        </div>
        <Skeleton className="h-11 w-full rounded-md pt-4" />
    </div>
);

const durationFilters = ["All", "1 Day", "2-3 Days", "4+ Days"];
const priceFilters = ["All", "Under $200", "$200 - $400", "$400+"];

export default function ToursPage() {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeDuration, setActiveDuration] = useState("All");
  const [activePrice, setActivePrice] = useState("All");

  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
        // Duration Filter
        const durationMatch = (() => {
            if (activeDuration === "All") return true;
            if (activeDuration === "1 Day") return tour.duration === "1 Day";
            if (activeDuration === "2-3 Days") return tour.duration.includes("2") || tour.duration.includes("3");
            if (activeDuration === "4+ Days") return !tour.duration.includes("1") && !tour.duration.includes("2") && !tour.duration.includes("3");
            return false;
        })();

        // Price Filter
        const priceMatch = (() => {
            if (activePrice === "All") return true;
            if (activePrice === "Under $200") return tour.priceValue < 200;
            if (activePrice === "$200 - $400") return tour.priceValue >= 200 && tour.priceValue <= 400;
            if (activePrice === "$400+") return tour.priceValue > 400;
            return false;
        })();

        return durationMatch && priceMatch;
    });
  }, [activeDuration, activePrice]);


  return (
    <main className="flex-1">
      <div className="bg-muted py-12 sm:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
            <h1 className="font-headline text-3xl font-bold sm:text-4xl">
                Cheap Tour Deals
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Explore our hand-picked selection of tours, designed to offer the best of Ghana at unbeatable prices. When you're ready, book securely with a real person via WhatsApp.
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

        <Card className="mb-12 bg-muted/50 p-6">
            <h3 className="flex items-center font-headline text-xl mb-4"><Filter className="mr-2 h-5 w-5"/> Filter Tours</h3>
            <div className="space-y-4">
                <div>
                    <p className="mb-2 text-sm font-semibold">By Duration</p>
                    <div className="flex flex-wrap gap-2">
                        {durationFilters.map(filter => (
                            <Button key={filter} variant={activeDuration === filter ? 'default' : 'outline'} onClick={() => setActiveDuration(filter)}>
                                {filter}
                            </Button>
                        ))}
                    </div>
                </div>
                 <div>
                    <p className="mb-2 text-sm font-semibold">By Price</p>
                    <div className="flex flex-wrap gap-2">
                        {priceFilters.map(filter => (
                            <Button key={filter} variant={activePrice === filter ? 'default' : 'outline'} onClick={() => setActivePrice(filter)}>
                                {filter}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </Card>

        {filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {filteredTours.map((tour: Tour) => (
                    <Suspense key={tour.id} fallback={<TourSkeleton />}>
                        <TourCard tour={tour} onSelectTour={setSelectedTour} />
                    </Suspense>
                ))}
            </div>
        ) : (
             <div className="text-center py-16">
                <p className="text-lg font-semibold">No Tours Found</p>
                <p className="text-muted-foreground">Try adjusting your filters to find more deals.</p>
            </div>
        )}

      </div>
       <Suspense>
        {selectedTour && (
            <TourItineraryDialog
                tour={selectedTour}
                open={!!selectedTour}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setSelectedTour(null);
                    }
                }}
            />
        )}
      </Suspense>
    </main>
  );
}
