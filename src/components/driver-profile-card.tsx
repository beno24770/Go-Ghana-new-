
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import Link from 'next/link';
import { Car, MessageSquare } from 'lucide-react';
import Image from 'next/image';

interface DriverProfileCardProps {
    name: string;
    regions: string[];
    bio: string;
    vehicle: string;
    whatsAppUrl: string;
    image: string;
    "data-ai-hint": string;
}

export default function DriverProfileCard({ name, regions, bio, vehicle, whatsAppUrl, image, "data-ai-hint": dataAiHint }: DriverProfileCardProps) {
    return (
        <Card className="flex flex-col justify-between">
            <CardHeader>
                <div className="flex items-start gap-4">
                    <Image 
                        src={image}
                        alt={`Photo of ${name}`}
                        width={80}
                        height={80}
                        className="rounded-full border-2 border-primary"
                        data-ai-hint={dataAiHint}
                    />
                    <div className="flex-1">
                        <CardTitle className="font-headline text-2xl">{name}</CardTitle>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {regions.map(region => (
                                <Badge key={`${name}-${region}`} variant="secondary">{region}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                <p className="text-muted-foreground">{bio}</p>
                
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Car className="h-5 w-5 text-primary shrink-0" />
                        <span className="font-semibold">{vehicle}</span>
                    </div>

                    <Button asChild className="w-full" size="lg">
                        <Link href={whatsAppUrl} target="_blank">
                           <MessageSquare className="shrink-0" /> Contact via WhatsApp
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
