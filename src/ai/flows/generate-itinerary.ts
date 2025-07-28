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
*   **Kwame Nkrumah Memorial Park & Mausoleum:** Final resting place of the first President of Ghana. (Tags: History, Culture)
*   **Independence Square (Black Star Square):** Main public square, site of independence celebrations. (Tags: History, Monument)
*   **W.E.B. Du Bois Memorial Centre:** Centre for Pan African culture. (Tags: History, Culture, Pan-Africanism)
*   **Jamestown Lighthouse:** Historic lighthouse with panoramic views of the city and sea. (Tags: History, Views)
*   **The Arts Centre:** Large market for crafts, art, and souvenirs. (Tags: Shopping, Art, Culture)
*   **Labadi Beach:** Popular beach for relaxation and entertainment. (Tags: Beach, Leisure, Nightlife)
*   **Osu Castle (Fort Christiansborg):** Former seat of government, rich history. (Tags: History, Castle, Politics)
*   **National Museum of Ghana:** Museum of Ghanaian history and culture. (Tags: Museum, History, Culture)
*   **Shai Hills Resource Reserve:** Nature reserve with hills, animals like baboons and zebras. (Tags: Nature, Wildlife, Hiking)
*   **Legon Botanical Gardens:** Gardens with canopy walk and recreational activities. (Tags: Nature, Recreation, Canopy Walk)

**Central Region:**
*   **Kakum National Park:** Famous for its canopy walkway through the rainforest. (Tags: Nature, Adventure, Canopy Walk)
*   **Cape Coast Castle:** One of the largest former slave-holding castles. (Tags: History, Castle, Slave Trade)
*   **Elmina Castle:** The first European structure built in Sub-Saharan Africa. (Tags: History, Castle, Slave Trade)
*   **Assin Manso Slave River Site:** Site of the "last bath" for enslaved Africans. (Tags: History, Slave Trade, Culture)
*   **Fort St. Jago:** Fort overlooking Elmina Castle, offering great views. (Tags: History, Fort, Views)

**Ashanti Region:**
*   **Manhyia Palace Museum:** Former residence of the Ashanti kings. (Tags: History, Culture, Royalty)
*   **Prempeh II Jubilee Museum:** Museum showcasing Ashanti history. (Tags: Museum, History, Culture)
*   **Okomfo Anokye Sword Site:** The "unmovable" sword of the Ashanti priest. (Tags: History, Culture, Legend)
*   **Adanwomase Kente Weaving:** Community known for Kente cloth weaving. (Tags: Culture, Crafts, Shopping)
*   **Ntonso Adinkra Village:** Village where you can learn to make Adinkra symbols. (Tags: Culture, Crafts, Art)
*   **Kejetia Market:** One of the largest open-air markets in West Africa. (Tags: Shopping, Culture, Market)
*   **Lake Bosomtwe:** Ghana's only natural lake, formed by a meteor. (Tags: Nature, Scenery, Leisure)

**Volta Region:**
*   **Wli Waterfalls:** The highest waterfall in Ghana. (Tags: Nature, Hiking, Waterfalls)
*   **Tafi Atome Monkey Sanctuary:** Sacred monkeys living in the wild. (Tags: Nature, Wildlife, Monkeys)
*   **Mountain Afadja (Afadjato):** One of the highest peaks in Ghana. (Tags: Nature, Hiking, Adventure)
*   **Keta Lagoon:** Large lagoon important for bird watching. (Tags: Nature, Birds, Scenery)
*   **Fort Prinzenstein:** Danish-built fort, partially in ruins. (Tags: History, Fort, Slave Trade)

**Eastern Region:**
*   **Boti Falls:** Twin waterfalls, considered male and female. (Tags: Nature, Waterfalls, Scenery)
*   **Aburi Botanical Gardens:** Beautiful colonial-era botanical gardens. (Tags: Nature, Gardens, Leisure)
*   **Akaa Falls:** Waterfall near Boti, beautiful natural setting. (Tags: Nature, Waterfalls)
*   **Umbrella Rock:** A unique rock formation that looks like an umbrella. (Tags: Nature, Hiking, Scenery)
*   **Bead Factory (Cedi Beads):** Place to see how traditional Ghanaian beads are made. (Tags: Crafts, Culture, Shopping)

**Northern Region:**
*   **Mole National Park:** Ghana's largest wildlife refuge (elephants, antelopes). (Tags: Wildlife, Safari, Nature)
*   **Larabanga Mosque:** Historic Sudanese-style mud-and-stick mosque. (Tags: History, Religion, Architecture)
*   **Mognori Eco-village:** Village offering canoe safaris and cultural experiences near Mole. (Tags: Culture, Ecotourism, Safari)
*   **Daboya:** Known for its smock-making industry. (Tags: Crafts, Culture, Shopping)
*   **Salaga Slave Market:** A historical slave market site. (Tags: History, Slave Trade)

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
