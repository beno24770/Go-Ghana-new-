
'use server';

/**
 * @fileOverview This file contains the Genkit flow for generating a detailed trip itinerary.
 *
 * - generateItinerary - A function that takes trip details and returns a day-by-day itinerary.
 */

import { ai } from '@/ai/genkit';
import { GenerateItineraryInput, GenerateItineraryInputSchema, GenerateItineraryOutput, GenerateItineraryOutputSchema } from '@/ai/schemas';

export async function generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
    return generateItineraryFlow(input);
}

const generateItineraryPrompt = ai.definePrompt({
    name: 'generateItineraryPrompt',
    input: { schema: GenerateItineraryInputSchema },
    output: { schema: GenerateItineraryOutputSchema },
    prompt: `You are a Ghana travel expert. Create a detailed, day-by-day itinerary based on the user's preferences. Format your response in Markdown.

User Preferences:
- Duration: {{duration}} days
- Regions: {{#each region}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- Travel Style: {{travelStyle}}
- Activities Budget: \${{activitiesBudget}}

Your Task:
1.  **Create a Day-by-Day Plan**: For each day of the trip, provide a 'title' and 'details'.
2.  **Be Specific and Practical**: Suggest specific attractions, restaurants, and experiences from the knowledge base below. Consider the travel style and budget. For example, a 'Budget' traveler might enjoy a local market and street food, while a 'Luxury' traveler might prefer a private tour and fine dining.
3.  **Logical Flow**: Ensure the itinerary is geographically and logistically sound, minimizing unnecessary travel time between the selected regions.
4.  **Engaging Titles**: Make the title for each day interesting and descriptive (e.g., "Accra's Historic Heartbeat" or "Coastal Escape to Cape Coast").
5.  **Format with Markdown**: Use Markdown for lists, bold text, and paragraphs in the 'details' field to ensure it's well-structured and readable.

**Knowledge Base of Ghanaian Destinations:**

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
