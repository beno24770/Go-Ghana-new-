'use server';

import { estimateBudget } from '@/ai/flows/estimate-budget';
import { type EstimateBudgetInput, type EstimateBudgetOutput } from '@/ai/schemas';

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
