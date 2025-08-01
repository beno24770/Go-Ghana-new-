
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowRight, Clock, DollarSign } from 'lucide-react';
import type { Tour } from '@/lib/types';

interface TourCardProps {
    tour: Tour;
    onSelectTour: (tour: Tour) => void;
}

export function TourCard({ tour, onSelectTour }: TourCardProps) {
    const { title, duration, price, description } = tour;
    return (
        <Card className="flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-105 animate-in fade-in zoom-in-95">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{title}</CardTitle>
                <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{price} per person</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <CardDescription>{description}</CardDescription>
            </CardContent>
            <CardFooter>
                <Button onClick={() => onSelectTour(tour)} className="w-full">
                    View Details & Itinerary
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
