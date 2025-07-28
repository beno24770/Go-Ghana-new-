
'use server';

/**
 * @fileOverview This file contains the Genkit flow for regenerating a trip itinerary from user notes.
 *
 * - regenerateItineraryFromNotes - A function that takes user-edited notes and returns a new itinerary.
 */

import { ai } from '@/ai/genkit';
import { GenerateItineraryOutput, GenerateItineraryOutputSchema, RegenerateItineraryInput, RegenerateItineraryInputSchema } from '@/ai/schemas';

export async function regenerateItineraryFromNotes(input: RegenerateItineraryInput): Promise<GenerateItineraryOutput> {
    return regenerateItineraryFlow(input);
}

const regenerateItineraryPrompt = ai.definePrompt({
    name: 'regenerateItineraryPrompt',
    input: { schema: RegenerateItineraryInputSchema },
    output: { schema: GenerateItineraryOutputSchema },
    prompt: `You are a Ghana travel expert and content curator for letvisitghana.com. A user has provided an edited version of a travel itinerary. Your task is to refine and regenerate the itinerary based on their notes.

User's Edited Itinerary Notes:
---
{{notes}}
---

Your Task:
1.  **Analyze the User's Notes**: Read the user's notes carefully to understand their desired changes, additions, and removals.
2.  **Maintain Structure**: Re-create the day-by-day itinerary structure. Each day must have a 'day' number, a 'title', and 'details'.
3.  **Incorporate Changes**: Integrate the user's requests into the itinerary.
4.  **Ensure Feasibility**: Make sure the regenerated itinerary is logistically sound. Consider travel times and geographic locations.
5.  **Enhance with Links**: Where appropriate, embed or maintain relevant Markdown links to articles on letvisitghana.com. For example, if the user adds "Visit Mole National Park", you should add a link like \`[Read more about Mole National Park](https://www.letvisitghana.com/tourist-sites/mole-national-park/)\`.
6.  **Refine and Polish**: Use your expertise to improve the flow, suggest better routes, or add small details. The output should be a complete and practical itinerary.
7.  **Format with Markdown**: Use Markdown for lists, bold text, and links in the 'details' field.

Generate a response that adheres to the GenerateItineraryOutputSchema.`,
});


const regenerateItineraryFlow = ai.defineFlow(
    {
        name: 'regenerateItineraryFlow',
        inputSchema: RegenerateItineraryInputSchema,
        outputSchema: GenerateItineraryOutputSchema,
    },
    async (input) => {
        const { output } = await regenerateItineraryPrompt(input);
        return output!;
    }
);
