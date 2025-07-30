
'use client';

import { ArrowLeft, Calendar, MapPin, Tag, Ticket } from "lucide-react";
import localPulseData from '@/data/local-pulse.json';
import entertainmentData from '@/data/entertainment-events.json';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";


const EventCard = ({ event }: { event: any }) => (
    <Card className="flex flex-col">
        <CardHeader>
            <CardTitle className="font-headline text-2xl">{event.title}</CardTitle>
             <div className="flex flex-wrap gap-2 pt-2">
                {event.category.map((cat: string) => (
                    <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
            </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow justify-between">
            <p className="text-muted-foreground">{event.description}</p>
            <div className="space-y-3 pt-6 text-sm">
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{event.location}{event.venue ? `, ${event.venue}` : ''}</span>
                </div>
                {event.startDate && (
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })} - {new Date(event.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                    </div>
                )}
                {event.typicalDays && (
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>{event.typicalDays.join(', ')}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-primary shrink-0" />
                    <span>{event.cost}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary shrink-0" />
                    <span className="italic">{event.insiderTip}</span>
                </div>
            </div>
        </CardContent>
    </Card>
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
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="entertainment">
                        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {entertainmentData.map(event => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}
