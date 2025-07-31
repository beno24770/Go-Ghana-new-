
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Beer, Utensils, BedDouble, Plane } from 'lucide-react';
import { Progress } from './ui/progress';

const items = [
    { icon: Beer, title: "Beers", category: "Drinks", amount: "2.35", ghanaAmount: "₫55,000", color: "bg-purple-500/20 text-purple-400" },
    { icon: Utensils, title: "Noodle soup", category: "Restaurants", amount: "2.13", ghanaAmount: "₫50,000", color: "bg-teal-500/20 text-teal-400" },
    { icon: BedDouble, title: "Hostel in Accra", category: "Accommodation", amount: "21.32", ghanaAmount: "₫500,000", color: "bg-red-500/20 text-red-400" },
    { icon: Plane, title: "Flight to Kumasi", category: "Transport", amount: "45.50", ghanaAmount: "₫1,200,000", color: "bg-blue-500/20 text-blue-400" },
];

const AnimatedPhoneMockup = () => {
    const [currentItem, setCurrentItem] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentItem((prev) => (prev + 1) % items.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const currentTotal = items.slice(0, currentItem + 1).reduce((acc, item) => acc + parseFloat(item.amount), 0);

    return (
        <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
            {/* Notch */}
            <div className="w-[120px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-20"></div>

            {/* Content */}
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-background/80 backdrop-blur-sm">
                <div className="w-full h-full p-4 flex flex-col text-white">
                    {/* Header */}
                    <div className="text-center pb-4 flex items-center justify-between">
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs">7:55</motion.div>
                         <motion.h3
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-bold text-sm"
                        >
                            Around the World
                        </motion.h3>
                        <div />
                    </div>

                    {/* Totals */}
                     <motion.div 
                        className="grid grid-cols-2 gap-4 text-center my-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div>
                            <p className="text-xs text-muted-foreground uppercase">Total</p>
                            <p className="font-bold text-xl">${currentTotal.toFixed(2)}<span className="text-xs text-muted-foreground">/300</span></p>
                            <Progress value={(currentTotal / 300) * 100} className="h-1 mt-1 bg-muted/50" />
                        </div>
                         <div>
                            <p className="text-xs text-muted-foreground uppercase">Daily Average</p>
                            <p className="font-bold text-xl">$54<span className="text-xs text-muted-foreground">/75</span></p>
                             <Progress value={(54/75) * 100} className="h-1 mt-1 bg-muted/50" />
                        </div>
                    </motion.div>

                    {/* List */}
                    <div className="flex-grow space-y-3 overflow-hidden">
                        <p className="text-xs font-bold text-muted-foreground px-2">Today</p>
                        <div className="relative h-full">
                            <AnimatePresence>
                                {items.map((item, index) => (
                                    index === currentItem && (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -50, scale: 0.8 }}
                                            transition={{ duration: 0.5, type: "spring" }}
                                            className="absolute w-full p-4 rounded-lg bg-muted/50 shadow-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${item.color}`}>
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground">{item.category}</p>
                                                </div>
                                                <div className="ml-auto text-right">
                                                    <p className="font-bold">{item.amount}</p>
                                                    <p className="text-xs text-muted-foreground">{item.ghanaAmount}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimatedPhoneMockup;
