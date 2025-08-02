
'use client';

import { useState } from 'react';
import { Mountain, Utensils, BedDouble, MapPin, Mic, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const itineraryItems = [
    { id: 1, icon: MapPin, title: "Arrive in Accra", details: "Kotoka Int'l Airport", description: "Welcome to Ghana! Settle into your hotel.", travelTime: "45 min drive", color: 'text-blue-400' },
    { id: 2, icon: Mountain, title: "Kakum Canopy Walk", details: "Central Region", description: "Walk among the treetops of a lush rainforest.", travelTime: "3.5 hour drive", color: 'text-green-400' },
    { id: 3, icon: Utensils, title: "Dinner at Oasis", details: "Cape Coast", description: "Enjoy fresh seafood with ocean views.", travelTime: "Local", color: 'text-orange-400' },
    { id: 4, icon: BedDouble, title: "Stay at Somewhere Nice", details: "Accra", description: "Relax at a vibrant, traveler-friendly guesthouse.", travelTime: "Local", color: 'text-purple-400' },
    { id: 5, icon: Mic, title: "Live Music at +233", details: "Accra", description: "Experience the best live highlife and jazz music.", travelTime: "Local", color: 'text-pink-400' },
    { id: 6, icon: MapPin, title: "Jamestown Lighthouse", details: "Accra", description: "Explore historic Jamestown and its fishing community.", travelTime: "Local", color: 'text-blue-400' },
];

export function PhoneMockup() {
    const [expandedId, setExpandedId] = useState<number | null>(2);

    const handleTap = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
            <div className="w-[120px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-background">
                <div className="w-full h-full p-4 flex flex-col">
                    <div className="text-center pb-2 flex-shrink-0">
                        <p className="font-bold">Your Itinerary</p>
                        <p className="text-xs text-muted-foreground">7-Day Mid-Range Trip</p>
                    </div>
                    <div className="flex-grow space-y-2 overflow-y-auto no-scrollbar pr-1">
                        {itineraryItems.map((item, index) => {
                            const Icon = item.icon;
                            const isExpanded = expandedId === item.id;
                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "p-3 rounded-lg bg-muted/50 cursor-pointer transition-all duration-300 hover:bg-muted animate-in fade-in slide-in-from-bottom-4",
                                    )}
                                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                                    onClick={() => handleTap(item.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full bg-background ${item.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.details}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "grid transition-all duration-300 ease-in-out",
                                        isExpanded ? "grid-rows-[1fr] opacity-100 pt-2 mt-2 border-t border-dashed" : "grid-rows-[0fr] opacity-0"
                                    )}>
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-muted-foreground pb-1">{item.description}</p>
                                            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                                                <Clock className="w-3 h-3"/>
                                                <span>{item.travelTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
