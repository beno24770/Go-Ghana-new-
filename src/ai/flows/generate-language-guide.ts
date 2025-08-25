
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
    model: 'googleai/gemini-1.5-flash-latest',
    input: { schema: GenerateLanguageGuideInputSchema },
    output: { schema: GenerateLanguageGuideOutputSchema },
    prompt: `You are a Ghana travel and language expert. A first-time solo traveler is visiting the following regions in Ghana: {{#each region}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}.

Your Task:
1.  **Identify the Primary Language**: The primary language for a traveler in Ghana should be Twi, as it is the most widely spoken and understood across the country. Your primary output should be in Twi.
2.  **Generate a List of Phrases**: Create a list of 10-15 essential phrases for a traveler. The list should cover categories like Greetings, Common Questions, Market/Shopping, and Directions.
3.  **Provide Clear Translations**: For each phrase, provide the English version, the translated version in Twi, and confirm the language name is "Twi".
4.  **Ensure Accuracy**: The translations must be accurate and culturally appropriate. Use the examples below as a guide for quality.

Example for Ashanti region:
- English: "How much is this?"
- Translation: "Yɛ sɛn?"
- Language: "Twi"

- English: "Good evening"
- Translation: "Maadwo"
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
