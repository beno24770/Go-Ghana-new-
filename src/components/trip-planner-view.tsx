
'use client';

import React, { useState, useEffect, useCallback, useTransition, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BudgetForm from '@/components/budget-form';
import BudgetResults from '@/components/budget-results';
import TripPlanForm from '@/components/trip-plan-form';
import TripPlanResults from '@/components/trip-plan-results';
import { type EstimateBudgetInput, type EstimateBudgetOutput, type PlanTripInput, type PlanTripOutput, PlanTripInputSchema } from '@/ai/schemas';
import { getBudgetEstimate, getTripPlan } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from './ui/skeleton';

type BudgetData = {
  inputs: EstimateBudgetInput;
  outputs: EstimateBudgetOutput;
};

type TripPlanData = {
    inputs: PlanTripInput;
    outputs: PlanTripOutput;
}

function TripPlannerFallback() {
    return (
        <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-6">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <div className="space-y-8 pt-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
            <div className="relative">
                <Skeleton className="h-full min-h-[600px] w-full" />
            </div>
        </div>
    )
}

function TripPlannerViewInternal() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('estimate');
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [tripPlanData, setTripPlanData] = useState<TripPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [planTriggerData, setPlanTriggerData] = useState<PlanTripInput | null>(null);

  const { toast } = useToast();

  const handleEstimate = async (inputs: EstimateBudgetInput) => {
    setIsLoading(true);
    setBudgetData(null);
    const result = await getBudgetEstimate(inputs);
    if (result.success) {
      const newBudgetData = { inputs, outputs: result.data };
      setBudgetData(newBudgetData);
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
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsLoading(false);
  }, [toast]);

  // Effect to run plan generation when triggered from budget results
  useEffect(() => {
    if (planTriggerData) {
      handlePlan(planTriggerData);
      setPlanTriggerData(null); 
    }
  }, [planTriggerData, handlePlan]);

  // Effect to parse URL params and pre-fill the form
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (params.has('duration')) { // A simple check for any relevant param
            const parsed = PlanTripInputSchema.safeParse({
                duration: Number(params.get('duration')),
                region: params.getAll('interests'), // Note: this is likely a bug in original logic, should be region
                budget: Number(params.get('budget')),
                numTravelers: Number(params.get('numTravelers')),
                travelStyle: params.get('travelStyle') || 'Mid-range',
                interests: params.getAll('interests'),
                startDate: params.get('startDate'),
                isNewToGhana: params.get('isNewToGhana') === 'true',
            });
            
            if (parsed.success) {
                startTransition(() => {
                    setActiveTab('plan');
                    setPlanTriggerData(parsed.data);
                });
            } else {
                 // Pre-fill budget form instead if plan params are incomplete
                const budgetDefaults = {
                    duration: params.get('duration') ? Number(params.get('duration')) : 7,
                    region: params.getAll('region').length > 0 ? params.getAll('region') : ['Greater Accra'],
                    interests: params.getAll('interests'),
                    travelStyle: params.get('travelStyle') as any || 'Mid-range',
                };
                setBudgetData(prev => ({
                    ...prev,
                    inputs: { ...prev?.inputs, ...budgetDefaults, numTravelers: 1 } as EstimateBudgetInput
                }));
            }
        }
    }, [searchParams]);


  const handlePlanFromBudget = useCallback((budgetInputs: EstimateBudgetInput, totalBudget: number) => {
    const planInputs: PlanTripInput = {
        duration: budgetInputs.duration,
        region: budgetInputs.region,
        numTravelers: budgetInputs.numTravelers,
        budget: totalBudget,
        travelStyle: budgetInputs.travelStyle,
        interests: budgetInputs.interests,
        startDate: budgetInputs.startDate || new Date().toISOString().split('T')[0],
        isNewToGhana: budgetInputs.isNewToGhana || false,
    };
    
    startTransition(() => {
        setActiveTab('plan');
        setPlanTriggerData(planInputs);
    });
  }, []);

  const handleBackToBudget = () => {
    startTransition(() => {
        setActiveTab('estimate');
        setTripPlanData(null);
    });
  };

  const onTabChange = (value: string) => {
    startTransition(() => {
        if (value === 'plan' && activeTab === 'estimate') {
          // When user manually clicks "Plan a Trip" tab, clear previous results
          setTripPlanData(null);
        } else if (value === 'estimate' && activeTab === 'plan') {
          // When user clicks "Estimate Budget", don't clear results to allow editing
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
                <TabsTrigger value="estimate">1. Estimate Budget</TabsTrigger>
                <TabsTrigger value="plan">2. Plan a Trip</TabsTrigger>
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
                            defaultValues={tripPlanData?.inputs || planTriggerData || budgetData?.inputs}
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
        <Suspense fallback={<TripPlannerFallback />}>
            <TripPlannerViewInternal />
        </Suspense>
    )
}
