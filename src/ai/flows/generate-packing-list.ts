'use server';

/**
 * @fileOverview This file contains the Genkit flow for generating a personalized packing list.
 *
 * - generatePackingList - A function that takes trip details and returns a suggested packing list.
 */

import { ai } from '@/ai/genkit';
import { GeneratePackingListInput, GeneratePackingListInputSchema, GeneratePackingListOutput, GeneratePackingListOutputSchema } from '@/ai/schemas';

export async function generatePackingList(input: GeneratePackingListInput): Promise<GeneratePackingListOutput> {
    return generatePackingListFlow(input);
}

const generatePackingListPrompt = ai.definePrompt({
    name: 'generatePackingListPrompt',
    input: { schema: GeneratePackingListInputSchema },
    output: { schema: GeneratePackingListOutputSchema },
    prompt: `You are a Ghana travel expert. Create a detailed packing list for a first-time solo traveler based on their trip preferences.

User Preferences:
- Duration: {{duration}} days
- Regions: {{#each region}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- Travel Style: {{travelStyle}}

Your Task:
1.  **Be Comprehensive**: Suggest items across all relevant categories: Clothing, Toiletries, Health & Safety, Documents, Electronics, and Miscellaneous.
2.  **Consider the Context**: Tailor your suggestions to the duration, regions (considering their climate and activities), and travel style. For example, a 'Luxury' traveler might need dressier outfits, while a 'Budget' traveler needs a quick-dry towel. A trip to the Northern region might require different clothing than a coastal trip.
3.  **Provide Practical Advice**: For each item, provide a brief, helpful note. For example, for "Lightweight Rain Jacket", the note could be "Essential for the rainy season (April-Oct)". For "Malaria Medication", the note could be "Consult a doctor before your trip".
4.  **Format Correctly**: Ensure the output matches the schema, with each category containing a list of objects with 'item' and 'notes' fields.

Generate a response that adheres to the GeneratePackingListOutputSchema.`,
});


const generatePackingListFlow = ai.defineFlow(
    {
        name: 'generatePackingListFlow',
        inputSchema: GeneratePackingListInputSchema,
        outputSchema: GeneratePackingListOutputSchema,
    },
    async (input) => {
        const { output } = await generatePackingListPrompt(input);
        return output!;
    }
);
