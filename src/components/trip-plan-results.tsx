
'use client';

import {
  ArrowLeft,
  BedDouble,
  Car,
  Copy,
  Share2,
  Ticket,
  Utensils,
  Wallet,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { PlanTripInput, PlanTripOutput } from '@/ai/schemas';
import { Badge } from '@/components/ui/badge';
import { useMemo, Suspense, useState } from 'react';
import { marked } from 'marked';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ItineraryDialog = dynamic(() => import('./itinerary-dialog').then(mod => mod.ItineraryDialog), {
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading Tools...</div>
});

type TripPlanData = {
  inputs: PlanTripInput;
  outputs: PlanTripOutput;
};

interface TripPlanResultsProps {
  data: TripPlanData | null;
  isLoading: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

const categoryIcons = {
  accommodation: <BedDouble className="h-8 w-8 text-primary" />,
  food: <Utensils className="h-8 w-8 text-primary" />,
  transportation: <Car className="h-8 w-8 text-primary" />,
  activities: <Ticket className="h-8 w-8 text-primary" />,
};

// New client component to handle state and actions
function TripPlanActions({ planData }: { planData: TripPlanData }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsDialogOpen(true)}>
                <Wand2 className="mr-2 h-4 w-4 shrink-0" /> View & Customize Itinerary
            </Button>
            <Suspense fallback={<div>Loading...</div>}>
                <ItineraryDialog 
                    planData={planData} 
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                />
            </Suspense>
        </>
    );
}


function PlanSection({ title, cost, description, icon, cta, affiliateLink }: { title: string; cost: number; description: string; icon: React.ReactNode, cta?: React.ReactNode, affiliateLink?: string }) {
  const parsedDescription = useMemo(() => marked.parse(description), [description]);
  
  return (
    <div className="grid grid-cols-[auto,1fr] gap-4 items-start">
        <div className="bg-primary/10 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-lg font-semibold text-primary">${cost.toLocaleString()}</p>
            <div className="mt-2 text-muted-foreground prose prose-sm max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0"
              dangerouslySetInnerHTML={{ __html: parsedDescription as string }} 
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {cta}
              {affiliateLink && (
                  <Button asChild variant="outline">
                      <Link href={affiliateLink} target="_blank">
                          View Availability
                      </Link>
                  </Button>
              )}
            </div>
        </div>
    </div>
  );
}


export default function TripPlanResults({ data, isLoading, onBack, showBackButton }: TripPlanResultsProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const handleShare = () => {
    if (typeof window !== 'undefined' && data) {
      const url = new URL(window.location.href);
      const params = new URLSearchParams();
      Object.entries(data.inputs).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
        } else if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
      });
      url.search = params.toString();
      navigator.clipboard.writeText(url.toString());
      toast({
        title: 'Copied to Clipboard',
        description: 'The link to your trip plan has been copied.',
        action: <Copy className="h-4 w-4" />,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[500px] w-full items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 font-headline text-xl">Generating your trip plan...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full min-h-[500px] w-full items-center justify-center rounded-lg border border-dashed bg-muted/50 p-8">
        <div className="text-center">
            <Ticket className="h-16 w-16 mx-auto text-muted-foreground" />
          <h3 className="text-2xl">Your Custom Trip Plan Awaits</h3>
          <p className="mt-2 text-muted-foreground">
            Fill out your budget details, and we'll craft a personalized travel plan for your Ghanaian adventure.
          </p>
        </div>
      </div>
    );
  }

  const { inputs, outputs } = data;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
                <CardTitle className="text-3xl">Your Trip Plan for Ghana</CardTitle>
                <CardDescription>
                For a {inputs.duration}-day trip to {inputs.region.join(', ')} for {inputs.numTravelers} traveler(s), starting on {new Date(inputs.startDate).toLocaleDateString(undefined, { dateStyle: 'long', timeZone: 'UTC' })}.
                </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg">
                <Wallet className="mr-2 h-4 w-4 shrink-0" /> ${inputs.budget.toLocaleString()}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="rounded-lg bg-secondary/20 p-4 text-center">
            <p className="text-sm text-secondary-foreground/80">Suggested Travel Style</p>
            <p className="text-2xl font-bold text-secondary-foreground">{outputs.suggestedTravelStyle}</p>
        </div>

        <div className="space-y-6">
            <PlanSection 
                title="Accommodation" 
                cost={outputs.accommodation.cost} 
                description={outputs.accommodation.description} 
                icon={categoryIcons.accommodation}
                affiliateLink="#"
            />
            <PlanSection 
                title="Food" 
                cost={outputs.food.cost} 
                description={outputs.food.description} 
                icon={categoryIcons.food}
                affiliateLink="#"
             />
            <PlanSection 
                title="Transportation" 
                cost={outputs.transportation.cost} 
                description={outputs.transportation.description} 
                icon={categoryIcons.transportation}
                affiliateLink="#"
                cta={
                  <Button asChild>
                    <Link href="https://wa.me/233200635250" target="_blank">
                      <Car className="mr-2 h-4 w-4 shrink-0" /> Connect with a Driver
                    </Link>
                  </Button>
                }
            />
            <PlanSection 
                title="Activities" 
                cost={outputs.activities.cost} 
                description={outputs.activities.description} 
                icon={categoryIcons.activities} 
                cta={ <TripPlanActions planData={data} /> } 
            />
        </div>
        
        <div className="text-center border-t pt-6">
          <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
          <p className="text-5xl font-bold tracking-tighter text-primary">
            ${outputs.total.toLocaleString()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
            {showBackButton && onBack && (
                <Button onClick={onBack} variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
                    Back to Budget
                </Button>
            )}
            <Button onClick={handleShare} variant="outline" className="w-full">
                <Share2 className="mr-2 h-4 w-4 shrink-0" />
                Share This Plan
            </Button>
        </div>

      </CardContent>
    </Card>
  );
}
