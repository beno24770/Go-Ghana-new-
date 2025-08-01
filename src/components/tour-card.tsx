
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';
import { ArrowRight, Clock, DollarSign } from 'lucide-react';
import Image from 'next/image';

interface TourCardProps {
    id: string;
    title: string;
    duration: string;
    price: string;
    description: string;
    image: string;
    bookingUrl: string;
    "data-ai-hint": string;
}

export function TourCard({ title, duration, price, description, image, bookingUrl, "data-ai-hint": dataAiHint }: TourCardProps) {
    return (
        <Card className="flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-105 animate-in fade-in zoom-in-95">
            <CardHeader className="p-0">
                <Image
                    src={image}
                    alt={`Image for ${title}`}
                    width={600}
                    height={400}
                    className="rounded-t-lg object-cover aspect-[3/2]"
                    data-ai-hint={dataAiHint}
                />
            </CardHeader>
            <CardContent className="flex-grow p-6 space-y-4">
                <CardTitle className="font-headline text-2xl">{title}</CardTitle>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{price} per person</span>
                    </div>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                    <Link href={bookingUrl} target="_blank">
                        View Details & Book
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
