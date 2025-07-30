
'use server';

/**
 * @fileOverview This file contains the Genkit flow for chatting with and editing a trip itinerary.
 *
 * - chatWithItinerary - A function that takes the current itinerary and a user message, and returns a conversational response and an updated itinerary.
 */

import { ai } from '@/ai/genkit';
import { ChatWithItineraryInput, ChatWithItineraryInputSchema, ChatWithItineraryOutput, ChatWithItineraryOutputSchema } from '@/ai/schemas';
import { getLocalPulse } from '@/ai/tools/get-local-pulse';
import { getEntertainmentEvents } from '@/ai/tools/get-entertainment-events';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import { z } from 'zod';

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

const chatItineraryPrompt = ai.definePrompt({
    name: 'chatItineraryPrompt',
    input: { schema: ChatWithItineraryInputSchema.extend({endDate: z.string(), dayDates: z.array(z.string())}) },
    output: { schema: ChatWithItineraryOutputSchema },
    tools: [getLocalPulse, getEntertainmentEvents],
    prompt: `You are a friendly and expert Ghanaian travel assistant. A user is asking a question or requesting a change to their current travel itinerary.

Your task is to respond conversationally while also regenerating the itinerary based on their request.

Current Itinerary:
---
{{currentItinerary}}
---

User's Message: "{{userMessage}}"

Instructions:
1.  **Analyze the User's Message**: Understand if the user is asking a question (e.g., "How long does it take to get from Accra to Cape Coast?") or requesting a change (e.g., "Can you add a visit to a museum in Accra on Day 2?").
2.  **Formulate a Conversational Response**: Write a friendly, helpful response that directly addresses the user's message.
    *   If they ask a question, answer it.
    *   If they request a change, confirm you are making the change.
    *   If the request is not feasible, explain why kindly and suggest an alternative.
3.  **Update the Itinerary**: Modify the original itinerary to incorporate the user's request.
    *   The updated itinerary MUST be logistically sound and geographically plausible.
    *   As you rebuild the itinerary, use your tools ('getLocalPulse', 'getEntertainmentEvents') to see if any new events are relevant based on the changes.
    *   Maintain all the original formatting rules: specific dates in titles, "Read More" links, and highlighted special events.
4.  **Return Both Response and Itinerary**: Your final output MUST include both the 'response' text and the full, updated 'itinerary' object.

Key Information for you to use:
- Trip Dates: {{startDate}} to {{endDate}}
- Trip Regions: {{#each region}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- Day Dates Array: {{#each dayDates}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

Example Interaction:
- User Message: "I'd like to spend less time on the beach and more time on history on Day 3."
- Your Conversational Response: "Of course! I've updated your plan for Day 3. Instead of the beach in the afternoon, I've scheduled a visit to the W.E.B. Du Bois Centre for Pan African Culture. It's a fascinating place with a rich history. Here is your updated itinerary."
- Your Updated Itinerary: [The full, modified itinerary object for all days]

Generate a response that adheres to the ChatWithItineraryOutputSchema.`,
});


const chatWithItineraryFlow = ai.defineFlow(
    {
        name: 'chatWithItineraryFlow',
        inputSchema: ChatWithItineraryInputSchema.extend({endDate: z.string(), dayDates: z.array(z.string())}),
        outputSchema: ChatWithItineraryOutputSchema,
    },
    async (input) => {
        const { output } = await chatItineraryPrompt(input);
        return output!;
    }
);
