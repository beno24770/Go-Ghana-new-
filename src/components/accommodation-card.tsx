
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { ExternalLink } from 'lucide-react';

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
            <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                     <Image
                        src={accommodation.image}
                        alt={`Photo of ${accommodation.name}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg"
                        data-ai-hint="hotel room"
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 space-y-2">
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
                <Button asChild className="w-full" disabled={accommodation.link === "#"}>
                    <Link href={accommodation.link} target="_blank">
                        {accommodation.link === "#" ? "No Website Available" : "Visit Website"}
                        {accommodation.link !== "#" && <ExternalLink />}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
