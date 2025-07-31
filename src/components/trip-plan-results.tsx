
'use client';

import {
  ArrowLeft,
  BedDouble,
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
  Send,
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
import type { ChatWithItineraryOutput, GenerateItineraryOutput, GenerateLanguageGuideOutput, GeneratePackingListOutput, PackingListItemSchema, PhraseSchema, PlanTripInput, PlanTripOutput } from '@/ai/schemas';
import { Badge } from '@/components/ui/badge';
import { getAudio, getItinerary, getLanguageGuide, getPackingList, postItineraryChat, regenerateItinerary } from '@/app/actions';
import { useEffect, useState, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';
import { marked } from 'marked';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { z } from 'zod';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ItineraryLoader } from './itinerary-loader';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';


type TripPlanData = {
  inputs: PlanTripInput;
  outputs: PlanTripOutput;
};

interface TripPlanResultsProps {
  data: TripPlanData | null;
  isLoading: boolean;
  initialTool?: string | null;
  onBack?: () => void;
  showBackButton?: boolean;
}

const categoryIcons = {
  accommodation: <BedDouble className="h-8 w-8 text-primary" />,
  food: <Utensils className="h-8 w-8 text-primary" />,
  transportation: <Car className="h-8 w-8 text-primary" />,
  activities: <Ticket className="h-8 w-8 text-primary" />,
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
type DownloadFormValues = z.infer<typeof downloadFormSchema>;


function DownloadDialog({ onDownload, onOpenChange }: { onDownload: () => Promise<void>; onOpenChange: (open: boolean) => void }) {
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();

    const form = useForm<DownloadFormValues>({
        resolver: zodResolver(downloadFormSchema),
        defaultValues: { name: '', email: '' },
    });

    const onSubmit = async (values: DownloadFormValues) => {
        console.log("Lead captured:", values);
        setIsDownloading(true);
        toast({ title: "Generating PDF...", description: "Your itinerary is being prepared for download." });

        await onDownload();

        setIsDownloading(false);
        onOpenChange(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">Download Your Itinerary</DialogTitle>
                <DialogDescription>
                    Enter your details below to get your personalized itinerary as a PDF.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your name" {...field} disabled={isDownloading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="your@email.com" {...field} disabled={isDownloading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={isDownloading}>
                            {isDownloading ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Now
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
}

const ItineraryContent = ({
  isLoading,
  itinerary,
  isEditing,
  editedItinerary,
  chatHistory,
  onRegenerateItinerary,
  onSetIsEditing,
  onSetEditedItinerary,
  onChatSubmit,
  planData,
}: {
  isLoading: boolean;
  itinerary: GenerateItineraryOutput | null;
  isEditing: boolean;
  editedItinerary: string;
  chatHistory: {role: 'user' | 'model', content: string}[];
  onRegenerateItinerary: () => void;
  onSetIsEditing: (isEditing: boolean) => void;
  onSetEditedItinerary: (value: string) => void;
  onChatSubmit: (message: string) => void;
  planData: TripPlanData;
}) => {
    const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
    const itineraryRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [chatMessage, setChatMessage] = useState('');

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        onChatSubmit(chatMessage);
        setChatMessage('');
    }

    const handleDownloadPdf = async () => {
        const content = itineraryRef.current;
        if (!content) {
            toast({ variant: 'destructive', title: 'Error', description: "Could not find itinerary content to download."});
            return;
        }

        try {
            const canvas = await html2canvas(content, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            
            let imgHeight = pdfWidth / ratio;
            let heightLeft = imgHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            pdf.save('goghana-itinerary.pdf');
            toast({ title: "Success!", description: "Your itinerary has been downloaded." });
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({ variant: 'destructive', title: 'Error', description: "Failed to generate PDF. Please try again." });
        }
    };


    if (isLoading && !itinerary) {
        return (
            <div className="flex h-full min-h-[300px] w-full items-center justify-center">
                <ItineraryLoader />
            </div>
        )
    }
    if (!itinerary) {
         return (
            <div className="text-center p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
                <p className="mb-4 text-muted-foreground">Click the button to generate an itinerary for your trip.</p>
            </div>
        )
    }
    if (isEditing) {
        return (
            <div className="flex flex-col h-full">
                <Textarea 
                    value={editedItinerary}
                    onChange={(e) => onSetEditedItinerary(e.target.value)}
                    className="flex-grow min-h-[300px] text-sm"
                    placeholder="Add your desired destinations or make changes here..."
                />
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => onSetIsEditing(false)}>Cancel</Button>
                    <Button onClick={onRegenerateItinerary} disabled={isLoading}>
                        {isLoading ? <LoaderCircle className="animate-spin" /> : <Wand2 />}
                        <span className="ml-2">Regenerate Itinerary</span>
                    </Button>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-col h-full">
            <div ref={itineraryRef} className="flex-grow overflow-y-auto pr-4 -mr-4">
                <Accordion type="single" collapsible className="w-full" defaultValue="day-1">
                    {itinerary && itinerary.itinerary && itinerary.itinerary.map((dayPlan) => (
                        <AccordionItem value={`day-${dayPlan.day}`} key={dayPlan.day}>
                            <AccordionTrigger className="font-bold hover:no-underline text-left">{dayPlan.title}</AccordionTrigger>
                            <AccordionContent>
                            <div 
                                className="prose dark:prose-invert prose-p:text-foreground prose-strong:text-foreground max-w-none" 
                                dangerouslySetInnerHTML={{ __html: marked.parse(dayPlan.details) as string }} 
                            />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                 {chatHistory.length > 0 && (
                    <div ref={chatContainerRef} className="mt-4 border-t pt-4 space-y-4 max-h-[200px] overflow-y-auto">
                        {chatHistory.map((chat, index) => (
                            <div key={index} className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`rounded-lg px-4 py-2 ${chat.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <div className="prose dark:prose-invert max-w-none prose-p:text-foreground" dangerouslySetInnerHTML={{ __html: marked.parse(chat.content) as string }} />
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start">
                                <div className="rounded-lg px-4 py-2 bg-muted">
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="mt-6 space-y-3 border-t pt-6 text-center bg-muted/20 p-4 rounded-lg -mx-6 -mb-6">
                <h4 className="font-headline text-lg">Chat with your Itinerary</h4>
                <p className="text-sm text-muted-foreground">
                    Ask questions or request changes to your plan.
                </p>
                <form onSubmit={handleFormSubmit} className="mt-4 flex gap-2">
                    <Input 
                        placeholder="e.g., 'Add a museum on Day 2'" 
                        className="flex-1"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>

                <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center pt-4">
                     <Button onClick={() => onSetIsEditing(true)} variant="outline">
                        <Pencil className="shrink-0" /> <span className="ml-2">Edit</span>
                    </Button>
                    <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Download className="shrink-0" /> <span className="ml-2">Download</span></Button>
                        </DialogTrigger>
                        <DownloadDialog onDownload={handleDownloadPdf} onOpenChange={setIsDownloadDialogOpen} />
                    </Dialog>
                    <Button asChild>
                        <Link href="/drivers">
                            <Car className="shrink-0" /> <span className="ml-2">Go Solo</span>
                        </Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="https://letvisitghanatours.com" target="_blank">
                            <Briefcase className="shrink-0" /> <span className="ml-2">Book This Tour</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

function ItineraryDialog({ planData, initialTool, open, onOpenChange }: ItineraryDialogProps) {
    const [isLoading, setIsLoading] = useState({ itinerary: true, packingList: false, languageGuide: false, audio: '', chat: false });
    const [itinerary, setItinerary] = useState<GenerateItineraryOutput | null>(null);
    const [packingList, setPackingList] = useState<GeneratePackingListOutput | null>(null);
    const [languageGuide, setLanguageGuide] = useState<GenerateLanguageGuideOutput | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [activeTab, setActiveTab] = useState('itinerary');
    const [isEditing, setIsEditing] = useState(false);
    const [editedItinerary, setEditedItinerary] = useState('');
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', content: string}[]>([]);

    const { toast } = useToast();

    const itineraryAsMarkdown = useMemo(() => {
        if (!itinerary) return '';
        return itinerary.itinerary.map(day => `### ${day.title}\n\n${day.details}`).join('\n\n');
    }, [itinerary]);
    
    useEffect(() => {
        if (open) {
            setActiveTab(initialTool || 'itinerary');
            setItinerary(null);
            setChatHistory([]);
            handleGenerateItinerary();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initialTool]);

    const handleGenerateItinerary = async () => {
        setIsLoading(prev => ({...prev, itinerary: true}));
        setItinerary(null);
        setIsEditing(false);
        const result = await getItinerary({
            duration: planData.inputs.duration,
            region: planData.inputs.region,
            travelStyle: planData.outputs.suggestedTravelStyle,
            activitiesBudget: planData.outputs.activities.cost,
            startDate: planData.inputs.startDate,
            interests: planData.inputs.interests,
        });

        if (result.success) {
            setItinerary(result.data);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsLoading(prev => ({...prev, itinerary: false}));
    }

    useEffect(() => {
        if (itineraryAsMarkdown) {
            setEditedItinerary(itineraryAsMarkdown);
        }
    }, [itineraryAsMarkdown]);

    const handleRegenerateItinerary = async () => {
        setIsLoading(prev => ({ ...prev, itinerary: true }));
        setItinerary(null);
        const result = await regenerateItinerary({ 
            notes: editedItinerary,
            startDate: planData.inputs.startDate,
            duration: planData.inputs.duration,
            region: planData.inputs.region
        });
        if (result.success) {
            setItinerary(result.data);
            setIsEditing(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsLoading(prev => ({ ...prev, itinerary: false }));
    };

    const handleChatSubmit = async (message: string) => {
        if (!itinerary) return;

        setIsLoading(prev => ({...prev, chat: true}));
        setChatHistory(prev => [...prev, {role: 'user', content: message}]);
        
        const currentItineraryMd = itineraryAsMarkdown;

        const result = await postItineraryChat({
            currentItinerary: currentItineraryMd,
            userMessage: message,
            startDate: planData.inputs.startDate,
            duration: planData.inputs.duration,
            region: planData.inputs.region,
        });

        if (result.success) {
            setChatHistory(prev => [...prev, {role: 'model', content: result.data.response}]);
            if (result.data.itinerary) {
                setItinerary({ itinerary: result.data.itinerary });
            }
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
            setChatHistory(prev => prev.slice(0, -1)); // Remove user message on error
        }
        setIsLoading(prev => ({...prev, chat: false}));
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
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90svh] flex flex-col p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Your Trip Tools</DialogTitle>
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
                           <ItineraryContent
                             isLoading={isLoading.itinerary || isLoading.chat}
                             itinerary={itinerary}
                             isEditing={isEditing}
                             editedItinerary={editedItinerary}
                             chatHistory={chatHistory}
                             onRegenerateItinerary={handleRegenerateItinerary}
                             onSetIsEditing={setIsEditing}
                             onSetEditedItinerary={setEditedItinerary}
                             onChatSubmit={handleChatSubmit}
                             planData={planData}
                           />
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
            {cta && <div className="mt-4">{cta}</div>}
        </div>
    </div>
  );
}


export default function TripPlanResults({ data, isLoading, initialTool, onBack, showBackButton }: TripPlanResultsProps) {
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
            <PlanSection title="Accommodation" cost={outputs.accommodation.cost} description={outputs.accommodation.description} icon={categoryIcons.accommodation} />
            <PlanSection title="Food" cost={outputs.food.cost} description={outputs.food.description} icon={categoryIcons.food} />
            <PlanSection title="Transportation" cost={outputs.transportation.cost} description={outputs.transportation.description} icon={categoryIcons.transportation} />
            <PlanSection title="Activities" cost={outputs.activities.cost} description={outputs.activities.description} icon={categoryIcons.activities} cta={
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Wand2 className="mr-2 h-4 w-4 shrink-0" /> View & Customize Itinerary
                </Button>
            } />
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
      {data && (
        <ItineraryDialog 
            planData={data} 
            initialTool={initialTool} 
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
        />
      )}
    </Card>
  );
}
