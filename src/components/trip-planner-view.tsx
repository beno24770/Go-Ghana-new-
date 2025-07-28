
'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BudgetForm from '@/components/budget-form';
import BudgetResults from '@/components/budget-results';
import TripPlanForm from '@/components/trip-plan-form';
import TripPlanResults from '@/components/trip-plan-results';
import { type EstimateBudgetInput, type EstimateBudgetOutput, type PlanTripInput, type PlanTripOutput, EstimateBudgetInputSchema, PlanTripInputSchema } from '@/ai/schemas';
import { getBudgetEstimate, getTripPlan } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

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
    duration: z.coerce.number(),
    numTravelers: z.coerce.number(),
    region: z.union([z.string(), z.array(z.string())]),
}).merge(z.object({
    "outputs.accommodation.perDay": z.coerce.number(),
    "outputs.accommodation.total": z.coerce.number(),
    "outputs.food.perDay": z.coerce.number(),
    "outputs.food.total": z.coerce.number(),
    "outputs.transportation.perDay": z.coerce.number(),
    "outputs.transportation.total": z.coerce.number(),
    "outputs.activities.perDay": z.coerce.number(),
    "outputs.activities.total": z.coerce.number(),
    "outputs.total": z.coerce.number(),
}));

// Zod schema for parsing trip plan data from URL search params
const planUrlSchema = PlanTripInputSchema.extend({
    duration: z.coerce.number(),
    numTravelers: z.coerce.number(),
    budget: z.coerce.number(),
    region: z.union([z.string(), z.array(z.string())]),
}).merge(z.object({
    "outputs.suggestedTravelStyle": z.enum(['Budget', 'Mid-range', 'Luxury']),
    "outputs.accommodation.cost": z.coerce.number(),
    "outputs.accommodation.description": z.string(),
    "outputs.food.cost": z.coerce.number(),
    "outputs.food.description": z.string(),
    "outputs.transportation.cost": z.coerce.number(),
    "outputs.transportation.description": z.string(),
    "outputs.activities.cost": z.coerce.number(),
    "outputs.activities.description": z.string(),
    "outputs.total": z.coerce.number(),
}));

// Helper to flatten object for URL params
const flattenObject = (obj: any, prefix = '') => {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, flattenObject(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
  }
  return result;
};


export default function TripPlannerView() {
  const [activeTab, setActiveTab] = useState('estimate');
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [tripPlanData, setTripPlanData] = useState<TripPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());
  const [isPending, startTransition] = useTransition();
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const parseUrlParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const tab = params.get('tab') || 'estimate';
    setActiveTab(tab);

    const data: { [key: string]: any } = {};
    for(const [key, value] of params.entries()) {
        data[key] = value;
    }
    const region = params.getAll('region');
    if (region.length > 0) {
        data.region = region.length === 1 ? region[0] : region;
    } else if (params.has('region')) {
        data.region = params.get('region')!;
    }


    if (tab === 'estimate' && params.get('duration')) {
        const parsed = budgetUrlSchema.safeParse(data);
        if (parsed.success) {
            const { duration, region, travelStyle, numTravelers, ...rest } = parsed.data;
            const regionArray = Array.isArray(region) ? region : [region];

            setBudgetData({
                inputs: { duration, region: regionArray, travelStyle, numTravelers },
                outputs: {
                    accommodation: { perDay: rest['outputs.accommodation.perDay'], total: rest['outputs.accommodation.total'] },
                    food: { perDay: rest['outputs.food.perDay'], total: rest['outputs.food.total'] },
                    transportation: { perDay: rest['outputs.transportation.perDay'], total: rest['outputs.transportation.total'] },
                    activities: { perDay: rest['outputs.activities.perDay'], total: rest['outputs.activities.total'] },
                    total: rest['outputs.total'],
                },
            });
            setFormKey(Date.now()); 
        }
    } else if (tab === 'plan' && params.get('budget')) {
        const parsed = planUrlSchema.safeParse(data);
        if (parsed.success) {
            const { budget, duration, numTravelers, region, travelStyle, ...rest } = parsed.data;
            const regionArray = Array.isArray(region) ? region : [region];
            setTripPlanData({
                inputs: { duration, region: regionArray, budget, numTravelers, travelStyle },
                outputs: {
                    suggestedTravelStyle: rest['outputs.suggestedTravelStyle'],
                    accommodation: { cost: rest['outputs.accommodation.cost'], description: rest['outputs.accommodation.description'] },
                    food: { cost: rest['outputs.food.cost'], description: rest['outputs.food.description'] },
                    transportation: { cost: rest['outputs.transportation.cost'], description: rest['outputs.transportation.description'] },
                    activities: { cost: rest['outputs.activities.cost'], description: rest['outputs.activities.description'] },
                    total: rest['outputs.total'],
                },
            });
            setFormKey(Date.now());
        }
    }
  }, [searchParams]);

  useEffect(() => {
    parseUrlParams();
  }, [parseUrlParams]);

  const updateUrl = useCallback((tab: string, data: any) => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    
    const flatData = flattenObject(data);
    for (const key in flatData) {
        if(key === 'inputs.region') {
            if(Array.isArray(flatData[key])) {
                flatData[key].forEach((r: string) => params.append('region', r));
            } else {
                params.append('region', flatData[key]);
            }
        } else {
            params.set(key.replace('inputs.', '').replace('outputs.', 'outputs.'), flatData[key]);
        }
    }

    router.push(`/planner?${params.toString()}`, { scroll: false });
  }, [router]);

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
  
  const handlePlan = useCallback(async (inputs: PlanTripInput) => {
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
  }, [toast, updateUrl]);

  const handlePlanFromBudget = useCallback((budgetInputs: EstimateBudgetInput, totalBudget: number) => {
    const planInputs: PlanTripInput = {
        duration: budgetInputs.duration,
        region: budgetInputs.region,
        numTravelers: budgetInputs.numTravelers,
        budget: totalBudget,
        travelStyle: budgetInputs.travelStyle
    };
    startTransition(() => {
        onTabChange('plan');
        handlePlan(planInputs);
    });
  }, [handlePlan]);

  const onTabChange = (value: string) => {
    startTransition(() => {
        setActiveTab(value);
        const params = new URLSearchParams(window.location.search);
        params.set('tab', value);
        // Clear other params when switching tabs
        const keysToRemove: string[] = [];
        params.forEach((_, key) => {
            if (key !== 'tab') {
                keysToRemove.push(key);
            }
        });
        keysToRemove.forEach(key => params.delete(key));
        router.push(`/planner?${params.toString()}`, { scroll: false });
    });
  }

  return (
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
                      isLoading={(isLoading || isPending) && activeTab === 'estimate'} 
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
                        Enter your total budget, and we'll craft a personalized travel plan for you, complete with suggestions for your stay.
                        </p>
                        <TripPlanForm
                            key={`plan-${formKey}`}
                            onSubmit={handlePlan}
                            isSubmitting={isLoading && activeTab === 'plan'}
                            defaultValues={tripPlanData?.inputs}
                        />
                    </div>
                    <div className="relative">
                        <TripPlanResults data={tripPlanData} isLoading={(isLoading || isPending) && activeTab === 'plan'} />
                    </div>
                </div>
            </TabsContent>
        </Tabs>

      </main>
  );
}
