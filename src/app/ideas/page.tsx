
'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Clock, Tag } from 'lucide-react';
import Link from 'next/link';
import sampleItineraries from '@/data/sample-itineraries.json';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function TripIdeasPage() {
    const router = useRouter();

    const handleCustomize = (itinerary: typeof sampleItineraries[0]) => {
        // Provide a sensible default budget based on duration ($200/day mid-range estimate)
        const defaultBudget = itinerary.duration * 200;

        const query = new URLSearchParams({
            duration: String(itinerary.duration),
            interests: itinerary.style.join(','),
            budget: String(defaultBudget),
            numTravelers: '1', // Default to 1 traveler
            travelStyle: 'Mid-range', // Default to mid-range
        }).toString();
        router.push(`/planner?${query}`);
    };

  return (
    <main className="flex-1">
      <div className="bg-muted py-12 sm:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
            <h1 className="font-headline text-3xl font-bold sm:text-4xl">
                Expert-Crafted Trip Ideas
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Get inspired by our collection of proven itineraries. Each plan is designed by local experts to give you an unforgettable Ghanaian experience. Find one you love and customize it in our planner.
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
            {sampleItineraries.map(itinerary => (
                <Card key={itinerary.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{itinerary.title}</CardTitle>
                        <CardDescription>{itinerary.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>{itinerary.duration} Days</span>
                        </div>
                         <div className="flex flex-wrap items-center gap-2">
                            <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                            {itinerary.style.map(s => (
                                <Badge key={s} variant="secondary">{s}</Badge>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={() => handleCustomize(itinerary)} className="w-full">
                            Customize this Plan <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
    </main>
  );
}
