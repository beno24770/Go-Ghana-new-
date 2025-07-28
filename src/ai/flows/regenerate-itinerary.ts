
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
    prompt: `You are a Ghana travel expert. A user has provided an edited version of a travel itinerary. Your task is to refine and regenerate the itinerary based on their notes.

User's Edited Itinerary Notes:
---
{{notes}}
---

Your Task:
1.  **Analyze the User's Notes**: Read the user's notes carefully to understand their desired changes, additions, and removals.
2.  **Maintain Structure**: Re-create the day-by-day itinerary structure. Each day must have a 'day' number, a 'title', and 'details'.
3.  **Incorporate Changes**: Integrate the user's requests into the itinerary. If they added a new location, find a logical place for it. If they removed an activity, fill the time appropriately or suggest an alternative.
4.  **Ensure Feasibility**: Make sure the regenerated itinerary is logistically sound. Consider travel times and the geographic locations of the attractions.
5.  **Enhance and Refine**: Use your expertise to improve the flow, suggest better routes, or add small details that would enhance the user's trip based on their edits. The output should be a complete, polished, and practical itinerary.
6.  **Format with Markdown**: Use Markdown for lists, bold text, and paragraphs in the 'details' field to ensure it's well-structured and readable.

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
