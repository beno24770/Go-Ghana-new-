
'use client';

import React, { useState, useEffect, useCallback, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BudgetForm from '@/components/budget-form';
import BudgetResults from '@/components/budget-results';
import TripPlanForm from '@/components/trip-plan-form';
import TripPlanResults from '@/components/trip-plan-results';
import { type EstimateBudgetInput, type EstimateBudgetOutput, type PlanTripInput, type PlanTripOutput, PlanTripBaseSchema, EstimateBudgetBaseSchema } from '@/ai/schemas';
import { getBudgetEstimate, getTripPlan } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type BudgetData = {
  inputs: EstimateBudgetInput;
  outputs: EstimateBudgetOutput;
};

type TripPlanData = {
    inputs: PlanTripInput;
    outputs: PlanTripOutput;
}

// Zod schema for parsing budget data from URL search params
const budgetUrlSchema = EstimateBudgetBaseSchema.extend({
    duration: z.coerce.number(),
    numTravelers: z.coerce.number(),
    region: z.union([z.string(), z.array(z.string())]),
    isNewToGhana: z.string().transform(v => v === 'true').optional(),
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
const planUrlSchema = PlanTripBaseSchema.extend({
    duration: z.coerce.number(),
    numTravelers: z.coerce.number(),
    budget: z.coerce.number(),
    region: z.union([z.string(), z.array(z.string())]),
    interests: z.union([z.string(), z.array(z.string())]).optional(),
    isNewToGhana: z.string().transform(v => v === 'true').optional(),
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


function TripPlannerViewInternal() {
  const [activeTab, setActiveTab] = useState('estimate');
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [tripPlanData, setTripPlanData] = useState<TripPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [planTriggerData, setPlanTriggerData] = useState<PlanTripInput | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

 const updateUrl = useCallback((tab: string, data: any) => {
    startTransition(() => {
        const params = new URLSearchParams();
        params.set('tab', tab);
        
        const flatData = flattenObject(data);
        
        for (const key in flatData) {
            const urlKey = key.replace('inputs.', '').replace('outputs.', 'outputs.');
            const value = flatData[key];

            if (key === 'inputs.region' || key === 'inputs.interests') {
                if (Array.isArray(value)) {
                    // clear old values first
                    params.delete(urlKey);
                    value.forEach((item: string) => params.append(urlKey, item));
                }
            } else if (value !== undefined && value !== null) {
                 params.set(urlKey, String(value));
            }
        }
        router.push(`/planner?${params.toString()}`, { scroll: false });
    });
  }, [router]);
  
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

  // Effect to run plan generation when triggered from budget results
  useEffect(() => {
    if (planTriggerData) {
      handlePlan(planTriggerData);
      setPlanTriggerData(null); 
    }
  }, [planTriggerData, handlePlan]);

  const parseUrlParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const tab = params.get('tab') || 'estimate';
    setActiveTab(tab);

    const data: { [key: string]: any } = {};
    for(const [key, value] of params.entries()) {
        data[key] = value;
    }

    if (params.has('region')) {
        data.region = params.getAll('region');
    }
    
    if (params.has('interests')) {
        data.interests = params.getAll('interests');
    } else {
        data.interests = [];
    }

    if (tab === 'estimate' && params.has('duration')) {
        const parsed = budgetUrlSchema.safeParse(Object.fromEntries(params));
        if (parsed.success) {
            const { duration, region, travelStyle, numTravelers, startDate, isNewToGhana, ...rest } = parsed.data;
            const regionArray = Array.isArray(region) ? region : [region];

            setBudgetData({
                inputs: { duration, region: regionArray, travelStyle, numTravelers, startDate, isNewToGhana },
                outputs: {
                    accommodation: { perDay: rest['outputs.accommodation.perDay'], total: rest['outputs.accommodation.total'] },
                    food: { perDay: rest['outputs.food.perDay'], total: rest['outputs.food.total'] },
                    transportation: { perDay: rest['outputs.transportation.perDay'], total: rest['outputs.transportation.total'] },
                    activities: { perDay: rest['outputs.activities.perDay'], total: rest['outputs.activities.total'] },
                    total: rest['outputs.total'],
                },
            });
        }
    } else if (tab === 'plan' && params.has('outputs.total')) {
         const parsedPlan = planUrlSchema.safeParse(Object.fromEntries(params));
         if (parsedPlan.success) {
            const { budget, duration, numTravelers, region, travelStyle, interests, startDate, isNewToGhana, ...rest } = parsedPlan.data;
            const regionArray = Array.isArray(region) ? region : [region];
            const interestsArray = Array.isArray(interests) ? interests : (interests ? [interests] : []);
            setTripPlanData({
                inputs: { duration, region: regionArray, budget, numTravelers, travelStyle, interests: interestsArray, startDate, isNewToGhana },
                outputs: {
                    suggestedTravelStyle: rest['outputs.suggestedTravelStyle'],
                    accommodation: { cost: rest['outputs.accommodation.cost'], description: rest['outputs.accommodation.description'] },
                    food: { cost: rest['outputs.food.cost'], description: rest['outputs.food.description'] },
                    transportation: { cost: rest['outputs.transportation.cost'], description: rest['outputs.transportation.description'] },
                    activities: { cost: rest['outputs.activities.cost'], description: rest['outputs.activities.description'] },
                    total: rest['outputs.total'],
                },
            });
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

  const handlePlanFromBudget = useCallback((budgetInputs: EstimateBudgetInput, totalBudget: number) => {
    const planInputs: PlanTripInput = {
        duration: budgetInputs.duration,
        region: budgetInputs.region,
        numTravelers: budgetInputs.numTravelers,
        budget: totalBudget,
        travelStyle: budgetInputs.travelStyle,
        interests: ['Culture', 'Heritage & History'],
        startDate: budgetInputs.startDate || new Date().toISOString().split('T')[0],
        isNewToGhana: budgetInputs.isNewToGhana,
    };
    
    setActiveTab('plan');
    setPlanTriggerData(planInputs);
  }, []);

  const handleBackToBudget = () => {
    if (budgetData) {
        onTabChange('estimate');
        setTripPlanData(null);
        updateUrl('estimate', budgetData);
    } else {
        onTabChange('estimate');
        setTripPlanData(null);
    }
  };

  const onTabChange = (value: string) => {
    startTransition(() => {
        const params = new URLSearchParams();
        params.set('tab', value);

        if (value === 'plan') {
          // When user manually clicks "Plan a Trip" tab, clear everything.
          setBudgetData(null);
          setTripPlanData(null);
          router.push(`/planner?${params.toString()}`, { scroll: false });

        } else if (value === 'estimate') {
          // When user clicks "Estimate Budget", clear everything.
           setBudgetData(null);
           setTripPlanData(null);
           router.push(`/planner?${params.toString()}`, { scroll: false });
        }
        setActiveTab(value);
    });
  }

  return (
      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8 flex items-center">
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
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
                    Select your travel style and dates to get a personalized budget estimate for your adventure in the heart of West Africa.
                    </p>
                    <BudgetForm
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
                        Enter your total budget, travel dates, and interests, and we'll craft a personalized travel plan for you, complete with suggestions for your stay.
                        </p>
                        <TripPlanForm
                            onSubmit={handlePlan}
                            isSubmitting={isLoading && activeTab === 'plan'}
                            defaultValues={tripPlanData?.inputs}
                        />
                    </div>
                    <div className="relative">
                        <TripPlanResults 
                            data={tripPlanData} 
                            isLoading={(isLoading || isPending) && activeTab === 'plan'}
                            onBack={handleBackToBudget}
                            showBackButton={!!budgetData}
                        />
                    </div>
                </div>
            </TabsContent>
        </Tabs>
      </main>
  );
}

export default function TripPlannerView() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>}>
            <TripPlannerViewInternal />
        </Suspense>
    )
}

    