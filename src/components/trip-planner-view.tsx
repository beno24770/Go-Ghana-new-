'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BudgetForm from '@/components/budget-form';
import BudgetResults from '@/components/budget-results';
import TripPlanForm from '@/components/trip-plan-form';
import TripPlanResults from '@/components/trip-plan-results';
import { type EstimateBudgetInput, type EstimateBudgetOutput, type PlanTripInput, type PlanTripOutput, PlanTripOutputSchema } from '@/ai/schemas';
import { getBudgetEstimate, getTripPlan } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

type BudgetData = {
  inputs: EstimateBudgetInput;
  outputs: EstimateBudgetOutput;
};

type TripPlanData = {
    inputs: PlanTripInput;
    outputs: PlanTripOutput;
}

const budgetDataSchema = z.object({
  duration: z.coerce.number().int().min(1),
  region: z.string(),
  travelStyle: z.enum(['Budget', 'Mid-range', 'Luxury']),
  numTravelers: z.coerce.number().int().min(1),
  accommodation: z.coerce.number(),
  food: z.coerce.number(),
  transportation: z.coerce.number(),
  activities: z.coerce.number(),
  total: z.coerce.number(),
});

const planDataSchema = z.object({
    duration: z.coerce.number().int().min(1),
    region: z.string(),
    budget: z.coerce.number().int().min(1),
    numTravelers: z.coerce.number().int().min(1),
    suggestedTravelStyle: z.enum(['Budget', 'Mid-range', 'Luxury']),
    accommodationCost: z.coerce.number(),
    accommodationDesc: z.string(),
    foodCost: z.coerce.number(),
    foodDesc: z.string(),
    transportationCost: z.coerce.number(),
    transportationDesc: z.string(),
    activitiesCost: z.coerce.number(),
    activitiesDesc: z.string(),
    total: z.coerce.number(),
  });

export default function TripPlannerView() {
  const [activeTab, setActiveTab] = useState('estimate');
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [tripPlanData, setTripPlanData] = useState<TripPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const parseUrlParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const tab = params.get('tab') || 'estimate';
    setActiveTab(tab);

    if (tab === 'estimate') {
        const data: { [key: string]: any } = {};
        params.forEach((value, key) => data[key] = value);
        const parsed = budgetDataSchema.safeParse(data);
        if (parsed.success) {
            const { duration, region, travelStyle, numTravelers, accommodation, food, transportation, activities, total } = parsed.data;
            setBudgetData({
                inputs: { duration, region, travelStyle, numTravelers },
                outputs: { accommodation, food, transportation, activities, total },
            });
            setFormKey(Date.now()); 
        }
    } else if (tab === 'plan') {
        const data: { [key: string]: any } = {};
        // Manually map flat params to nested structure for parsing
        params.forEach((value, key) => {
            if (key.endsWith('Cost')) {
                const newKey = key.replace('Cost', '.cost');
                const [parent, child] = newKey.split('.');
                if (!data[parent]) data[parent] = {};
                data[parent][child] = value;
            } else if (key.endsWith('Desc')) {
                const newKey = key.replace('Desc', '.description');
                const [parent, child] = newKey.split('.');
                if (!data[parent]) data[parent] = {};
                data[parent][child] = value;
            } else {
                data[key] = value;
            }
        });

        const parsed = PlanTripOutputSchema.extend({
            duration: z.coerce.number().int().min(1),
            region: z.string(),
            budget: z.coerce.number().int().min(1),
            numTravelers: z.coerce.number().int().min(1),
        }).safeParse(data);

        if (parsed.success) {
            const { duration, region, budget, numTravelers, ...outputs } = parsed.data;
            setTripPlanData({
                inputs: { duration, region, budget, numTravelers },
                outputs: outputs,
            });
            setFormKey(Date.now());
        }
    }
  }, [searchParams]);

  useEffect(() => {
    parseUrlParams();
  }, [parseUrlParams]);

  const handleEstimate = async (inputs: EstimateBudgetInput) => {
    setIsLoading(true);
    setBudgetData(null);
    const result = await getBudgetEstimate(inputs);
    if (result.success) {
      const newBudgetData = { inputs, outputs: result.data };
      setBudgetData(newBudgetData);
      updateUrl('estimate', newBudgetData);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsLoading(false);
  };
  
  const handlePlan = async (inputs: PlanTripInput) => {
    setIsLoading(true);
    setTripPlanData(null);
    const result = await getTripPlan(inputs);
    if (result.success) {
        const newTripPlanData = { inputs, outputs: result.data };
        setTripPlanData(newTripPlanData);
        updateUrl('plan', newTripPlanData);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsLoading(false);
  }

  const updateUrl = (tab: string, data: any) => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    Object.entries(data.inputs).forEach(([key, value]) => params.append(key, String(value)));
    
    // Flatten the outputs for the URL
    Object.entries(data.outputs).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([subKey, subValue]) => {
                const paramKey = `${key}${subKey.charAt(0).toUpperCase() + subKey.slice(1)}`;
                params.append(paramKey, String(subValue));
            });
        } else {
            params.append(key, String(value));
        }
    });

    router.push(`?${params.toString()}`, { scroll: false });
  };
  
  const onTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', value);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto max-w-5xl px-4 py-6">
        <Logo />
      </header>
      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="estimate">Estimate Budget</TabsTrigger>
                <TabsTrigger value="plan">Plan a Trip</TabsTrigger>
            </TabsList>
            <TabsContent value="estimate">
                <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
                <div className="space-y-6">
                    <h2 className="font-headline text-3xl font-bold">Estimate Your Ghana Trip Cost</h2>
                    <p className="text-muted-foreground">
                    Select your travel style to get a personalized budget estimate for your adventure in the heart of West Africa.
                    </p>
                    <BudgetForm
                    key={`budget-${formKey}`}
                    onSubmit={handleEstimate}
                    isSubmitting={isLoading}
                    defaultValues={budgetData?.inputs}
                    />
                </div>
                <div className="relative">
                    <BudgetResults data={budgetData} isLoading={isLoading && activeTab === 'estimate'} />
                </div>
                </div>
            </TabsContent>
            <TabsContent value="plan">
                <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
                    <div className="space-y-6">
                        <h2 className="font-headline text-3xl font-bold">Plan Your Trip to Ghana</h2>
                        <p className="text-muted-foreground">
                        Enter your total budget, and we'll generate a custom travel plan for you, complete with suggestions for your stay.
                        </p>
                        <TripPlanForm
                            key={`plan-${formKey}`}
                            onSubmit={handlePlan}
                            isSubmitting={isLoading}
                            defaultValues={tripPlanData?.inputs}
                        />
                    </div>
                    <div className="relative">
                        <TripPlanResults data={tripPlanData} isLoading={isLoading && activeTab === 'plan'} />
                    </div>
                </div>
            </TabsContent>
        </Tabs>

      </main>
      <footer className="container mx-auto max-w-5xl px-4 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} GoGhana Planner. All rights reserved.</p>
      </footer>
    </div>
  );
}
