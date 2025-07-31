'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import articlesData from '@/data/articles.json';

const GetArticleLinkInputSchema = z.object({
  attractionName: z.string().describe('The name of the tourist attraction.'),
});

const GetArticleLinkOutputSchema = z.object({
  url: z.string().describe('The URL of the article about the attraction.'),
});

/**
 * A Genkit tool that retrieves a URL for an article about a specific attraction.
 */
export const getArticleLink = ai.defineTool(
  {
    name: 'getArticleLink',
    description: 'Get a URL for a letvisitghana.com article based on an attraction name.',
    inputSchema: GetArticleLinkInputSchema,
    outputSchema: GetArticleLinkOutputSchema,
  },
  async (input) => {
    const { attractionName } = input;
    const lowerCaseAttraction = attractionName.toLowerCase();

    const article = articlesData.attractions.find(attraction => 
      attraction.keywords.some(keyword => lowerCaseAttraction.includes(keyword))
    );

    return { url: article ? article.url : 'https://www.letvisitghana.com' };
  }
);
