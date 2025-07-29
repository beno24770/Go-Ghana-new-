
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

export async function regenerateItineraryFromNotes(input: RegenerateItineraryInput): Promise<GenerateItineraryOutput> {
    const endDate = addDays(new Date(input.startDate), input.duration - 1);
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    
    const dayDates = Array.from({ length: input.duration }, (_, i) => {
        const date = addDays(new Date(input.startDate), i);
        return format(date, 'yyyy-MM-dd');
    });

    const fullInput = {...input, endDate: formattedEndDate, dayDates};

    return regenerateItineraryFlow(fullInput);
}

const regenerateItineraryPrompt = ai.definePrompt({
    name: 'regenerateItineraryPrompt',
    input: { schema: RegenerateItineraryInputSchema.extend({endDate: z.string(), dayDates: z.array(z.string())}) },
    output: { schema: GenerateItineraryOutputSchema },
    tools: [getLocalPulse, getEntertainmentEvents],
    prompt: `You are a Ghana travel expert and content curator for letvisitghana.com. A user has provided an edited version of a travel itinerary. Your task is to refine and regenerate the itinerary based on their notes.

User's Edited Itinerary Notes:
---
{{notes}}
---

Your Task:
1.  **Analyze the User's Notes**: Read the user's notes carefully to understand their desired changes, additions, and removals.
2.  **Check for Relevant Events**: As you rebuild the itinerary, use your tools to enhance it.
    *   Use the 'getLocalPulse' tool to check for any festivals or events that might be relevant to the user's new plan, based on their travel dates ({{startDate}} to {{endDate}}) and regions.
    *   If the user's notes mention nightlife or evening activities, use the 'getEntertainmentEvents' tool to find specific, relevant options.
3.  **Incorporate Changes & Events**: Integrate the user's requests and any new events found by your tools into the itinerary.
4.  **Highlight Special Events**: When you include a special event, you MUST format it with a special heading. For example: "**✨ Local Pulse: Chale Wote Street Art Festival**" or "**🎵 Nightlife: Live Highlife at +233 Grill & Bar**". You must also include the 'insiderTip' from the tool's output.
5.  **Maintain Structure**: Re-create the day-by-day itinerary structure. Each day must have a 'day' number, a 'title', and 'details'.
6.  **Add Specific Dates to Title**: For each day's title, you MUST include the specific date. Use the provided 'dayDates' array. The format should be "Day [Number] - [Date]: [Your Title]". For example: "Day 1 - 2024-05-25: Arrival in Accra".
7.  **Ensure Feasibility**: Make sure the regenerated itinerary is logistically sound. Consider travel times and geographic locations.
8.  **Enhance with Links**: Where appropriate, embed or maintain relevant Markdown links to articles on letvisitghana.com. For example, if the user adds "Visit Mole National Park", you should add a link like \`[Read more about Mole National Park](https://www.letvisitghana.com/tourist-sites/mole-national-park/)\`.
9.  **Refine and Polish**: Use your expertise to improve the flow, suggest better routes, or add small details. The output should be a complete and practical itinerary.
10. **Format with Markdown**: Use Markdown for lists, bold text, and links in the 'details' field.

Generate a response that adheres to the GenerateItineraryOutputSchema.`,
});


const regenerateItineraryFlow = ai.defineFlow(
    {
        name: 'regenerateItineraryFlow',
        inputSchema: RegenerateItineraryInputSchema.extend({endDate: z.string(), dayDates: z.array(z.string())}),
        outputSchema: GenerateItineraryOutputSchema,
    },
    async (input) => {
        const { output } = await regenerateItineraryPrompt(input);
        return output!;
    }
);
