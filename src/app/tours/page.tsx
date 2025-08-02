
'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Bed, Filter, Hotel } from 'lucide-react';
import Link from 'next/link';
import toursData from '@/data/tours.json';
import accommodationsData from '@/data/accommodations.json';
import { TourCard } from '@/components/tour-card';
import { Suspense, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tour } from '@/lib/types';
import { Card } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { Separator } from '@/components/ui/separator';
import { AccommodationCard } from '@/components/accommodation-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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

const AccommodationSkeleton = () => (
    <div className="flex flex-col rounded-lg border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
         <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="pt-4 px-1">
            <Skeleton className="h-11 w-full rounded-md" />
        </div>
    </div>
);


const durationFilters = ["All", "1 Day", "2-3 Days", "4+ Days"];
const priceFilters = ["All", "Under $200", "$200 - $400", "$400+"];
const allRegions = ["All", ...new Set(accommodationsData.map(item => item.region))].sort();
const travelStyles = ["All", "Budget", "Mid-range", "Luxury"];

export default function ToursPage() {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeDuration, setActiveDuration] = useState("All");
  const [activePrice, setActivePrice] = useState("All");

  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedStyle, setSelectedStyle] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTours = useMemo(() => {
    return toursData.filter(tour => {
        const durationMatch = (() => {
            if (activeDuration === "All") return true;
            if (activeDuration === "1 Day") return tour.duration === "1 Day";
            if (activeDuration === "2-3 Days") return tour.duration.includes("2") || tour.duration.includes("3");
            if (activeDuration === "4+ Days") return !tour.duration.includes("1") && !tour.duration.includes("2") && !tour.duration.includes("3");
            return false;
        })();

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

  const filteredAccommodations = useMemo(() => {
    return accommodationsData.filter(accommodation => {
        const regionMatch = selectedRegion === "All" || accommodation.region === selectedRegion;
        const styleMatch = selectedStyle === "All" || accommodation.travelStyle.includes(selectedStyle);
        const searchMatch = searchTerm === "" || accommodation.name.toLowerCase().includes(searchTerm.toLowerCase());
        return regionMatch && styleMatch && searchMatch;
    });
}, [selectedRegion, selectedStyle, searchTerm]);


  return (
    <main className="flex-1">
      <div className="bg-muted py-12 sm:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
            <h1 className="font-headline text-3xl font-bold sm:text-4xl">
                Tours & Accommodations
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Explore hand-picked tours and our curated list of accommodations. Find the perfect combination for your trip to Ghana.
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

        <h2 className="font-headline text-2xl font-bold mb-2">Cheap Tour Deals</h2>
        <p className="text-muted-foreground mb-6">Book securely with a real person via WhatsApp.</p>
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

        <Separator className="my-20" />

        <div id="accommodations" className="scroll-mt-20">
            <h2 className="font-headline text-2xl font-bold mb-2 flex items-center"><Bed className="mr-3 h-7 w-7"/> Explore Accommodations</h2>
            <p className="text-muted-foreground mb-6">Browse our curated list to find the perfect place to stay.</p>
            <Card className="mb-12 bg-muted/50 p-4 sm:p-6">
                 <h3 className="flex items-center font-headline text-xl mb-4"><Filter className="mr-2 h-5 w-5"/> Filter Accommodations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select onValueChange={setSelectedRegion} defaultValue="All">
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Region" />
                        </SelectTrigger>
                        <SelectContent>
                            {allRegions.map(region => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={setSelectedStyle} defaultValue="All">
                         <SelectTrigger>
                            <SelectValue placeholder="Filter by Style" />
                        </SelectTrigger>
                        <SelectContent>
                            {travelStyles.map(style => (
                                <SelectItem key={style} value={style}>{style}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {filteredAccommodations.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAccommodations.map((acc) => (
                        <Suspense key={acc.id} fallback={<AccommodationSkeleton />}>
                            <AccommodationCard accommodation={acc} />
                        </Suspense>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <Hotel className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold">No Accommodations Found</p>
                    <p className="text-muted-foreground">Try adjusting your filters to find more options.</p>
                </div>
            )}
        </div>


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
