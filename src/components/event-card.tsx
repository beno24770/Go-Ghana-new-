
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Tag, Ticket } from "lucide-react";

export default function EventCard({ event }: { event: any }) {
    return (
        <Card className="flex flex-col h-[420px]">
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
}
