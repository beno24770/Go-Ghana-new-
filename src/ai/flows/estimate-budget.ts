
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
Regions: {{#each region}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
Travel Style: {{travelStyle}}
Number of Travelers: {{numTravelers}}

Consider the following cost ranges based on the travel style:

Budget:
  - Accommodation: $20-60 per night
  - Food: $5-15 per day
  - Transportation: $5-20 per day
  - Activities: $0-20 per day

Mid-range:
  - Accommodation: $70-150 per night
  - Food: $20-60 per day
  - Transportation: $25-50 per day
  - Activities: $15-40 per day

Luxury:
  - Accommodation: $200-1000 per night
  - Food: $70-300 per day
  - Transportation: $80-150 per day
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
