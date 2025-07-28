'use server';

/**
 * @fileOverview This file contains the Genkit flow for estimating a travel budget to Ghana based on user preferences.
 *
 * - estimateBudget - A function that takes travel preferences as input and returns an estimated budget.
 */

import {ai} from '@/ai/genkit';
import { EstimateBudgetInput, EstimateBudgetInputSchema, EstimateBudgetOutput, EstimateBudgetOutputSchema } from '@/ai/schemas';


export async function estimateBudget(input: EstimateBudgetInput): Promise<EstimateBudgetOutput> {
  return estimateBudgetFlow(input);
}

const estimateBudgetPrompt = ai.definePrompt({
  name: 'estimateBudgetPrompt',
  input: {schema: EstimateBudgetInputSchema},
  output: {schema: EstimateBudgetOutputSchema},
  prompt: `You are a travel expert specializing in trips to Ghana. Based on the user's preferences, provide an estimated budget for their trip, broken down by accommodation, food, transportation, and activities. Provide only numbers in USD, do not add any extra text.

Duration: {{duration}} days
Region: {{region}}
Travel Style: {{travelStyle}}
Number of Travelers: {{numTravelers}}

Consider the following cost ranges based on the travel style:

Budget:
  - Accommodation: $10-30 per night
  - Food: $5-15 per day
  - Transportation: $3-10 per day
  - Activities: $0-10 per day

Mid-range:
  - Accommodation: $40-100 per night
  - Food: $20-40 per day
  - Transportation: $10-20 per day
  - Activities: $15-30 per day

Luxury:
  - Accommodation: $150-500 per night
  - Food: $50-150 per day
  - Transportation: $30-100 per day
  - Activities: $50-200 per day`,
});

const estimateBudgetFlow = ai.defineFlow(
  {
    name: 'estimateBudgetFlow',
    inputSchema: EstimateBudgetInputSchema,
    outputSchema: EstimateBudgetOutputSchema,
  },
  async input => {
    const {output} = await estimateBudgetPrompt(input);
    return output!;
  }
);
