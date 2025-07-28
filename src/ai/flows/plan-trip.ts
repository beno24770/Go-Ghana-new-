
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
- Travel Style: {{travelStyle}}
{{#if interests}}
- Interests: {{#each interests}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

Your Task:
1.  **Use the Provided Travel Style**: The user has specified their travel style. You must adhere to this choice.
2.  **Allocate Budget**: Distribute the total budget among accommodation, food, transportation, and activities, ensuring the allocation is realistic for the chosen travel style and fits within the total budget.
3.  **Provide Descriptions**: For each category (accommodation, food, transportation, activities), provide a description of what the user can expect. 
4.  **Suggest Specific Accommodations**: For the accommodation description, use the **Knowledge Base of Ghanaian Accommodations** below to suggest 2-3 specific places that match the user's travel style and region.
5.  **Suggest Activities**: For activities, suggest a brief itinerary covering the selected regions, tailored to the user's interests.
6.  **Ensure Total Matches**: The sum of the costs for each category must equal the total budget provided by the user. If the budget is too low for the selected travel style, you must still adhere to the budget, but you can mention in the descriptions that the experience may be more constrained (e.g., "On a tight budget for luxury, so focus on one or two key high-end experiences.").
7.  **Confirm Travel Style**: The 'suggestedTravelStyle' in the output must match the user's selected 'travelStyle'.


**Knowledge Base of Ghanaian Accommodations:**

**Greater Accra Region:**
*   **Luxury:** Kempinski Hotel Gold Coast City, Labadi Beach Hotel, Mövenpick Ambassador Hotel, Accra Marriott Hotel.
*   **Mid-range:** The Gallery, Afia Beach Hotel, Villa Monticello Boutique Hotel, Golden Tulip Accra.
*   **Budget:** Somewhere Nice, The Accra Backpackers Hostel, Agoo-Hostel.

**Central Region:**
*   **Luxury:** Ridge Royal Hotel, Coconut Grove Bridge House.
*   **Mid-range:** Orange Beach Resort, Oasis Beach Resort, Hans Cottage Botel.
*   **Budget:** Mighty Victory Hotel, One Africa Resort.

**Ashanti Region:**
*   **Luxury:** Golden Tulip Kumasi City, The Apartel.
*   **Mid-range:** Golden Bean Hotel, Noble House Hotel.
*   **Budget:** Tumi Hostel, Four Villages Inn.

**Volta Region:**
*   **Luxury:** The Royal Senchi Hotel & Resort.
*   **Mid-range:** Volta Serene Hotel, Chances Hotel.
*   **Budget:** Biakpa Mountain Paradise, Wli Water Heights Hotel.

**Eastern Region:**
*   **Mid-range:** The Royal Senchi Hotel & Resort (can also be luxury), Akosombo Continental Hotel, Hillburi.
*   **Budget:** Linda d'Or, Koforidua Guest Hotel.

**Northern Region:**
*   **Luxury:** Zaina Lodge.
*   **Mid-range:** Mole Motel, Fuugu-Lodge.
*   **Budget:** Baobab House, Aayalolo Guesthouse.


Cost Guidelines (per person per day) - Use these to inform your allocation:
- Budget: $60 - $140
- Mid-range: $150 - $320
- Luxury: $400 - $1650+

Transportation Facts (use this to inform your suggestions):
- A budget of ~$25 per day for transport is realistic for inter-city travel (e.g., between Accra, Cape Coast, and Kumasi).
- A round trip from Accra to Cape Coast or Accra to Kumasi can be done for about $25.
- A budget of ~$45 can cover round trips for both Accra-Cape Coast and Accra-Kumasi.

Example Descriptions:
- **Accommodation**: "For a {{travelStyle}} trip, you could consider places like [Hotel A] or [Guesthouse B]. Expect [types of lodging like 'Comfortable mid-range hotels and Airbnbs']."
- **Food**: Describe dining options (e.g., "Local street food stalls and small local eateries (chop bars)", "A mix of local restaurants and some Western-style cafes", "Fine dining restaurants and hotel restaurants").
- **Transportation**: Mention modes of transport (e.g., "Shared trotros and public buses for inter-city travel", "Ride-sharing apps (Uber/Bolt) and occasional private taxis", "Private driver or high-end car rentals"). For budget plans, mention that $25/day is a good estimate for moving between major cities.
- **Activities**: Suggest a plausible itinerary for the duration, keeping in mind that tour site fees are at least $10 per person. Tailor this to the user's interests. For example if the user is interested in 'History', suggest: "Day 1-2: Explore Accra's historical sites like Independence Square and Jamestown Lighthouse. Day 3: Visit the Cape Coast Castle (Entrance fee ~$10-15) to learn about the slave trade..."

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
