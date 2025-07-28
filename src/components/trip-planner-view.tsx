'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BudgetForm from '@/components/budget-form';
import BudgetResults from '@/components/budget-results';
import TripPlanForm from '@/components/trip-plan-form';
import TripPlanResults from '@/components/trip-plan-results';
import { type EstimateBudgetInput, type EstimateBudgetOutput, type PlanTripInput, type PlanTripOutput, PlanTripInputSchema, PlanTripOutputSchema, EstimateBudgetInputSchema, EstimateBudgetOutputSchema } from '@/ai/schemas';
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

// Zod schema for parsing budget data from URL search params
const budgetUrlSchema = EstimateBudgetInputSchema.extend({
    region: z.union([z.string(), z.array(z.string())]),
    accommodation: z.coerce.number(),
    food: z.coerce.number(),
    transportation: z.coerce.number(),
    activities: z.coerce.number(),
    total: z.coerce.number(),
    duration: z.coerce.number(),
    numTravelers: z.coerce.number(),
});

// Zod schema for parsing trip plan data from URL search params
const planUrlSchema = PlanTripInputSchema.extend({
    region: z.union([z.string(), z.array(z.string())]),
    budget: z.coerce.number(),
    duration: z.coerce.number(),
    numTravelers: z.coerce.number(),
    suggestedTravelStyle: z.enum(['Budget', 'Mid-range', 'Luxury']),
    accommodation: z.object({
      cost: z.coerce.number(),
      description: z.string(),
    }),
    food: z.object({
      cost: z.coerce.number(),
      description: z.string(),
    }),
    transportation: z.object({
      cost: z.coerce.number(),
      description: z.string(),
    }),
    activities: z.object({
      cost: z.coerce.number(),
      description: z.string(),
    }),
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

    const data: { [key: string]: any } = {};
    for(const [key, value] of params.entries()) {
        if(key === 'region') {
            if(!data.region) data.region = [];
            data.region.push(value);
        } else if (key.includes('.')) { // Handle nested objects e.g. accommodation.cost
            const [parent, child] = key.split('.');
            if (!data[parent]) data[parent] = {};
            data[parent][child] = value;
        } else {
            data[key] = value;
        }
    }
    
    // Ensure single region selections are still wrapped in an array for consistency
    if (data.region && !Array.isArray(data.region)) {
        data.region = [data.region];
    }

    if (tab === 'estimate') {
        const parsed = budgetUrlSchema.safeParse(data);
        if (parsed.success) {
            const { duration, region, travelStyle, numTravelers, accommodation, food, transportation, activities, total } = parsed.data;
            const regionArray = Array.isArray(region) ? region : [region];

            setBudgetData({
                inputs: { duration, region: regionArray, travelStyle, numTravelers },
                outputs: { accommodation, food, transportation, activities, total },
            });
            setFormKey(Date.now()); 
        }
    } else if (tab === 'plan') {
        const parsed = planUrlSchema.safeParse(data);
        if (parsed.success) {
            const { duration, region, budget, numTravelers, ...outputs } = parsed.data;
            const regionArray = Array.isArray(region) ? region : [region];
            setTripPlanData({
                inputs: { duration, region: regionArray, budget, numTravelers },
                outputs: outputs as PlanTripOutput, // Zod parsing ensures this is correct
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

  const handlePlanFromBudget = async (budgetInputs: EstimateBudgetInput, totalBudget: number) => {
    const planInputs: PlanTripInput = {
        duration: budgetInputs.duration,
        region: budgetInputs.region,
        numTravelers: budgetInputs.numTravelers,
        budget: totalBudget
    };
    onTabChange('plan');
    // Set a temporary loading state for the plan results
    setTripPlanData({
        inputs: planInputs,
        outputs: {
            suggestedTravelStyle: "Mid-range",
            accommodation: { cost: 0, description: ""},
            food: { cost: 0, description: ""},
            transportation: { cost: 0, description: ""},
            activities: { cost: 0, description: ""},
            total: 0
        }
    });
    setFormKey(Date.now()); // re-render form with new defaults
    await handlePlan(planInputs);
  }

  const updateUrl = (tab: string, data: any) => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    
    const flattenObject = (obj: any, prefix = '') => {
        Object.entries(obj).forEach(([key, value]) => {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (key === 'region' && Array.isArray(value)) {
                value.forEach(region => params.append(key, region));
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                flattenObject(value, newKey);
            } else if (value !== undefined) {
                params.append(newKey, String(value));
            }
        });
    }

    flattenObject(data.inputs);
    flattenObject(data.outputs);

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
                    isSubmitting={isLoading && activeTab === 'estimate'}
                    defaultValues={budgetData?.inputs}
                    />
                </div>
                <div className="relative">
                    <BudgetResults 
                      data={budgetData} 
                      isLoading={isLoading && activeTab === 'estimate'} 
                      onPlanItinerary={handlePlanFromBudget}
                    />
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
                            isSubmitting={isLoading && activeTab === 'plan'}
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
