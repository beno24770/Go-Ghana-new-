
'use server';

/**
 * @fileOverview This file contains the Genkit flow for generating a detailed trip itinerary.
 *
 * - generateItinerary - A function that takes trip details and returns a day-by-day itinerary.
 */

import { ai } from '@/ai/genkit';
import { GenerateItineraryInput, GenerateItineraryInputSchema, GenerateItineraryOutput, GenerateItineraryOutputSchema } from '@/ai/schemas';
import { getLocalPulse } from '@/ai/tools/get-local-pulse';

export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
    return generateItineraryFlow(input);
}

const generateItineraryPrompt = ai.definePrompt({
    name: 'generateItineraryPrompt',
    input: { schema: GenerateItineraryInputSchema },
    output: { schema: GenerateItineraryOutputSchema },
    tools: [getLocalPulse],
    prompt: `You are a Ghana travel expert and a content curator for the website letvisitghana.com. Create a detailed, day-by-day itinerary based on the user's preferences.

User Preferences:
- Duration: {{duration}} days
- Regions: {{#each region}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- Travel Style: {{travelStyle}}
- Activities Budget: \${{activitiesBudget}}

Your Task:
1.  **Check for Local Events**: Use the 'getLocalPulse' tool to check for any festivals or events happening in the user's selected regions during their travel dates.
2.  **Incorporate Local Events**: If there are relevant events from the 'Local Pulse', you MUST integrate them into the itinerary. Mention the event and include the 'insiderTip' from the tool's output. This makes the itinerary timely and unique.
3.  **Create a Day-by-Day Plan**: For each day of the trip, provide a 'title' and 'details'.
4.  **Be Specific and Practical**: Suggest specific attractions, restaurants, and experiences. Consider the travel style and budget.
5.  **Embed "Read More" Links**: For major attractions, you MUST embed relevant Markdown links to articles on letvisitghana.com. This is crucial. For example, if you mention Kakum National Park, include a link like this: \`[Read more about Kakum National Park](https://www.letvisitghana.com/tourist-sites/kakum-national-park/)\`. If you mention Mole National Park, link to \`[Read more about Mole National Park](https://www.letvisitghana.com/tourist-sites/mole-national-park/)\`. Use your knowledge of the site to find the most relevant link.
6.  **Logical Flow**: Ensure the itinerary is geographically and logistically sound.
7.  **Engaging Titles**: Make the title for each day interesting and descriptive.
8.  **Format with Markdown**: Use Markdown for lists, bold text, and links in the 'details' field.

**Knowledge Base of Ghanaian Destinations (use for suggestions):**

**Greater Accra Region:**
*   **Key Attractions:** Kwame Nkrumah Memorial Park, Independence Square, W.E.B. Du Bois Centre, Jamestown Lighthouse, Arts Centre, Labadi Beach, Osu Castle, National Museum, Shai Hills Resource Reserve, Legon Botanical Gardens.
*   **Themes:** History, Culture, Pan-Africanism, Shopping, Beach, Nightlife, Nature, Wildlife.

**Central Region:**
*   **Key Attractions:** Kakum National Park (Canopy Walk), Cape Coast Castle, Elmina Castle, Assin Manso Slave River Site.
*   **Themes:** Nature, Adventure, History, Slave Trade.

**Ashanti Region:**
*   **Key Attractions:** Manhyia Palace Museum, Kejetia Market, Lake Bosomtwe, and cultural villages like Adanwomase (Kente) and Ntonso (Adinkra).
*   **Themes:** History, Culture, Royalty, Shopping, Nature.

**Volta Region:**
*   **Key Attractions:** Wli Waterfalls, Tafi Atome Monkey Sanctuary, Mountain Afadja (Afadjato), Keta Lagoon.
*   **Themes:** Nature, Hiking, Waterfalls, Wildlife, Scenery.

**Eastern Region:**
*   **Key Attractions:** Boti Falls, Aburi Botanical Gardens, Umbrella Rock, Cedi Bead Factory.
*   **Themes:** Nature, Waterfalls, Gardens, Crafts.

**Northern Region:**
*   **Key Attractions:** Mole National Park (Safari), Larabanga Mosque, Mognori Eco-village.
*   **Themes:** Wildlife, Safari, History, Religion, Ecotourism.

Generate a response that adheres to the GenerateItineraryOutputSchema.`,
});


const generateItineraryFlow = ai.defineFlow(
    {
        name: 'generateItineraryFlow',
        inputSchema: GenerateItineraryInputSchema,
        outputSchema: GenerateItineraryOutputSchema,
    },
    async (input) => {
        const { output } = await generateItineraryPrompt(input);
        return output!;
    }
);

    