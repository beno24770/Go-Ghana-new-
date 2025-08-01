
'use client';

import {
  Briefcase,
  Car,
  Check,
  Download,
  Languages,
  LoaderCircle,
  MessageSquare,
  Pencil,
  Send,
  Volume2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { DayItinerarySchema as DayItinerary, GenerateItineraryOutput, GenerateLanguageGuideOutput, GeneratePackingListOutput, PackingListItemSchema, PlanTripInput, PlanTripOutput } from '@/ai/schemas';
import { getAudio, getItinerary, getLanguageGuide, getPackingList, postItineraryChat, regenerateItinerary } from '@/app/actions';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';
import { marked } from 'marked';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { z } from 'zod';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { ItineraryLoader } from './itinerary-loader';
import { Logo } from './logo';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';


type TripPlanData = {
  inputs: PlanTripInput;
  outputs: PlanTripOutput;
};

// Simple in-memory cache
const toolCache = new Map<string, any>();
function getCacheKey(planData: TripPlanData, tool: string) {
    return `${JSON.stringify(planData.inputs)}-${tool}`;
}

const ItineraryDayRow = ({ dayPlan, isPdf = false }: { dayPlan: z.infer<typeof DayItinerary>, isPdf?: boolean }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] border-b last:border-b-0">
            <div className={cn("p-4 font-semibold", isPdf ? "text-sm" : "text-base")}>
                <p className="font-bold">{dayPlan.dayOfWeek}</p>
                <p>{dayPlan.date}</p>
                <p className="mt-2 text-primary">{dayPlan.location}</p>
                {dayPlan.driveTime && (
                     <p className="text-xs text-muted-foreground mt-1">{dayPlan.driveTime}</p>
                )}
            </div>
            <div className={cn("p-4 border-t md:border-t-0 md:border-l", isPdf ? "border-black/20" : "border-border")}>
                 <h4 className={cn("font-bold", isPdf ? "text-base" : "text-lg")}>{dayPlan.title}</h4>
                 <div 
                    className={cn(
                        "prose prose-sm max-w-none",
                         isPdf ? "prose-p:text-black prose-strong:text-black" : "dark:prose-invert prose-p:text-foreground prose-strong:text-foreground"
                    )}
                    dangerouslySetInnerHTML={{ __html: marked.parse(dayPlan.details) as string }} 
                />
                {dayPlan.budget && (
                     <div className="mt-4 pt-2 border-t border-dashed border-border">
                        <h5 className="font-semibold text-xs uppercase text-muted-foreground">Est. Budget</h5>
                        <div 
                            className={cn(
                                "prose prose-sm max-w-none",
                                isPdf ? "prose-p:text-black prose-strong:text-black" : "dark:prose-invert prose-p:text-foreground prose-strong:text-foreground"
                            )}
                            dangerouslySetInnerHTML={{ __html: marked.parse(dayPlan.budget) as string }} 
                        />
                     </div>
                )}
            </div>
        </div>
    )
}

const ItineraryForPDF = ({ itinerary, tripData }: { itinerary: GenerateItineraryOutput, tripData: TripPlanData }) => (
    <div id="itinerary-pdf" className="p-8 bg-white text-black w-[800px]">
        <header className="flex justify-between items-center border-b-2 pb-4 border-black">
            <Logo />
            <div className="text-right">
                <p className="font-bold text-lg">{tripData.inputs.duration}-Day Trip to Ghana</p>
                <p className="text-sm">For {tripData.inputs.numTravelers} traveler(s)</p>
            </div>
        </header>
        <main className="py-4">
            <div className="border border-black/20 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] bg-gray-100 font-bold text-sm border-b border-black/20 rounded-t-lg">
                     <div className="p-2">Overnight & Drive Time</div>
                     <div className="p-2 border-l border-black/20">Itinerary & Details</div>
                </div>
                 {itinerary.itinerary.map((dayPlan) => (
                    <ItineraryDayRow key={dayPlan.day} dayPlan={dayPlan} isPdf={true} />
                ))}
            </div>
        </main>
        <footer className="text-center text-xs border-t-2 pt-4 border-black mt-4">
            <p>Generated by GoGhana Planner | LetVisitGhana</p>
            <p>Contact: info@letvisitghana.com | +233 20 063 5250</p>
        </footer>
    </div>
);


interface ItineraryDialogProps {
    planData: TripPlanData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ItineraryContent = ({
  isLoading,
  itinerary,
  isEditing,
  editedItinerary,
  chatHistory,
  planData,
  onRegenerateItinerary,
  onSetIsEditing,
  onSetEditedItinerary,
  onChatSubmit,
}: {
  isLoading: boolean;
  itinerary: GenerateItineraryOutput | null;
  isEditing: boolean;
  editedItinerary: string;
  chatHistory: {role: 'user' | 'model', content: string}[];
  planData: TripPlanData;
  onRegenerateItinerary: () => void;
  onSetIsEditing: (isEditing: boolean) => void;
  onSetEditedItinerary: (value: string) => void;
  onChatSubmit: (message: string) => void;
}) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [chatMessage, setChatMessage] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const { toast } = useToast();

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

    const handleDownloadPDF = async () => {
        if (!itinerary) return;

        if(!userName || !userEmail) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter your name and email to download.' });
            return;
        }

        setIsDownloading(true);
        const pdfElement = document.getElementById('itinerary-pdf');
        if (!pdfElement) {
            setIsDownloading(false);
            return;
        }

        const canvas = await html2canvas(pdfElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'px', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        const ratio = imgWidth / pdfWidth;
        const newImgHeight = imgHeight / ratio;

        let heightLeft = newImgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, newImgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - newImgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, newImgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`GoGhana_Itinerary_${userName.replace(' ', '_')}.pdf`);

        setIsDownloading(false);
        // Maybe close the dialog here, or just show a success toast
        toast({ title: 'Success', description: 'Your itinerary has been downloaded.' });
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
             <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
                {itinerary && <ItineraryForPDF itinerary={itinerary} tripData={planData} />}
            </div>
            <div className="flex-grow overflow-y-auto pr-4 -mr-4">
                 <div className="border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] bg-muted/50 font-bold text-sm border-b rounded-t-lg">
                        <div className="p-2">Overnight & Drive Time</div>
                        <div className="p-2 border-l">Itinerary & Details</div>
                    </div>
                    {itinerary && itinerary.itinerary && itinerary.itinerary.map((dayPlan) => (
                        <ItineraryDayRow key={dayPlan.day} dayPlan={dayPlan} />
                    ))}
                </div>

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
                        <Pencil className="shrink-0" /> <span className="ml-2">Edit Plan</span>
                    </Button>
                    <Button asChild>
                        <Link href="/drivers">
                            <Car className="shrink-0" /> <span className="ml-2">Find a Driver</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="https://wa.me/233200635250" target="_blank">
                           <MessageSquare className="shrink-0" /> <span className="ml-2">Talk to a Planner</span>
                        </Link>
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" disabled={isDownloading}>
                                {isDownloading ? <LoaderCircle className="animate-spin" /> : <Download />}
                                <span className="ml-2">Download Itinerary</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Download Your Itinerary</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Please enter your name and email to download the itinerary as a PDF.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" placeholder="Your Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="your@email.com" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDownloadPDF} disabled={isDownloading}>
                                    {isDownloading ? <LoaderCircle className="animate-spin mr-2"/> : null}
                                    Download
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    )
}

export function ItineraryDialog({ planData, open, onOpenChange }: ItineraryDialogProps) {
    const [isLoading, setIsLoading] = useState({ itinerary: false, packingList: false, languageGuide: false, audio: '', chat: false });
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
    
     const handleGenerateItinerary = useCallback(async () => {
        const cacheKey = getCacheKey(planData, 'itinerary');
        if (toolCache.has(cacheKey)) {
            setItinerary(toolCache.get(cacheKey));
            return;
        }

        setIsLoading(prev => ({...prev, itinerary: true, chat: false}));
        setItinerary(null);
        setChatHistory([]);
        setIsEditing(false);
        const result = await getItinerary({
            duration: planData.inputs.duration,
            region: planData.inputs.region,
            travelStyle: planData.outputs.suggestedTravelStyle,
            activitiesBudget: planData.outputs.activities.cost,
            startDate: planData.inputs.startDate,
            interests: planData.inputs.interests,
            isNewToGhana: planData.inputs.isNewToGhana,
        });

        if (result.success) {
            setItinerary(result.data);
            toolCache.set(cacheKey, result.data);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsLoading(prev => ({...prev, itinerary: false}));
    }, [planData, toast]);

    useEffect(() => {
        if (open) {
            const newActiveTab = 'itinerary';
            setActiveTab(newActiveTab);
            if (newActiveTab === 'itinerary' && !itinerary) {
                handleGenerateItinerary();
            }
        }
    }, [open, itinerary, handleGenerateItinerary]);

    useEffect(() => {
        if (itineraryAsMarkdown) {
            setEditedItinerary(itineraryAsMarkdown);
        }
    }, [itineraryAsMarkdown]);

    const handleRegenerateItinerary = async () => {
        setIsLoading(prev => ({ ...prev, itinerary: true, chat: false }));
        setItinerary(null);
        const result = await regenerateItinerary({ 
            notes: editedItinerary,
            startDate: planData.inputs.startDate,
            duration: planData.inputs.duration,
            region: planData.inputs.region
        });
        if (result.success) {
            setItinerary(result.data);
            toolCache.set(getCacheKey(planData, 'itinerary'), result.data); // Update cache
            setIsEditing(false);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsLoading(prev => ({ ...prev, itinerary: false }));
    };

    const handleChatSubmit = async (message: string) => {
        if (!itinerary) return;

        setIsLoading(prev => ({...prev, chat: true, itinerary: false}));
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
                const newItinerary = { itinerary: result.data.itinerary };
                setItinerary(newItinerary);
                toolCache.set(getCacheKey(planData, 'itinerary'), newItinerary); // Update cache
            }
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
            setChatHistory(prev => prev.slice(0, -1)); // Remove user message on error
        }
        setIsLoading(prev => ({...prev, chat: false}));
    }

    const handleGeneratePackingList = async () => {
        const cacheKey = getCacheKey(planData, 'packingList');
        if (toolCache.has(cacheKey)) {
            setPackingList(toolCache.get(cacheKey));
            return;
        }
        setIsLoading(prev => ({...prev, packingList: true}));
        setPackingList(null);
        const result = await getPackingList({
            duration: planData.inputs.duration,
            region: planData.inputs.region,
            travelStyle: planData.outputs.suggestedTravelStyle,
        });

        if (result.success) {
            setPackingList(result.data);
            toolCache.set(cacheKey, result.data);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
        setIsLoading(prev => ({...prev, packingList: false}));
    }

    const handleGenerateLanguageGuide = async () => {
        const cacheKey = getCacheKey(planData, 'languageGuide');
        if (toolCache.has(cacheKey)) {
            setLanguageGuide(toolCache.get(cacheKey));
            return;
        }

        setIsLoading(prev => ({...prev, languageGuide: true}));
        setLanguageGuide(null);
        const result = await getLanguageGuide({ region: planData.inputs.region });

        if (result.success) {
            setLanguageGuide(result.data);
            toolCache.set(cacheKey, result.data);
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
                             planData={planData}
                             onRegenerateItinerary={handleRegenerateItinerary}
                             onSetIsEditing={setIsEditing}
                             onSetEditedItinerary={setEditedItinerary}
                             onChatSubmit={handleChatSubmit}
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
