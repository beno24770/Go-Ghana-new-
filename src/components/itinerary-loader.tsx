
'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';

const loadingSteps = [
    { text: "Warming up the AI travel engine..." },
    { text: "Scanning for local festivals and events..." },
    { text: "Consulting our database of hidden gems..." },
    { text: "Mapping your daily activities..." },
    { text: "Adding insider tips for an authentic experience..." },
    { text: "Crafting your personalized adventure..." },
    { text: "Finalizing your unique travel plan..." },
];

export function ItineraryLoader() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % loadingSteps.length);
        }, 2500); // Change step every 2.5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            <div className="mt-4 font-headline text-xl h-12">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        {loadingSteps[index].text}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
}
