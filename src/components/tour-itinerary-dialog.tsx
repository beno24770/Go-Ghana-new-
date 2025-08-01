
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import Link from 'next/link';
import { MessageSquare, Clock, DollarSign } from 'lucide-react';
import type { Tour } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface TourItineraryDialogProps {
  tour: Tour;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TourItineraryDialog({ tour, open, onOpenChange }: TourItineraryDialogProps) {
  if (!tour) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90svh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl sm:text-3xl">{tour.title}</DialogTitle>
          <DialogDescription>{tour.description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{tour.duration}</span>
            </div>
            <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>{tour.price} per person</span>
            </div>
        </div>
        <Separator className="my-4" />
        <ScrollArea className="flex-grow -mx-6 px-6">
            <div className="space-y-6">
                {tour.itinerary.map(day => (
                    <div key={day.day} className="grid grid-cols-[auto,1fr] gap-4 items-start">
                        <div className="flex flex-col items-center">
                             <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                                {day.day}
                            </div>
                            <div className="flex-1 w-0.5 bg-border my-2"></div>
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">{day.title}</h4>
                            <p className="text-muted-foreground text-sm whitespace-pre-wrap">{day.details}</p>
                            {day.overnight !== "N/A" && (
                                <p className="text-xs text-primary font-semibold mt-2">Overnight: {day.overnight}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
        <Separator className="my-4" />
        <Button asChild size="lg">
          <Link href={tour.bookingUrl} target="_blank">
            <MessageSquare className="mr-2 h-5 w-5" />
            Book via WhatsApp
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
