
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import tours from '@/data/tours.json';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function ToursPage() {
  return (
    <main className="flex-1">
      <div className="bg-muted py-12 sm:py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
            <h1 className="font-headline text-3xl font-bold sm:text-4xl">
                Curated Ghana Tours
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Explore the best of Ghana with our hand-picked tours. We offer affordable, high-quality experiences that connect you with the heart of the country.
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {tours.map(tour => (
                <Card key={tour.id} className="flex flex-col">
                    <CardHeader>
                        <div className="relative h-48 w-full mb-4">
                            <Image 
                                src={tour.image}
                                alt={tour.title}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-t-lg"
                                data-ai-hint={tour['data-ai-hint']}
                            />
                        </div>
                        <CardTitle className="font-headline text-2xl">{tour.title}</CardTitle>
                        <CardDescription>{tour.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                         <div className="flex flex-wrap items-center gap-2">
                            <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                            {tour.regions.map(s => (
                                <Badge key={s} variant="secondary">{s}</Badge>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between items-center">
                         <p className="text-2xl font-bold text-primary">${tour.price}<span className="text-sm font-normal text-muted-foreground">/person</span></p>
                         <Button asChild>
                            <Link href="https://wa.me/233200635250" target="_blank">
                                Book Now
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
    </main>
  );
}
