
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
    tools: [getLocalPulse, getEntertainmentEvents, getRestaurants, getArticleLink],
    prompt: `You are a Ghana travel expert and a content curator for the website letvisitghana.com. Create a detailed, day-by-day itinerary based on the user's preferences, following the provided table-like format.

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
1.  **Format Adherence**: You **MUST** structure each day's plan according to the 'DayItinerarySchema'. This is not optional. The output should be a clean, table-style itinerary.
    *   **dayOfWeek**: The full day name (e.g., "Monday").
    *   **date**: The date in 'DD-Mon-YYYY' format (e.g., "28-Jul-2025").
    *   **location**: The primary overnight city/town for that day (e.g., "Accra").
    *   **driveTime**: Optional. If there's significant travel, estimate it (e.g., "3.5 hours").
    *   **title**: A concise, descriptive title for the day's main activities.
    *   **details**: A Markdown bulleted list describing the plan.
    *   **budget**: A markdown string with estimated costs for the day.

2.  **Date and Day of Week**: Use the 'dayDates' array provided. Each element is a pair of [DayOfWeek, DD-Mon-YYYY].
    *   Example from array: \`[["Monday", "28-Jul-2025"], ["Tuesday", "29-Jul-2025"]]\`.
    *   For Day 1, use \`dayOfWeek: "Monday"\` and \`date: "28-Jul-2025"\`.

3.  **Handle New Travelers**: If 'isNewToGhana' is true, you MUST devise a logical itinerary for a first-time visitor. For shorter trips (e.g., up to 10 days), focus on a classic route like Greater Accra -> Central Region -> Ashanti Region. For longer trips, you can add the Volta or Northern regions. You must state which regions you have chosen for them at the start of the itinerary details.

4.  **Tools Integration**:
    *   **Local Events**: Use 'getLocalPulse' to find festivals. If found, highlight it in the 'details' like: \`* **✨ Local Pulse: Chale Wote Street Art Festival** - [details and insider tip]\`.
    *   **Nightlife**: If 'Nightlife & Urban' is an interest, use 'getEntertainmentEvents'. Highlight it like: \`* **🎵 Nightlife: Live Highlife at +233 Grill & Bar** - [details and insider tip]\`.
    *   **Restaurants**: Use 'getRestaurants' for lunch/dinner suggestions. Mention them in the details: \`* For dinner, try **Oasis Beach Resort** for its fresh seafood.\`
    *   **Article Links**: For major attractions (e.g., Kakum National Park), use 'getArticleLink' and embed the URL as a Markdown link: \`[Read more about Kakum](https://...)\`.

5.  **Logistical Flow**: Ensure the itinerary is geographically and logistically sound. **IMPORTANT: Travel between Kumasi and Cape Coast is very difficult by public transport. Always route travel between these cities through Accra.**

6.  **Daily Budget**: For each day, create a 'budget' string with a bulleted list of estimated costs for that day's specific activities.
    *   **Transportation**: Provide a realistic dollar amount based on the travel style and 'Transportation Facts'.
    *   **Entrance Fees**: Sum known fees. Assume a minimum of $10 per person for any major tourist site if the fee isn't listed.
    *   **Food**: Estimate food cost based on the travel style.
    *   Example for 'budget' field: \`- **Transportation**: $20\\n- **Entrance Fees**: $15\\n- **Food**: $30\`

**Knowledge Base of Ghanaian Destinations (use for suggestions):**

**Greater Accra Region:**
*   **Key Attractions:** Kwame Nkrumah Memorial Park, Independence Square (Black Star Square), W.E.B. Du Bois Centre, Jamestown Lighthouse, Arts Centre, Labadi Beach, Osu Castle, National Museum, Shai Hills Resource Reserve, Legon Botanical Gardens.
*   **Themes:** History, Culture, Pan-Africanism, Shopping, Beach, Nightlife, Nature, Wildlife.

**Central Region:**
*   **Key Attractions:** Kakum National Park (Canopy Walk), Cape Coast Castle, Elmina Castle, Assin Manso Slave River Site.
*   **Themes:** Nature, Adventure, History, Slave Trade.
*   **Practical Tips:** Cape Coast & Elmina Castles entry fee is ~$4.20 (50 GHC). Kakum National Park entry is ~$8.30 (100 GHC).

**Ashanti Region:**
*   **Key Attractions:** Manhyia Palace Museum, Kejetia Market, Lake Bosomtwe, Adanwomase (Kente), Ntonso (Adinkra).
*   **Themes:** History, Culture, Royalty, Shopping, Nature.

**Volta Region:**
*   **Key Attractions:** Wli Waterfalls, Tafi Atome Monkey Sanctuary, Mountain Afadja (Afadjato), Keta Lagoon.
*   **Themes:** Nature, Hiking, Waterfalls, Wildlife, Scenery.

**Northern Region:**
*   **Key Attractions:** Mole National Park (Safari), Larabanga Mosque, Mognori Eco-village.
*   **Themes:** Wildlife, Safari, History, Religion, Ecotourism.

**Transportation Facts (use this to inform your suggestions):**
-   **Ride Sharing (Mid-range/Luxury):** Intra-city travel in Accra/Kumasi, budget **$20-60/day**.
-   **Trotros (Budget):** Intra-city travel, budget **$2-5/day**. Inter-city (e.g., Accra-Cape Coast) is ~$8.
-   **Inter-City Buses:** STC/VIP for long routes (Accra-Kumasi is ~$8).

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
