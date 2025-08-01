
'use client';

import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import localPulseData from '@/data/local-pulse.json';
import entertainmentData from '@/data/entertainment-events.json';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, isWithinInterval, getDay, eachDayOfInterval } from 'date-fns';
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const EventCard = dynamic(() => import('@/components/event-card'), {
    suspense: true,
});

const EventSkeleton = () => (
    <div className="flex flex-col space-y-3 rounded-lg border bg-card p-6 min-h-[420px]">
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
    const [date, setDate] = useState<DateRange | undefined>(undefined);

    const dayMap = useMemo(() => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], []);

    const filteredFestivals = useMemo(() => {
        if (!date?.from || !date?.to) return localPulseData;
        return localPulseData.filter(event => {
            const eventStart = parseISO(event.startDate);
            const eventEnd = parseISO(event.endDate);
            const selectionStart = date.from!;
            const selectionEnd = date.to!;
            
            return isWithinInterval(eventStart, { start: selectionStart, end: selectionEnd }) ||
                   isWithinInterval(eventEnd, { start: selectionStart, end: selectionEnd }) ||
                   isWithinInterval(selectionStart, { start: eventStart, end: eventEnd }) ||
                   isWithinInterval(selectionEnd, { start: eventStart, end: eventEnd });
        });
    }, [date]);

    const filteredEntertainment = useMemo(() => {
        if (!date?.from || !date?.to) return entertainmentData;
        
        const selectedDays = eachDayOfInterval({ start: date.from, end: date.to }).map(d => dayMap[getDay(d)]);
        const selectedDaySet = new Set(selectedDays);

        return entertainmentData.filter(event => 
            event.typicalDays.some(day => selectedDaySet.has(day))
        );

    }, [date, dayMap]);


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
                <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
                    <Button asChild variant="outline">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full sm:w-[300px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                    <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                    </>
                                    ) : (
                                    format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                         {date && <Button variant="ghost" onClick={() => setDate(undefined)}>Clear</Button>}
                    </div>
                </div>

                <Tabs defaultValue="festivals" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="festivals">Annual Festivals</TabsTrigger>
                        <TabsTrigger value="entertainment">Regular Entertainment</TabsTrigger>
                    </TabsList>
                    <TabsContent value="festivals" className="mt-8">
                         <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {filteredFestivals.length > 0 ? filteredFestivals.map(event => (
                                <Suspense key={event.id} fallback={<EventSkeleton />}>
                                    <EventCard event={event} />
                                </Suspense>
                            )) : <p className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-muted-foreground py-8">No festivals found for the selected date range.</p>}
                        </div>
                    </TabsContent>
                    <TabsContent value="entertainment" className="mt-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                             {filteredEntertainment.length > 0 ? filteredEntertainment.map(event => (
                                <Suspense key={event.id} fallback={<EventSkeleton />}>
                                    <EventCard event={event} />
                                </Suspense>
                            )): <p className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-muted-foreground py-8">No regular entertainment found for the selected days.</p>}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}
