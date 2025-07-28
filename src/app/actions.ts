'use server';

import { estimateBudget } from '@/ai/flows/estimate-budget';
import { generateItinerary } from '@/ai/flows/generate-itinerary';
import { generatePackingList } from '@/ai/flows/generate-packing-list';
import { planTrip } from '@/ai/flows/plan-trip';
import { generateLanguageGuide } from '@/ai/flows/generate-language-guide';
import { generateAudio } from '@/ai/flows/generate-audio';
import { regenerateItineraryFromNotes } from '@/ai/flows/regenerate-itinerary';
import {
  type EstimateBudgetInput,
  type EstimateBudgetOutput,
  type GenerateItineraryInput,
  type GenerateItineraryOutput,
  type GeneratePackingListInput,
  type GeneratePackingListOutput,
  type PlanTripInput,
  type PlanTripOutput,
  type GenerateLanguageGuideInput,
  type GenerateLanguageGuideOutput,
  type GenerateAudioInput,
  type GenerateAudioOutput,
  type RegenerateItineraryInput,
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

export async function regenerateItinerary(
    data: RegenerateItineraryInput
): Promise<{ success: true; data: GenerateItineraryOutput } | { success: false; error: string }> {
    try {
        const result = await regenerateItineraryFromNotes(data);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error regenerating itinerary:', error);
        return { success: false, error: 'Failed to regenerate itinerary. Please try again.' };
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

export async function getLanguageGuide(
  data: GenerateLanguageGuideInput
): Promise<{ success: true; data: GenerateLanguageGuideOutput } | { success: false; error: string }> {
    try {
        const result = await generateLanguageGuide(data);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error generating language guide:', error);
        return { success: false, error: 'Failed to generate language guide. Please try again.' };
    }
}

export async function getAudio(
    data: GenerateAudioInput
): Promise<{ success: true; data: GenerateAudioOutput } | { success: false; error: string }> {
    try {
        const result = await generateAudio(data);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error generating audio:', error);
        return { success: false, error: 'Failed to generate audio. Please try again.' };
    }
}
