
'use client';

import {
  BedDouble,
  BookText,
  Briefcase,
  Car,
  Check,
  Copy,
  Download,
  Languages,
  LoaderCircle,
  Mail,
  Pencil,
  PlayCircle,
  Share2,
  Ticket,
  Utensils,
  Volume2,
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
import type { GenerateItineraryOutput, GenerateLanguageGuideOutput, GeneratePackingListOutput, PackingListItemSchema, PhraseSchema, PlanTripInput, PlanTripOutput } from '@/ai/schemas';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getAudio, getItinerary, getLanguageGuide, getPackingList, regenerateItinerary } from '@/app/actions';
import { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';
import { marked } from 'marked';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { z } from 'zod';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';


type TripPlanData = {
  inputs: PlanTripInput;
  outputs: PlanTripOutput;
};

interface TripPlanResultsProps {
  data: TripPlanData | null;
  isLoading: boolean;
  initialTool?: string | null;
}

const categoryIcons = {
  accommodation: <BedDouble className="h-6 w-6 text-muted-foreground" />,
  food: <Utensils className="h-6 w-6 text-muted-foreground" />,
  transportation: <Car className="h-6 w-6 text-muted-foreground" />,
  activities: <Ticket className="h-6 w-6 text-muted-foreground" />,
};

interface ItineraryDialogProps {
    planData: TripPlanData;
    initialTool?: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const downloadFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
});


function DownloadDialog({ itineraryAsMarkdown, onOpenChange }: { itineraryAsMarkdown: string; onOpenChange: (open: boolean) => void }) {
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
    const { toast } = useToast();

    const handleDownload = (e: React.FormEvent) => {
        e.preventDefault();
        const result = downloadFormSchema.safeParse(formData);
        if (!result.success) {
            const formattedErrors: { name?: string; email?: string } = {};
            result.error.errors.forEach(err => {
                if (err.path[0] === 'name') formattedErrors.name = err.message;
                if (err.path[0] === 'email') formattedErrors.email = err.message;
            });
            setErrors(formattedErrors);
            return;
        }
        
        // At this point, you would typically send the lead (formData.name, formData.email) to your backend.
        // For this prototype, we'll just log it and proceed with the download.
        console.log("Lead captured:", { name: formData.name, email: formData.email });
        toast({ title: "Success!", description: "Your itinerary is downloading." });


        const blob = new Blob([itineraryAsMarkdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'goghana-itinerary.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        onOpenChange(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        // Clear errors on change
        if (errors[id as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [id]: undefined }));
        }
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">Download Your Itinerary</DialogTitle>
                <DialogDescription>
                    Enter your details below to get your personalized itinerary.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDownload} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={formData.name} onChange={handleInputChange} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
                     {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <DialogFooter>
                    <Button type="submit">Download Now</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}


function ItineraryDialog({ planData, initialTool, open, onOpenChange }: ItineraryDialogProps) {
    const [isLoading, setIsLoading] = useState({ itinerary: false, packingList: false, languageGuide: false, audio: '' });
    const [itinerary, setItinerary] = useState<GenerateItineraryOutput | null>(null);
    const [packingList, setPackingList] = useState<GeneratePackingListOutput | null>(null);
    const [languageGuide, setLanguageGuide] = useState<GenerateLanguageGuideOutput | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [isEditing, setIsEditing] = useState(false);
    const [editedItinerary, setEditedItinerary] = useState('');
    const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);

    const { toast } = useToast();

    const itineraryAsMarkdown = useMemo(() => {
        if (!itinerary) return '';
        return itinerary.itinerary.map(day => `### Day ${day.day}: ${day.title}\n\n${day.details}`).join('\n\n');
    }, [itinerary]);
    
    useEffect(() => {
        if(open && initialTool) {
            setActiveTab(initialTool);
        }
    }, [open, initialTool]);

    useEffect(() => {
        if (itineraryAsMarkdown) {
            setEditedItinerary(itineraryAsMarkdown);
        }
    }, [itineraryAsMarkdown]);

    const handleGenerateItinerary = async () => {
        setIsLoading(prev => ({...prev, itinerary: true}));
        setItinerary(null);
        setIsEditing(false);
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

    const handleRegenerateItinerary = async () => {
        setIsLoading(prev => ({ ...prev, itinerary: true }));
        setItinerary(null);
        const result = await regenerateItinerary({ notes: editedItinerary });
        if (result.success) {
            setItinerary(result.data);
            setIsEditing(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsLoading(prev => ({ ...prev, itinerary: false }));
    };

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

    const handleGenerateLanguageGuide = async () => {
        setIsLoading(prev => ({...prev, languageGuide: true}));
        setLanguageGuide(null);
        const result = await getLanguageGuide({ region: planData.inputs.region });

        if (result.success) {
            setLanguageGuide(result.data);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsLoading(prev => ({...prev, languageGuide: false}));
    }

    const handlePlayAudio = async (text: string, phraseIndex: number) => {
        if (audio?.src) {
            audio.pause();
            audio.currentTime = 0;
            setAudio(null);
        }

        setIsLoading(prev => ({...prev, audio: `phrase-${phraseIndex}`}));
        const result = await getAudio({ text });

        if (result.success) {
            const newAudio = new Audio(result.data.media);
            setAudio(newAudio);
            newAudio.play();
            newAudio.onended = () => setAudio(null);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsLoading(prev => ({...prev, audio: ''}));
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
    
    const ItineraryContent = () => {
        if (isLoading.itinerary) {
            return (
                <div className="flex h-full min-h-[300px] w-full items-center justify-center">
                    <div className="text-center">
                        <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="mt-4 font-headline text-xl">Crafting your adventure...</p>
                    </div>
                </div>
            )
        }
        if (!itinerary) {
             return (
                <div className="text-center p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
                    <p className="mb-4 text-muted-foreground">Click the button below to generate a personalized itinerary.</p>
                    <Button onClick={handleGenerateItinerary} disabled={isLoading.itinerary}>
                        {isLoading.itinerary ? <LoaderCircle className="animate-spin" /> : <Wand2 />}
                        <span className="ml-2">{isLoading.itinerary ? 'Generating...' : 'Generate Itinerary'}</span>
                    </Button>
                </div>
            )
        }
        if (isEditing) {
            return (
                <div className="flex flex-col h-full">
                    <Textarea 
                        value={editedItinerary}
                        onChange={(e) => setEditedItinerary(e.target.value)}
                        className="flex-grow min-h-[300px] text-sm"
                        placeholder="Add your desired destinations or make changes here..."
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleRegenerateItinerary} disabled={isLoading.itinerary}>
                            {isLoading.itinerary ? <LoaderCircle className="animate-spin" /> : <Wand2 />}
                            <span className="ml-2">Regenerate Itinerary</span>
                        </Button>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex flex-col h-full">
                <div className="flex-grow overflow-y-auto pr-4 -mr-4">
                    <Accordion type="single" collapsible className="w-full" defaultValue="day-1">
                        {itinerary.itinerary.map((dayPlan) => (
                            <AccordionItem value={`day-${dayPlan.day}`} key={dayPlan.day}>
                                <AccordionTrigger className="font-bold hover:no-underline text-left">Day {dayPlan.day}: {dayPlan.title}</AccordionTrigger>
                                <AccordionContent>
                                <div 
                                    className="prose dark:prose-invert max-w-none" 
                                    dangerouslySetInnerHTML={{ __html: marked.parse(dayPlan.details) as string }} 
                                />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                <div className="mt-6 space-y-3 border-t pt-6 text-center bg-muted/20 p-4 rounded-lg -mx-6 -mb-6">
                    <h4 className="font-headline text-lg">Ready for the Next Step?</h4>
                    <p className="text-sm text-muted-foreground">
                        Let local experts help you refine and book your perfect Ghanaian adventure.
                    </p>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center">
                         <Button onClick={() => setIsEditing(true)} variant="outline">
                            <Pencil /> <span className="ml-2">Edit</span>
                        </Button>
                        <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline"><Download /> <span className="ml-2">Download</span></Button>
                            </DialogTrigger>
                            <DownloadDialog itineraryAsMarkdown={itineraryAsMarkdown} onOpenChange={setIsDownloadDialogOpen} />
                        </Dialog>
                        <Button asChild>
                            <Link href="/drivers">
                                <Car /> <span className="ml-2">Go Solo</span>
                            </Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href="https://letvisitghanatours.com" target="_blank">
                                <Briefcase /> <span className="ml-2">Book This Tour</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90svh] flex flex-col p-6">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Your Trip Tools</DialogTitle>
                    <DialogDescription>
                        Generate and customize a sample itinerary, packing list, and language guide for your trip.
                    </DialogDescription>
                </DialogHeader>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-hidden flex-grow flex flex-col">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                        <TabsTrigger value="packing-list">Packing List</TabsTrigger>
                        <TabsTrigger value="language-guide">Language</TabsTrigger>
                    </TabsList>
                    <div className="flex-grow overflow-y-auto">
                        <TabsContent value="itinerary" className="mt-4 h-full">
                           <ItineraryContent />
                        </TabsContent>
                        <TabsContent value="packing-list" className="pr-4 mt-0">
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
                                    <div className="space-y-6">
                                        <PackingListCategory title="Clothing" items={packingList.clothing} />
                                        <PackingListCategory title="Toiletries" items={packingList.toiletries} />
                                        <PackingListCategory title="Health & Safety" items={packingList.healthAndSafety} />
                                        <PackingListCategory title="Documents" items={packingList.documents} />
                                        <PackingListCategory title="Electronics" items={packingList.electronics} />
                                        <PackingListCategory title="Miscellaneous" items={packingList.miscellaneous} />
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="language-guide" className="pr-4 mt-0">
                            <div className="py-4 min-h-[400px]">
                                {!languageGuide && !isLoading.languageGuide && (
                                    <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                                        <p className="mb-4 text-muted-foreground">Click the button below to generate a quick language guide.</p>
                                        <Button onClick={handleGenerateLanguageGuide} disabled={isLoading.languageGuide}>
                                            {isLoading.languageGuide ? <LoaderCircle className="animate-spin" /> : <Languages />}
                                            <span className="ml-2">{isLoading.languageGuide ? 'Generating...' : 'Generate Language Guide'}</span>
                                        </Button>
                                    </div>
                                )}
                                {isLoading.languageGuide && (
                                    <div className="flex h-full min-h-[300px] w-full items-center justify-center">
                                        <div className="text-center">
                                            <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                                            <p className="mt-4 font-headline text-xl">Teaching the AI some local phrases...</p>
                                        </div>
                                    </div>
                                )}
                                {languageGuide && (
                                    <div className="space-y-4">
                                        <div className="text-center p-2 rounded-lg bg-muted/50">
                                            <p className="text-sm font-semibold">Primary Language for your trip:</p>
                                            <p className="text-lg font-bold text-primary">{languageGuide.phrases[0]?.languageName}</p>
                                        </div>
                                        {languageGuide.phrases.map((phrase, index) => (
                                            <Card key={index} className="p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">{phrase.english}</p>
                                                        <p className="font-bold text-lg">{phrase.translation}</p>
                                                    </div>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        onClick={() => handlePlayAudio(phrase.translation, index)} 
                                                        disabled={!!isLoading.audio}
                                                        aria-label={`Play audio for "${phrase.translation}"`}
                                                    >
                                                        {isLoading.audio === `phrase-${index}` ? 
                                                            <LoaderCircle className="animate-spin" /> : 
                                                            <Volume2 />
                                                        }
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

function PlanSection({ title, cost, description, icon, cta }: { title: string; cost: number; description: string; icon: React.ReactNode, cta?: React.ReactNode }) {
  return (
    <div>
        <div className="flex items-center gap-4">
            {icon}
            <div>
                <h3 className="text-xl font-bold font-headline">{title}</h3>
                <p className="text-lg font-semibold text-primary">${cost.toLocaleString()}</p>
            </div>
        </div>
      <p className="mt-2 text-muted-foreground">{description}</p>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}


export default function TripPlanResults({ data, isLoading, initialTool }: TripPlanResultsProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (initialTool && data) {
      setIsDialogOpen(true);
    }
  }, [initialTool, data]);

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
            src="https://www.letvisitghana.com/wp-content/uploads/2024/05/Kakum-Canopy-Walk.jpg"
            alt="Scenic view of a Ghanaian canopy walk"
            width={400}
            height={300}
            className="mt-6 rounded-lg object-cover"
            data-ai-hint="ghana canopy walk"
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
            <PlanSection title="Activities" cost={outputs.activities.cost} description={outputs.activities.description} icon={categoryIcons.activities} cta={
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Wand2 className="mr-2 h-4 w-4" /> Plan Details
                </Button>
            } />
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
      <ItineraryDialog 
        planData={data} 
        initialTool={initialTool} 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </Card>
  );
}

    