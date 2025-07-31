
'use client';

import {
  Briefcase,
  Car,
  Check,
  Languages,
  LoaderCircle,
  Pencil,
  Send,
  Volume2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { GenerateItineraryOutput, GenerateLanguageGuideOutput, GeneratePackingListOutput, PackingListItemSchema, PlanTripInput, PlanTripOutput } from '@/ai/schemas';
import { getAudio, getItinerary, getLanguageGuide, getPackingList, postItineraryChat, regenerateItinerary } from '@/app/actions';
import { useEffect, useState, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import Link from 'next/link';
import { marked } from 'marked';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { z } from 'zod';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { ItineraryLoader } from './itinerary-loader';

type TripPlanData = {
  inputs: PlanTripInput;
  outputs: PlanTripOutput;
};

interface ItineraryDialogProps {
    planData: TripPlanData;
    initialTool?: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
}) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
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
            <div className="flex-grow overflow-y-auto pr-4 -mr-4">
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
                        <Pencil className="shrink-0" /> <span className="ml-2">Edit Plan</span>
                    </Button>
                    <Button asChild>
                        <Link href="/drivers">
                            <Car className="shrink-0" /> <span className="ml-2">Find a Driver</span>
                        </Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="https://letvisitghanatours.com" target="_blank">
                            <Briefcase className="shrink-0" /> <span className="ml-2">Book a Tour</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function ItineraryDialog({ planData, initialTool, open, onOpenChange }: ItineraryDialogProps) {
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
    
    useEffect(() => {
        if (open) {
            setActiveTab(initialTool || 'itinerary');
            if (!itinerary) {
                handleGenerateItinerary();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, initialTool]);

    const handleGenerateItinerary = async () => {
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
