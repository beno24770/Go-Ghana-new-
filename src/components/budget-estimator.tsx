'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { z } from 'zod';
import BudgetForm from '@/components/budget-form';
import BudgetResults from '@/components/budget-results';
import { type EstimateBudgetInput, type EstimateBudgetOutput } from '@/ai/schemas';
import { getBudgetEstimate } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

type BudgetData = {
  inputs: EstimateBudgetInput;
  outputs: EstimateBudgetOutput;
};

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

export default function BudgetEstimator() {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formKey, setFormKey] = useState(Date.now());
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const parseUrlParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const data: { [key: string]: any } = {};
    params.forEach((value, key) => {
      data[key] = value;
    });

    const parsed = budgetDataSchema.safeParse(data);
    if (parsed.success) {
      const { duration, region, travelStyle, numTravelers, accommodation, food, transportation, activities, total } = parsed.data;
      setBudgetData({
        inputs: { duration, region, travelStyle, numTravelers },
        outputs: { accommodation, food, transportation, activities, total },
      });
      // Update formKey to re-render the form with new default values
      setFormKey(Date.now()); 
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
      updateUrl(newBudgetData);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
    setIsLoading(false);
  };

  const updateUrl = (data: BudgetData) => {
    const params = new URLSearchParams();
    Object.entries(data.inputs).forEach(([key, value]) => params.append(key, String(value)));
    Object.entries(data.outputs).forEach(([key, value]) => params.append(key, String(value)));
    window.history.pushState(null, '', `?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto max-w-5xl px-4 py-6">
        <Logo />
      </header>
      <main className="container mx-auto max-w-5xl flex-1 px-4 py-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <h2 className="font-headline text-3xl font-bold">Plan Your Trip to Ghana</h2>
            <p className="text-muted-foreground">
              Fill in your travel details below to get a personalized budget estimate for your adventure in the heart of West Africa.
            </p>
            <BudgetForm
              key={formKey}
              onSubmit={handleEstimate}
              isSubmitting={isLoading}
              defaultValues={budgetData?.inputs}
            />
          </div>
          <div className="relative">
            <BudgetResults data={budgetData} isLoading={isLoading} />
          </div>
        </div>
      </main>
      <footer className="container mx-auto max-w-5xl px-4 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} GoGhana Estimator. All rights reserved.</p>
      </footer>
    </div>
  );
}
