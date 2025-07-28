'use server';

import { estimateBudget } from '@/ai/flows/estimate-budget';
import { generateItinerary } from '@/ai/flows/generate-itinerary';
import { generatePackingList } from '@/ai/flows/generate-packing-list';
import { planTrip } from '@/ai/flows/plan-trip';
import {
  type EstimateBudgetInput,
  type EstimateBudgetOutput,
  type GenerateItineraryInput,
  type GenerateItineraryOutput,
  type GeneratePackingListInput,
  type GeneratePackingListOutput,
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

export async function getItinerary(
  data: GenerateItineraryInput
): Promise<{ success: true; data: GenerateItineraryOutput } | { success: false; error: string }> {
    try {
        const result = await generateItinerary(data);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error generating itinerary:', error);
        return { success: false, error: 'Failed to generate itinerary. Please try again.' };
    }
}

export async function getPackingList(
  data: GeneratePackingListInput
): Promise<{ success: true; data: GeneratePackingListOutput } | { success: false; error: string }> {
    try {
        const result = await generatePackingList(data);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error generating packing list:', error);
        return { success: false, error: 'Failed to generate packing list. Please try again.' };
    }
}
