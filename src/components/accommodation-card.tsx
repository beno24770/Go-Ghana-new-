
'use client';

import Link from 'next/link';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { MessageSquare } from 'lucide-react';

interface Accommodation {
    id: string;
    name: string;
    region: string;
    location: string;
    travelStyle: string[];
    description: string;
    image: string;
    link: string;
}

interface AccommodationCardProps {
    accommodation: Accommodation;
}

export function AccommodationCard({ accommodation }: AccommodationCardProps) {
    return (
        <Card className="flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-105 animate-in fade-in zoom-in-95">
            <CardContent className="flex-grow p-4 pt-6 space-y-2">
                <CardTitle className="font-headline text-xl">{accommodation.name}</CardTitle>
                <CardDescription>{accommodation.location}, {accommodation.region}</CardDescription>
                <div className="flex flex-wrap gap-2 pt-1">
                    {accommodation.travelStyle.map(style => (
                        <Badge key={`${accommodation.id}-${style}`} variant="secondary">{style}</Badge>
                    ))}
                </div>
                 <p className="text-sm text-muted-foreground pt-2">{accommodation.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                    <Link href="https://wa.me/233200635250" target="_blank">
                        <MessageSquare />
                        Contact for Booking
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
