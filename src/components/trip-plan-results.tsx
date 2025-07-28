'use client';

import {
  BedDouble,
  BookOpenCheck,
  Briefcase,
  Car,
  Check,
  Copy,
  LoaderCircle,
  Mail,
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
import type { GenerateItineraryOutput, GeneratePackingListOutput, PackingListItemSchema, PlanTripInput, PlanTripOutput } from '@/ai/schemas';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getItinerary, getPackingList } from '@/app/actions';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';
import { marked } from 'marked';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { z } from 'zod';


type TripPlanData = {
  inputs: PlanTripInput;
  outputs: PlanTripOutput;
};

interface TripPlanResultsProps {
  data: TripPlanData | null;
  isLoading: boolean;
}

const categoryIcons = {
  accommodation: <BedDouble className="h-6 w-6 text-muted-foreground" />,
  food: <Utensils className="h-6 w-6 text-muted-foreground" />,
  transportation: <Car className="h-6 w-6 text-muted-foreground" />,
  activities: <Ticket className="h-6 w-6 text-muted-foreground" />,
};

function ItineraryDialog({ planData }: { planData: TripPlanData }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState({ itinerary: false, packingList: false });
    const [itinerary, setItinerary] = useState<GenerateItineraryOutput | null>(null);
    const [packingList, setPackingList] = useState<GeneratePackingListOutput | null>(null);
    const { toast } = useToast();

    const handleGenerateItinerary = async () => {
        setIsLoading(prev => ({...prev, itinerary: true}));
        setItinerary(null);
        const result = await getItinerary({
            duration: planData.inputs.duration,
            region: planData.inputs.region,
            travelStyle: planData.outputs.suggestedTravelStyle,
            activitiesBudget: planData.outputs.activities.cost,
        });

        if (result.success) {
            setItinerary(result.data);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsLoading(prev => ({...prev, itinerary: false}));
    }

    const handleGeneratePackingList = async () => {
        setIsLoading(prev => ({...prev, packingList: true}));
        setPackingList(null);
        const result = await getPackingList({
            duration: planData.inputs.duration,
            region: planData.inputs.region,
            travelStyle: planData.outputs.suggestedTravelStyle,
        });

        if (result.success) {
            setPackingList(result.data);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsLoading(prev => ({...prev, packingList: false}));
    }
    
    function PackingListCategory({ title, items }: { title: string; items: z.infer<typeof PackingListItemSchema>[] }) {
        if (!items || items.length === 0) return null;
        return (
            <div>
                <h4 className="font-bold text-md mb-2">{title}</h4>
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-primary mt-1 shrink-0" />
                            <div>
                                <span className="font-semibold">{item.item}</span>
                                <p className="text-sm text-muted-foreground">{item.notes}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Wand2 className="mr-2 h-4 w-4" /> Plan Details
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Your Trip Tools</DialogTitle>
                    <DialogDescription>
                        Generate a sample itinerary and a personalized packing list for your trip.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="itinerary" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                        <TabsTrigger value="packing-list">Packing List</TabsTrigger>
                    </TabsList>
                    <TabsContent value="itinerary">
                        <div className="py-4 min-h-[400px]">
                            {!itinerary && !isLoading.itinerary && (
                                <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                                    <p className="mb-4 text-muted-foreground">Click the button below to generate a personalized itinerary.</p>
                                    <Button onClick={handleGenerateItinerary} disabled={isLoading.itinerary}>
                                        {isLoading.itinerary ? <LoaderCircle className="animate-spin" /> : <Wand2 />}
                                        <span className="ml-2">{isLoading.itinerary ? 'Generating...' : 'Generate Itinerary'}</span>
                                    </Button>
                                </div>
                            )}
                            {isLoading.itinerary && (
                                <div className="flex h-full min-h-[300px] w-full items-center justify-center">
                                    <div className="text-center">
                                        <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                        <p className="mt-4 font-headline text-xl">Crafting your adventure...</p>
                                    </div>
                                </div>
                            )}
                            {itinerary && (
                                <ScrollArea className="h-[450px] pr-4">
                                    <Accordion type="single" collapsible className="w-full">
                                        {itinerary.itinerary.map((dayPlan) => (
                                            <AccordionItem value={`day-${dayPlan.day}`} key={dayPlan.day}>
                                                <AccordionTrigger className="font-bold hover:no-underline">Day {dayPlan.day}: {dayPlan.title}</AccordionTrigger>
                                                <AccordionContent>
                                                <div 
                                                    className="prose prose-sm dark:prose-invert max-w-none" 
                                                    dangerouslySetInnerHTML={{ __html: marked(dayPlan.details) as string }} 
                                                />
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </ScrollArea>
                            )}
                        </div>
                         {itinerary && (
                            <div className="mt-6 space-y-3 border-t pt-6 text-center">
                                <h4 className="font-headline text-lg">Ready for the next step?</h4>
                                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                     <Button asChild variant="outline">
                                        <Link href="https://letvisitghana.com" target="_blank">
                                            <BookOpenCheck /> <span className="ml-2">Read More</span>
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href="https://wa.me/233200635250" target="_blank">
                                            <Mail /> <span className="ml-2">Customize Trip</span>
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="https://letvisitghanatours.com" target="_blank">
                                            <Briefcase /> <span className="ml-2">Book a Tour</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="packing-list">
                    <div className="py-4 min-h-[400px]">
                            {!packingList && !isLoading.packingList && (
                                <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                                    <p className="mb-4 text-muted-foreground">Click the button below to generate a personalized packing list.</p>
                                    <Button onClick={handleGeneratePackingList} disabled={isLoading.packingList}>
                                        {isLoading.packingList ? <LoaderCircle className="animate-spin" /> : <Wand2 />}
                                        <span className="ml-2">{isLoading.packingList ? 'Generating...' : 'Generate Packing List'}</span>
                                    </Button>
                                </div>
                            )}
                            {isLoading.packingList && (
                                <div className="flex h-full min-h-[300px] w-full items-center justify-center">
                                    <div className="text-center">
                                        <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                        <p className="mt-4 font-headline text-xl">Creating your list...</p>
                                    </div>
                                </div>
                            )}
                            {packingList && (
                                 <ScrollArea className="h-[450px] pr-4">
                                    <div className="space-y-6">
                                        <PackingListCategory title="Clothing" items={packingList.clothing} />
                                        <PackingListCategory title="Toiletries" items={packingList.toiletries} />
                                        <PackingListCategory title="Health & Safety" items={packingList.healthAndSafety} />
                                        <PackingListCategory title="Documents" items={packingList.documents} />
                                        <PackingListCategory title="Electronics" items={packingList.electronics} />
                                        <PackingListCategory title="Miscellaneous" items={packingList.miscellaneous} />
                                    </div>
                                 </ScrollArea>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

function PlanSection({ title, cost, description, icon, cta }: { title: string; cost: number; description: string; icon: React.ReactNode, cta?: React.ReactNode }) {
  return (
    <div>
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                {icon}
                <div>
                    <h3 className="text-xl font-bold font-headline">{title}</h3>
                    <p className="text-lg font-semibold text-primary">${cost.toLocaleString()}</p>
                </div>
            </div>
            {cta}
        </div>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}


export default function TripPlanResults({ data, isLoading }: TripPlanResultsProps) {
  const { toast } = useToast();

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
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
          <h3 className="font-headline text-2xl">Your Custom Trip Plan Awaits</h3>
          <p className="mt-2 text-muted-foreground">
            Fill out your budget details, and we'll craft a personalized itinerary for your Ghanaian adventure.
          </p>
          <Image
            src="https://www.letvisitghana.com/wp-content/uploads/2024/05/Nzulezu-Stilt-Village.jpg"
            alt="Scenic view of a Ghanaian stilt village"
            width={400}
            height={300}
            className="mt-6 rounded-lg object-cover"
            data-ai-hint="ghana stilt village"
          />
        </div>
      </div>
    );
  }

  const { inputs, outputs } = data;
  const regionText = Array.isArray(inputs.region) ? inputs.region.join(', ') : inputs.region;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
                <CardTitle className="font-headline text-3xl">Your Trip Plan for Ghana</CardTitle>
                <CardDescription>
                For a {inputs.duration}-day trip to {regionText} for {inputs.numTravelers} traveler(s).
                </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg">
                <Wallet className="mr-2 h-4 w-4" /> ${inputs.budget.toLocaleString()}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="rounded-lg bg-accent/20 p-4 text-center">
            <p className="text-sm text-accent-foreground/80">Suggested Travel Style</p>
            <p className="font-headline text-2xl font-bold text-accent-foreground">{outputs.suggestedTravelStyle}</p>
        </div>

        <div className="space-y-6">
            <PlanSection title="Accommodation" cost={outputs.accommodation.cost} description={outputs.accommodation.description} icon={categoryIcons.accommodation} />
            <PlanSection title="Food" cost={outputs.food.cost} description={outputs.food.description} icon={categoryIcons.food} />
            <PlanSection title="Transportation" cost={outputs.transportation.cost} description={outputs.transportation.description} icon={categoryIcons.transportation} />
            <PlanSection title="Activities" cost={outputs.activities.cost} description={outputs.activities.description} icon={categoryIcons.activities} cta={<ItineraryDialog planData={data} />} />
        </div>
        
        <div className="text-center border-t pt-6">
          <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
          <p className="font-headline text-5xl font-bold tracking-tighter text-primary">
            ${outputs.total.toLocaleString()}
          </p>
        </div>

        <Button onClick={handleShare} variant="outline" className="w-full">
          <Share2 className="mr-2 h-4 w-4" />
          Share This Plan
        </Button>
      </CardContent>
    </Card>
  );
}
