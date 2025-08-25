
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
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: EstimateBudgetInputSchema},
  output: {schema: EstimateBudgetOutputSchema},
  prompt: `You are a travel expert specializing in trips to Ghana. Your task is to provide an estimated budget for a trip based on user preferences.

**CRITICAL INSTRUCTION: All initial calculations MUST be done on a per-person basis.**

User Preferences:
- Duration: {{duration}} days
- Regions: {{#each region}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- Travel Style: {{travelStyle}}
- Number of Travelers: {{numTravelers}}
{{#if interests}}
- Interests: {{#each interests}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{#if dailyBudget}}
- Specified Daily Budget per Person: \${{dailyBudget}}
{{/if}}

Your Task:
1.  **Calculate Per-Person Costs**:
    *   **If a 'dailyBudget' is specified**: This is your most important instruction. You **MUST** use this value as the total PER-PERSON, PER-DAY cost. Allocate this amount across the four categories (accommodation, food, transportation, activities) logically for the 'travelStyle' and 'interests'. The sum of your per-day allocations MUST equal the user's 'dailyBudget'.
    *   **If no 'dailyBudget' is specified**: Use the 'travelStyle' and the reference cost ranges below to determine an average PER-PERSON, PER-DAY cost.

2.  **Calculate Total Per-Person Costs**: Multiply the per-person, per-day cost for each category by the 'duration' of the trip.
3.  **Calculate Total for All Travelers**:
    *   For each category, multiply the total per-person cost by the 'numTravelers' to get the final 'total' cost for that category.
    *   For each category, the 'perDay' cost in the output should remain the per-person, per-day cost.
4.  **Calculate Grand Total**: Sum the final 'total' costs of all categories to get the grand total for the entire trip for all travelers.
5.  **Format Output**: Provide the breakdown in the specified JSON schema format.

Reference Cost Ranges (PER-PERSON, PER-DAY in USD) - Use ONLY if no 'dailyBudget' is provided:
- Budget: Accommodation: $20-60, Food: $10-20, Transportation: $5-15, Activities: $10-25
- Mid-range: Accommodation: $150-500, Food: $20-60, Transportation: $20-60, Activities: $25-50
- Luxury: Accommodation: $200-1000, Food: $70-300, Transportation: $80-150, Activities: $50-200

Generate a valid JSON object only.`,
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
