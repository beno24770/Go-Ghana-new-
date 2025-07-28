'use server';

import { estimateBudget } from '@/ai/flows/estimate-budget';
import { planTrip } from '@/ai/flows/plan-trip';
import {
  type EstimateBudgetInput,
  type EstimateBudgetOutput,
  type PlanTripInput,
  type PlanTripOutput,
} from '@/ai/schemas';

export async function getBudgetEstimate(
  data: EstimateBudgetInput
): Promise<{ success: true; data: EstimateBudgetOutput } | { success: false; error: string }> {
  try {
    const result = await estimateBudget(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error estimating budget:', error);
    return { success: false, error: 'Failed to estimate budget. Please try again.' };
  }
}

export async function getTripPlan(
  data: PlanTripInput
): Promise<{ success: true; data: PlanTripOutput } | { success: false; error: string }> {
  try {
    const result = await planTrip(data);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error planning trip:', error);
    return { success: false, error: 'Failed to plan trip. Please try again.' };
  }
}
