'use server';

/**
 * @fileOverview This file contains the Genkit flow for generating a local language guide.
 *
 * - generateLanguageGuide - A function that takes trip regions and returns a list of useful phrases.
 */

import { ai } from '@/ai/genkit';
import { GenerateLanguageGuideInput, GenerateLanguageGuideInputSchema, GenerateLanguageGuideOutput, GenerateLanguageGuideOutputSchema } from '@/ai/schemas';

export async function generateLanguageGuide(input: GenerateLanguageGuideInput): Promise<GenerateLanguageGuideOutput> {
    return generateLanguageGuideFlow(input);
}

const generateLanguageGuidePrompt = ai.definePrompt({
    name: 'generateLanguageGuidePrompt',
    input: { schema: GenerateLanguageGuideInputSchema },
    output: { schema: GenerateLanguageGuideOutputSchema },
    prompt: `You are a Ghana travel and language expert. A first-time solo traveler is visiting the following regions in Ghana: {{#each region}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}.

Your Task:
1.  **Identify the Primary Language**: Determine the most common local language spoken across the majority of the selected regions. If regions have different primary languages, choose the one that would be most useful for a traveler (e.g., Twi is widely spoken).
2.  **Generate a List of Phrases**: Create a list of 10-15 essential phrases for a traveler. The list should cover categories like Greetings, Common Questions, Market/Shopping, and Directions.
3.  **Provide Clear Translations**: For each phrase, provide the English version, the translated version in the identified local language, and the name of that language.
4.  **Ensure Accuracy**: The translations must be accurate and culturally appropriate.

Example for Ashanti region:
- English: "How much is this?"
- Translation: "Yɛ sɛn?"
- Language: "Twi"

Generate a response that adheres to the GenerateLanguageGuideOutputSchema.`,
});


const generateLanguageGuideFlow = ai.defineFlow(
    {
        name: 'generateLanguageGuideFlow',
        inputSchema: GenerateLanguageGuideInputSchema,
        outputSchema: GenerateLanguageGuideOutputSchema,
    },
    async (input) => {
        const { output } = await generateLanguageGuidePrompt(input);
        return output!;
    }
);
