
'use server';

/**
 * @fileOverview This file contains the Genkit flow for planning a trip to Ghana based on a user's budget.
 *
 * - planTrip - A function that takes a budget and other preferences and returns a travel plan.
 */

import {ai} from '@/ai/genkit';
import { PlanTripInput, PlanTripInputSchema, PlanTripOutput, PlanTripOutputSchema } from '@/ai/schemas';
import { getAccommodations } from '../tools/get-accommodations';
import { getRestaurants } from '../tools/get-restaurants';

export async function planTrip(input: PlanTripInput): Promise<PlanTripOutput> {
  return planTripFlow(input);
}

const planTripPrompt = ai.definePrompt({
  name: 'planTripPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: PlanTripInputSchema},
  output: {schema: PlanTripOutputSchema},
  tools: [getAccommodations, getRestaurants],
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
3.  **Provide Detailed Descriptions**: For each category (accommodation, food, transportation, activities), provide a helpful description of what the user can expect.
4.  **Suggest Specific Accommodations**:
    *   For the accommodation description, you **MUST** use the 'getAccommodations' tool to find specific places that match the user's travel style and region(s).
    *   You **MUST** suggest at least 2-3 relevant places from the tool's output. **DO NOT** suggest places that are not in the tool's output.
    *   Your description should start with a general overview, followed by a bulleted list of specific, named recommendations.
    *   Each recommendation **MUST** be formatted as a clickable Markdown link using its 'name' and 'link' properties.
    *   Example: "For a {{travelStyle}} trip, you'll find great options. From our vetted list, I'd suggest:
        *   [Labadi Beach Hotel](https://www.labadibeachhotel.com)
        *   [Somewhere Nice Guesthouse](https://www.somewherenice.com.gh)"
5.  **Suggest Specific Restaurants**:
    *   For the food description, you **MUST** use the 'getRestaurants' tool, passing the user's travelStyle to the 'style' parameter, to find a few specific places that match the user's travel region(s).
    *   You **MUST** suggest at least 2 relevant places from the tool's output. **DO NOT** suggest places that are not in the tool's output.
    *   Your description should start with a general overview, followed by a bulleted list of specific, named recommendations.
    *   Example: "You'll find great local food across the region. I'd recommend trying:
        *   **Oasis Beach Resort** for its fresh seafood.
        *   **Afrikan Pot Restaurant** for classic Ghanaian dishes."
6.  **Suggest Activities**: For activities, suggest a brief itinerary covering the selected regions, tailored to the user's interests.
7.  **Ensure Total Matches**: The sum of the costs for each category must equal the total budget provided by the user. If the budget is too low for the selected travel style, you must still adhere to the budget, but you can mention in the descriptions that the experience may be more constrained (e.g., "On a tight budget for luxury, so focus on one or two key high-end experiences.").
8.  **Confirm Travel Style**: The 'suggestedTravelStyle' in the output must match the user's selected 'travelStyle'.


Cost Guidelines (per person per day in USD) - Use these to inform your allocation:
- Budget: $60 - $140
- Mid-range: $150 - $320
- Luxury: $400 - $1650+

Transportation Facts (use this to inform your suggestions):
-   **Ride Sharing:** Uber and Bolt are common in major cities like Accra and Kumasi. Always select the "pay by cash" option. Short-distance fares within a city are usually $0.40 - $0.70.
-   **Trotros (Minibuses):** The most common way to travel between cities. The Ford-type trotros are more comfortable and usually have A/C. An A/C trotro from Accra to Cape Coast costs about $8 one-way.
-   **Inter-City Buses:** For longer distances (like Accra to Tamale), STC and VIP are reliable bus companies. A trip from Accra to Kumasi costs about $6-$8.
-   **Private Driver / Car Hire:** For a mid-range or luxury experience, hiring a private driver for the day can cost between $65 - $150, typically excluding fuel. **You should strongly recommend this as a comfortable and flexible option in the transportation description for 'Mid-range' and 'Luxury' travel styles.**
-   **General Tip:** Always carry small change (GHS 1, 2, 5, 10 notes) for paying trotro fares as drivers often don't have change for larger bills.

Example Descriptions:
- **Food**: Describe dining options (e.g., "Local street food stalls and small local eateries (chop bars)", "A mix of local restaurants and some Western-style cafes", "Fine dining restaurants and hotel restaurants").
- **Transportation**: Mention modes of transport (e.g., "Shared trotros and public buses for inter-city travel", "Ride-sharing apps (Uber/Bolt) and occasional private taxis", "A private driver or high-end car rental is highly recommended for flexibility and comfort"). For budget plans, mention that $5-$15/day is a good estimate for moving between major cities.
- **Activities**: Suggest a plausible itinerary for the. duration, keeping in mind that tour site fees are at least $10 per person. Tailor this to the user's interests. For example if the user is interested in 'History', suggest: "Day 1-2: Explore Accra's historical sites like Independence Square and Jamestown Lighthouse. Day 3: Visit the Cape Coast Castle (Entrance fee ~$4.20) to learn about the slave trade..."

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
