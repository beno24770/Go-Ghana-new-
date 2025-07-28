
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
- Regions: {{#each region}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- Total Budget: \${{budget}}
- Number of Travelers: {{numTravelers}}

Your Task:
1.  **Determine Travel Style**: Based on the budget per person per day, determine if the travel style is 'Budget', 'Mid-range', or 'Luxury'.
2.  **Allocate Budget**: Distribute the total budget among accommodation, food, transportation, and activities. The allocation should be realistic for the determined travel style in the specified region.
3.  **Provide Descriptions**: For each category (accommodation, food, transportation, activities), provide a description of what the user can expect. For activities, suggest a brief itinerary covering the selected regions.
4.  **Ensure Total Matches**: The sum of the costs for each category must equal the total budget provided by the user.

Cost Guidelines (per person per day):
- Budget: $60 - $140
- Mid-range: $150 - $320
- Luxury: $400 - $1650+

Transportation Facts (use this to inform your suggestions):
- A budget of ~$25 per day for transport is realistic for inter-city travel (e.g., between Accra, Cape Coast, and Kumasi).
- A round trip from Accra to Cape Coast or Accra to Kumasi can be done for about $25.
- A budget of ~$45 can cover round trips for both Accra-Cape Coast and Accra-Kumasi.

Example Descriptions:
- **Accommodation**: Suggest types of lodging (e.g., "Hostels and budget guesthouses", "Comfortable mid-range hotels and Airbnbs", "Luxury hotels and resorts with premium amenities").
- **Food**: Describe dining options (e.g., "Local street food stalls and small local eateries (chop bars)", "A mix of local restaurants and some Western-style cafes", "Fine dining restaurants and hotel restaurants").
- **Transportation**: Mention modes of transport (e.g., "Shared trotros and public buses for inter-city travel", "Ride-sharing apps (Uber/Bolt) and occasional private taxis", "Private driver or high-end car rentals"). For budget plans, mention that $25/day is a good estimate for moving between major cities.
- **Activities**: Suggest a plausible itinerary for the duration, keeping in mind that tour site fees are at least $10 per person. For example: "Day 1-2: Explore Accra's markets and Independence Square. Day 3: Visit Kakum National Park (Entrance fee ~$10-15)..."

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
