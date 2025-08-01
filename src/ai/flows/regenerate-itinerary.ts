
'use server';

/**
 * @fileOverview This file contains the Genkit flow for regenerating a trip itinerary from user notes.
 *
 * - regenerateItineraryFromNotes - A function that takes user-edited notes and returns a new itinerary.
 */

import { ai } from '@/ai/genkit';
import { GenerateItineraryOutput, GenerateItineraryOutputSchema, RegenerateItineraryInput, RegenerateItineraryInputSchema } from '@/ai/schemas';
import { getLocalPulse } from '@/ai/tools/get-local-pulse';
import { getEntertainmentEvents } from '@/ai/tools/get-entertainment-events';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import { z } from 'zod';
import { getRestaurants } from '../tools/get-restaurants';
import { getArticleLink } from '../tools/get-article-link';

export async function regenerateItineraryFromNotes(input: RegenerateItineraryInput): Promise<GenerateItineraryOutput> {
    const endDate = addDays(new Date(input.startDate), input.duration - 1);
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    
    const dayDates = Array.from({ length: input.duration }, (_, i) => {
        const date = addDays(new Date(input.startDate), i);
        return format(date, 'EEEE,dd-MMM-yyyy');
    });

    const fullInput = {...input, endDate: formattedEndDate, dayDates: dayDates.map(d => d.split(','))};

    return regenerateItineraryFlow(fullInput);
}

const regenerateItineraryPrompt = ai.definePrompt({
    name: 'regenerateItineraryPrompt',
    input: { schema: RegenerateItineraryInputSchema.extend({endDate: z.string(), dayDates: z.array(z.array(z.string()))}) },
    output: { schema: GenerateItineraryOutputSchema },
    tools: [getLocalPulse, getEntertainmentEvents, getRestaurants, getArticleLink],
    prompt: `You are a Ghana travel expert. A user has provided an edited version of a travel itinerary. Your task is to refine and regenerate the itinerary based on their notes, ensuring it adheres to the structured format.

User's Edited Itinerary Notes:
---
{{notes}}
---

Your Task:
1.  **Analyze User's Notes**: Carefully read the user's notes to understand their desired changes.
2.  **Adhere to Format**: You **MUST** structure the output according to the 'DayItinerarySchema'. For each day, provide:
    *   `dayOfWeek`
    *   `date` (in DD-Mon-YYYY format, using the 'dayDates' array)
    *   `location` (overnight city)
    *   `driveTime` (optional)
    *   `title`
    *   `details` (as a Markdown bulleted list)
    *   `budget` (optional Markdown string)

3.  **Use 'dayDates' Array**: Use the provided 'dayDates' array to correctly populate 'dayOfWeek' and 'date' for each day of the itinerary.
4.  **Enhance with Tools**: Use 'getLocalPulse', 'getEntertainmentEvents', 'getRestaurants', and 'getArticleLink' to add value, just as you would when creating a new itinerary. Highlight special events.
5.  **Ensure Feasibility**: Make the regenerated itinerary logistically sound. Remember the Kumasi-Cape Coast travel constraint (route through Accra).
6.  **Refine and Polish**: Use your expertise to improve the flow, suggest better routes, or add small details. The output should be a complete and practical itinerary in the correct JSON format.

Generate a response that adheres to the GenerateItineraryOutputSchema.`,
});


const regenerateItineraryFlow = ai.defineFlow(
    {
        name: 'regenerateItineraryFlow',
        inputSchema: RegenerateItineraryInputSchema.extend({endDate: z.string(), dayDates: z.array(z.array(z.string()))}),
        outputSchema: GenerateItineraryOutputSchema,
    },
    async (input) => {
        const { output } = await regenerateItineraryPrompt(input);
        return output!;
    }
);
