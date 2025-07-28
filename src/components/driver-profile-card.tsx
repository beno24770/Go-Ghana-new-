
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import Link from 'next/link';
import { Car, MapPin } from 'lucide-react';

interface DriverProfileCardProps {
    name: string;
    imageUrl: string;
    imageHint: string;
    regions: string[];
    bio: string;
    vehicle: string;
    whatsAppUrl: string;
}

export default function DriverProfileCard({ name, imageUrl, imageHint, regions, bio, vehicle, whatsAppUrl }: DriverProfileCardProps) {
    return (
        <Card className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
            <div className="relative h-64 w-full">
                <Image 
                    src={imageUrl} 
                    alt={`Photo of ${name}`} 
                    fill 
                    className="object-cover" 
                    data-ai-hint={imageHint}
                />
            </div>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">{name}</CardTitle>
                <div className="flex flex-wrap gap-2 pt-2">
                    {regions.map(region => (
                        <Badge key={region} variant="secondary">{region}</Badge>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                <p className="text-muted-foreground">{bio}</p>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Car className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{vehicle}</span>
                    </div>

                    <Button asChild className="w-full" size="lg">
                        <Link href={whatsAppUrl} target="_blank">
                           Contact via WhatsApp
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
