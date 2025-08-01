
'use server';

/**
 * @fileOverview This file contains the Genkit flow for generating a detailed trip itinerary.
 *
 * - generateItinerary - A function that takes trip details and returns a day-by-day itinerary.
 */

import { ai } from '@/ai/genkit';
import { GenerateItineraryInput, GenerateItineraryInputSchema, GenerateItineraryOutput, GenerateItineraryOutputSchema } from '@/ai/schemas';
import { getLocalPulse } from '@/ai/tools/get-local-pulse';
import { getEntertainmentEvents } from '@/ai/tools/get-entertainment-events';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import { z } from 'zod';
import { getRestaurants } from '../tools/get-restaurants';
import { getArticleLink } from '../tools/get-article-link';
import { getSampleItineraries } from '../tools/get-sample-itineraries';

export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
    const endDate = addDays(new Date(input.startDate), input.duration -1);
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    const dayDates = Array.from({ length: input.duration }, (_, i) => {
        const date = addDays(new Date(input.startDate), i);
        return format(date, 'EEEE,dd-MMM-yyyy');
    });

    const fullInput = {...input, endDate: formattedEndDate, dayDates: dayDates.map(d => d.split(','))};

    return generateItineraryFlow(fullInput);
}

const generateItineraryPrompt = ai.definePrompt({
    name: 'generateItineraryPrompt',
    input: { schema: GenerateItineraryInputSchema.extend({endDate: z.string(), dayDates: z.array(z.array(z.string()))}) },
    output: { schema: GenerateItineraryOutputSchema },
    tools: [getLocalPulse, getEntertainmentEvents, getRestaurants, getArticleLink, getSampleItineraries],
    prompt: `You are a Ghana travel expert and a content curator for the website letvisitghana.com. Your primary goal is to create a detailed, high-quality, day-by-day itinerary based on the user's preferences.

User Preferences:
- Duration: {{duration}} days
- Regions: {{#if isNewToGhana}}User is new to Ghana, please suggest regions.{{else}}{{#each region}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
- Travel Style: {{travelStyle}}
- Activities Budget: \${{activitiesBudget}}
- Trip Dates: {{startDate}} to {{endDate}}
{{#if interests}}
- Interests: {{#each interests}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

Your Task:
1.  **Use Expert Blueprints**: Your MOST IMPORTANT task is to first use the 'getSampleItineraries' tool. This tool contains expert-crafted itineraries. Find a sample itinerary that best matches the user's 'interests' and 'duration'.
    *   **If you find a good match**: Use the matched sample itinerary as the primary blueprint for your response. Adapt it to fit the user's specific 'startDate' and other preferences. You MUST prioritize the logic, flow, and locations from the sample itinerary.
    *   **If you DO NOT find a good match**: Only then should you create a plan from scratch using your general knowledge.

2.  **Format Adherence**: You **MUST** structure each day's plan according to the 'DayItinerarySchema'.
    *   **dayOfWeek**: The full day name (e.g., "Monday").
    *   **date**: The date in 'DD-Mon-YYYY' format (e.g., "28-Jul-2025").
    *   **location**: The primary overnight city/town for that day (e.g., "Accra").
    *   **driveTime**: Optional. If there's significant travel, estimate it (e.g., "3.5 hours").
    *   **title**: A concise, descriptive title for the day's main activities.
    *   **details**: A Markdown bulleted list describing the plan.
    *   **budget**: A markdown string with estimated costs for the day.

3.  **Date and Day of Week**: Use the 'dayDates' array provided. Each element is a pair of [DayOfWeek, DD-Mon-YYYY].
    *   Example from array: \`[["Monday", "28-Jul-2025"], ["Tuesday", "29-Jul-2025"]]\`.
    *   For Day 1, use \`dayOfWeek: "Monday"\` and \`date: "28-Jul-2025"\`.

4.  **Tools Integration**: Enhance the plan (whether from a sample or from scratch) using your other tools.
    *   **Local Events**: Use 'getLocalPulse' to find festivals. If found, highlight it in the 'details' like: \`* **✨ Local Pulse: Chale Wote Street Art Festival** - [details and insider tip]\`.
    *   **Nightlife**: If 'Nightlife & Urban' is an interest, use 'getEntertainmentEvents'. Highlight it like: \`* **🎵 Nightlife: Live Highlife at +233 Grill & Bar** - [details and insider tip]\`.
    *   **Restaurants**: Use 'getRestaurants' for lunch/dinner suggestions. Mention them in the details: \`* For dinner, try **Oasis Beach Resort** for its fresh seafood.\`
    *   **Article Links**: For major attractions (e.g., Kakum National Park), use 'getArticleLink' and embed the URL as a Markdown link: \`[Read more about Kakum](https://...)\`.

5.  **Logistical Flow**: Ensure the itinerary is geographically and logistically sound. **IMPORTANT: Travel between Kumasi and Cape Coast is very difficult by public transport. Always route travel between these cities through Accra.**

6.  **Daily Budget**: For each day, create a 'budget' string with a bulleted list of estimated costs for that day's specific activities.
    *   **Transportation**: Provide a realistic dollar amount based on the travel style.
    *   **Entrance Fees**: Sum known fees. Assume a minimum of $10 per person for any major tourist site if the fee isn't listed.
    *   **Food**: Estimate food cost based on the travel style.
    *   Example for 'budget' field: \`- **Transportation**: $20\\n- **Entrance Fees**: $15\\n- **Food**: $30\`

Generate a response that adheres to the GenerateItineraryOutputSchema.`,
});


const generateItineraryFlow = ai.defineFlow(
    {
        name: 'generateItineraryFlow',
        inputSchema: GenerateItineraryInputSchema.extend({endDate: z.string(), dayDates: z.array(z.array(z.string()))}),
        outputSchema: GenerateItineraryOutputSchema,
    },
    async (input) => {
        const { output } = await generateItineraryPrompt(input);
        return output!;
    }
);
