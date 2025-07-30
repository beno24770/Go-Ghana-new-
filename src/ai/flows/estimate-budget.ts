
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
  prompt: `You are a travel expert specializing in trips to Ghana. Based on the user's preferences, provide an estimated budget for their trip.

User Preferences:
Duration: {{duration}} days
Regions: {{#each region}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
Travel Style: {{travelStyle}}
Number of Travelers: {{numTravelers}}

Your Task:
1.  **Calculate Per-Day Costs**: For each category (accommodation, food, transportation, activities), calculate the average per-day cost based on the travel style.
2.  **Calculate Total Costs**: Multiply the per-day cost by the duration of the trip to get the total for each category.
3.  **Calculate Grand Total**: Sum the total costs of all categories to get the grand total for the trip.
4.  **Format the Output**: Provide the breakdown in the specified JSON schema format, including both 'perDay' and 'total' for each category.

Cost Ranges (per person, per day in USD):
Budget:
  - Accommodation: $20-60
  - Food: $10-20
  - Transportation: $5-15 (primarily using public transport like trotros)
  - Activities: $10-25

Mid-range:
  - Accommodation: $150-500
  - Food: $20-60
  - Transportation: $20-60 (mix of trotros and ride-sharing apps like Uber/Bolt)
  - Activities: $25-50

Luxury:
  - Accommodation: $200-1000
  - Food: $70-300
  - Transportation: $80-150 (primarily using a private driver or high-end rentals)
  - Activities: $50-200

The final costs should be for the total number of travelers. Multiply the per-person costs by the 'numTravelers' value.
Do not add any extra text or explanations. Only provide the JSON output.`,
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
