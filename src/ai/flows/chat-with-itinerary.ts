
'use server';

/**
 * @fileOverview This file contains the Genkit flow for chatting with and editing a trip itinerary.
 *
 * - chatWithItinerary - A function that takes the current itinerary and a user message, and returns a conversational response and an updated itinerary.
 */

import { ai } from '@/ai/genkit';
import { ChatWithItineraryInput, ChatWithItineraryInputSchema, ChatWithItineraryOutput, ChatWithItineraryOutputSchema, DayItinerarySchema } from '@/ai/schemas';
import { getLocalPulse } from '@/ai/tools/get-local-pulse';
import { getEntertainmentEvents } from '@/ai/tools/get-entertainment-events';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import { z } from 'zod';
import { getAccommodations } from '../tools/get-accommodations';
import { getRestaurants } from '../tools/get-restaurants';

export async function chatWithItinerary(input: ChatWithItineraryInput): Promise<ChatWithItineraryOutput> {
    const endDate = addDays(new Date(input.startDate), input.duration - 1);
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    
    const dayDates = Array.from({ length: input.duration }, (_, i) => {
        const date = addDays(new Date(input.startDate), i);
        return format(date, 'yyyy-MM-dd');
    });

    const fullInput = {...input, endDate: formattedEndDate, dayDates};

    return chatWithItineraryFlow(fullInput);
}

const summarizeItineraryPrompt = ai.definePrompt({
    name: 'summarizeItineraryPrompt',
    input: { schema: z.object({ currentItinerary: z.string() }) },
    output: { schema: z.object({ summary: z.string().describe('A concise, one-paragraph summary of the travel itinerary.') }) },
    prompt: `Concisely summarize the following travel itinerary in a single paragraph. Capture the main themes, locations, and duration.

Itinerary:
---
{{{currentItinerary}}}
---`,
});

const chatItineraryPrompt = ai.definePrompt({
    name: 'chatItineraryPrompt',
    input: { schema: ChatWithItineraryInputSchema.extend({
        endDate: z.string(), 
        dayDates: z.array(z.string()),
        itinerarySummary: z.string(),
    }) },
    output: { schema: ChatWithItineraryOutputSchema },
    tools: [getLocalPulse, getEntertainmentEvents, getAccommodations, getRestaurants],
    prompt: `You are a friendly and expert Ghanaian travel assistant for letvisitghana.com. A user is asking a question or requesting a change to their travel itinerary.

Your primary goal is to be fast and responsive.

**Itinerary Summary:** "{{itinerarySummary}}"

**User's Message:** "{{userMessage}}"

**Instructions:**

1.  **Analyze User Intent:** First, determine if the user is just asking a question OR if they are requesting a change to the itinerary.
    *   **If it's a question (e.g., "are there any museums?", "what's the weather like?", "suggest a hotel"):**
        *   Your priority is a fast, conversational answer.
        *   Use the Itinerary Summary for context. Use your tools and knowledge base to provide a direct answer.
        *   **CRITICAL: You MUST NOT return the 'itinerary' object for simple questions.** Your response object should ONLY contain the 'response' field.
        *   If you recommend a hotel, you **MUST** use the 'getAccommodations' tool and format it as a clickable Markdown link: "I'd recommend [Labadi Beach Hotel](https://www.labadibeachhotel.com)."
        *   If you recommend a restaurant, you **MUST** use the 'getRestaurants' tool and mention its name, like: "You should try **Oasis Beach Resort**."

    *   **If it's a direct request to CHANGE the itinerary (e.g., "add a museum on day 2", "remove the beach day", "can we go to Kumasi instead?"):**
        *   Only in this case should you perform the more complex task of regenerating the plan.
        *   Provide a conversational response confirming the change (e.g., "Sure, I've updated your plan to include a visit to the National Museum on Day 2.").
        *   Regenerate the *entire* itinerary object based on the **full original itinerary** provided below, incorporating the user's changes. Ensure it is logistically sound.
        *   Use your tools ('getLocalPulse', 'getEntertainmentEvents', etc.) to enhance the new plan.
        *   The final output **MUST** include both the 'response' text and the full, updated 'itinerary' object.

**Full Original Itinerary (ONLY for making changes):**
---
{{{currentItinerary}}}
---

**Key Information for you to use:**
- Trip Dates: {{startDate}} to {{endDate}}
- Trip Regions: {{#each region}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- Day Dates Array: {{#each dayDates}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

**Knowledge Base Snippets (for quick answers):**
- **Museums:** The National Museum in Accra is a great choice for history and culture.
- **Transport:** Uber/Bolt are common in cities. Trotros are used for city-to-city travel. STC/VIP buses for long distances.
- **Regions & Attractions:**
    - **Accra:** History, culture, nightlife (Jamestown, Nkrumah Memorial).
    - **Central:** Slave Castles (Cape Coast, Elmina), Nature (Kakum Canopy Walk).
    - **Ashanti:** Royalty, culture (Manhyia Palace, Kente villages).
    - **Volta:** Nature, waterfalls, hiking (Wli, Afadjato).
    - **Northern:** Wildlife safari (Mole National Park).

Generate a valid JSON object that adheres to the ChatWithItineraryOutputSchema.`,
});


const chatWithItineraryFlow = ai.defineFlow(
    {
        name: 'chatWithItineraryFlow',
        inputSchema: ChatWithItineraryInputSchema.extend({endDate: z.string(), dayDates: z.array(z.string())}),
        outputSchema: ChatWithItineraryOutputSchema,
    },
    async (input) => {
        // First, generate a summary of the itinerary for faster processing on simple questions.
        const { output: summaryOutput } = await summarizeItineraryPrompt({ currentItinerary: input.currentItinerary });
        if (!summaryOutput?.summary) {
            throw new Error("Failed to summarize the itinerary.");
        }

        const fullInput = { ...input, itinerarySummary: summaryOutput.summary };
        
        const { output } = await chatItineraryPrompt(fullInput);
        return output!;
    }
);
