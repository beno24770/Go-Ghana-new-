
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Tag, Ticket } from "lucide-react";
import { format, parseISO } from 'date-fns';

export default function EventCard({ event }: { event: any }) {
    
    const displayDate = () => {
        if (event.startDate) {
            try {
                const start = format(parseISO(event.startDate), 'MMMM d');
                const end = format(parseISO(event.endDate), 'MMMM d, yyyy');
                if (start === end.split(',')[0]) {
                    return end;
                }
                return `${start} - ${end}`;
            } catch (error) {
                console.error("Invalid date format:", event.startDate, event.endDate);
                return "Date not available";
            }
        }
        if (event.typicalDays) {
            return event.typicalDays.join(', ');
        }
        return "Date not available";
    }

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
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>{displayDate()}</span>
                    </div>
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
