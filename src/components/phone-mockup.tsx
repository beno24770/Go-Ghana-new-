
'use client';

import { motion } from 'framer-motion';
import { Badge } from './ui/badge';
import { Mountain, Utensils, BedDouble, MapPin, Mic } from 'lucide-react';

const itineraryItems = [
    { icon: MapPin, title: "Arrive in Accra", details: "Kotoka Int'l Airport", color: 'text-blue-400' },
    { icon: Mountain, title: "Kakum Canopy Walk", details: "Central Region", color: 'text-green-400' },
    { icon: Utensils, title: "Dinner at Oasis", details: "Cape Coast", color: 'text-orange-400' },
    { icon: BedDouble, title: "Stay at Somewhere Nice", details: "Accra", color: 'text-purple-400' },
    { icon: Mic, title: "Live Music at +233", details: "Accra", color: 'text-pink-400' },
    { icon: MapPin, title: "Jamestown Lighthouse", details: "Accra", color: 'text-blue-400' },
];

export function PhoneMockup() {
    return (
        <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
            <div className="w-[120px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-background">
                <div className="w-full h-full p-4 flex flex-col">
                    <div className="text-center pb-2">
                        <p className="font-bold">Your Itinerary</p>
                        <p className="text-xs text-muted-foreground">7-Day Mid-Range Trip</p>
                    </div>
                    <div className="flex-grow space-y-3 overflow-y-auto no-scrollbar">
                        {itineraryItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                    className="p-3 rounded-lg bg-muted/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full bg-background ${item.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.details}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
