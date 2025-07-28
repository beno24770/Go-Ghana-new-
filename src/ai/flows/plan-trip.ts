'use server';

/**
 * @fileOverview This file contains the Genkit flow for planning a trip to Ghana based on a user's budget.
 *
 * - planTrip - A function that takes a budget and other preferences and returns a travel plan.
 */

import {ai} from '@/ai/genkit';
import { PlanTripInput, PlanTripInputSchema, PlanTripOutput, PlanTripOutputSchema } from '@/ai/schemas';

export async function planTrip(input: PlanTripInput): Promise<PlanTripOutput> {
  return planTripFlow(input);
}

const planTripPrompt = ai.definePrompt({
  name: 'planTripPrompt',
  input: {schema: PlanTripInputSchema},
  output: {schema: PlanTripOutputSchema},
  prompt: `You are a travel expert specializing in trips to Ghana. A user wants to plan a trip and has provided their budget and preferences. Create a detailed travel plan for them.

User Preferences:
- Duration: {{duration}} days
- Region: {{region}}
- Total Budget: \${{budget}}
- Number of Travelers: {{numTravelers}}

Your Task:
1.  **Determine Travel Style**: Based on the budget per person per day, determine if the travel style is 'Budget', 'Mid-range', or 'Luxury'.
2.  **Allocate Budget**: Distribute the total budget among accommodation, food, transportation, and activities. The allocation should be realistic for the determined travel style in the specified region.
3.  **Provide Descriptions**: For each category (accommodation, food, transportation, activities), provide a description of what the user can expect. For activities, suggest a brief itinerary.
4.  **Ensure Total Matches**: The sum of the costs for each category must equal the total budget provided by the user.

Cost Guidelines (per person per day):
- Budget: $18 - $55
- Mid-range: $75 - $190
- Luxury: $230 - $850+

Example Descriptions:
- **Accommodation**: Suggest types of lodging (e.g., "Hostels and budget guesthouses", "Comfortable mid-range hotels and Airbnbs", "Luxury hotels and resorts with premium amenities").
- **Food**: Describe dining options (e.g., "Local street food stalls and small local eateries (chop bars)", "A mix of local restaurants and some Western-style cafes", "Fine dining restaurants and hotel restaurants").
- **Transportation**: Mention modes of transport (e.g., "Shared trotros and public buses", "Ride-sharing apps (Uber/Bolt) and occasional private taxis", "Private driver or high-end car rentals").
- **Activities**: Suggest a plausible itinerary for the duration. For example: "Day 1-2: Explore Accra's markets and Independence Square. Day 3: Visit Kakum National Park..."

Generate a response that adheres to the PlanTripOutputSchema.`,
});

const planTripFlow = ai.defineFlow(
  {
    name: 'planTripFlow',
    inputSchema: PlanTripInputSchema,
    outputSchema: PlanTripOutputSchema,
  },
  async input => {
    const {output} = await planTripPrompt(input);
    return output!;
  }
);
