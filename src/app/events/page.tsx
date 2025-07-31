
'use client';

import { ArrowLeft } from "lucide-react";
import localPulseData from '@/data/local-pulse.json';
import entertainmentData from '@/data/entertainment-events.json';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const EventCard = dynamic(() => import('@/components/event-card'), {
    suspense: true,
});

const EventSkeleton = () => (
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-6 h-[420px]">
        <Skeleton className="h-7 w-3/4 rounded" />
        <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
        </div>
         <div className="space-y-2 pt-4 flex-grow">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
        </div>
        <div className="space-y-3 pt-6">
            <Skeleton className="h-5 w-full rounded" />
            <Skeleton className="h-5 w-1/2 rounded" />
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-5 w-full rounded" />
        </div>
    </div>
);


export default function EventsPage() {
    return (
        <main className="flex-1">
            <div className="bg-muted py-12 sm:py-20">
                <div className="container mx-auto max-w-3xl px-4 text-center">
                    <h1 className="font-headline text-3xl font-bold sm:text-4xl">
                        Ghana's Local Pulse
                    </h1>
                    <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                        Discover the rhythm of Ghana. From vibrant annual festivals to regular weekly entertainment, this is your guide to the most authentic local events.
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

                <Tabs defaultValue="festivals" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="festivals">Annual Festivals</TabsTrigger>
                        <TabsTrigger value="entertainment">Regular Entertainment</TabsTrigger>
                    </TabsList>
                    <TabsContent value="festivals">
                         <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {localPulseData.map(event => (
                                <Suspense key={event.id} fallback={<EventSkeleton />}>
                                    <EventCard event={event} />
                                </Suspense>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="entertainment">
                        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {entertainmentData.map(event => (
                                <Suspense key={event.id} fallback={<EventSkeleton />}>
                                    <EventCard event={event} />
                                </Suspense>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}
