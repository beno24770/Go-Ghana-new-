
'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Filter, Hotel, Search } from 'lucide-react';
import accommodationsData from '@/data/accommodations.json';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { AccommodationCard } from '@/components/accommodation-card';

const AccommodationSkeleton = () => (
    <div className="flex flex-col rounded-lg border bg-card shadow-sm p-6 space-y-4">
        <Skeleton className="h-48 w-full rounded-t-lg" />
        <div className="space-y-2 px-1">
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
             <div className="flex flex-wrap gap-2 pt-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
        </div>
        <div className="pt-4 px-1">
            <Skeleton className="h-11 w-full rounded-md" />
        </div>
    </div>
);

const allRegions = [...new Set(accommodationsData.map(item => item.region))].sort();
const travelStyles = ["All", "Budget", "Mid-range", "Luxury"];

export default function AccommodationsPage() {
    const [selectedRegion, setSelectedRegion] = useState("All");
    const [selectedStyle, setSelectedStyle] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

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
                        Explore Accommodations
                    </h1>
                    <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                        Browse our curated list of hotels, guesthouses, and lodges across Ghana. Find the perfect place to stay for your trip.
                    </p>
                </div>
            </div>
            
            <div className="container mx-auto max-w-6xl px-4 py-16 sm:py-24">
                <Button asChild variant="outline" className="mb-8">
                    <Link href="/planner">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Planner
                    </Link>
                </Button>

                <Card className="mb-12 bg-muted/50 p-4 sm:p-6">
                     <h3 className="flex items-center font-headline text-xl mb-4"><Filter className="mr-2 h-5 w-5"/> Filter Accommodations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select onValueChange={setSelectedRegion} defaultValue="All">
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Region" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Regions</SelectItem>
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
        </main>
    )
}
