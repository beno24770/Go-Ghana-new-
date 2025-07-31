
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import restaurantsData from '@/data/restaurants.json';

const GetRestaurantsInputSchema = z.object({
  regions: z.array(z.string()).describe("The user's travel regions."),
  style: z.array(z.string()).optional().describe("The desired style of food (e.g., 'Local Dining', 'Fine Dining')."),
});

const RestaurantSchema = z.object({
    id: z.string(),
    name: z.string(),
    region: z.string(),
    location: z.string(),
    style: z.string(),
    description: z.string(),
    link: z.string().describe("Contact info or a link to the restaurant's website."),
});

const GetRestaurantsOutputSchema = z.object({
  restaurants: z.array(RestaurantSchema).describe('A list of suitable restaurants.'),
});

/**
 * A Genkit tool that retrieves restaurants based on the user's travel plans.
 */
export const getRestaurants = ai.defineTool(
  {
    name: 'getRestaurants',
    description: 'Get a list of restaurants based on travel regions and food style.',
    inputSchema: GetRestaurantsInputSchema,
    outputSchema: GetRestaurantsOutputSchema,
  },
  async (input) => {
    const { regions, style } = input;

    const relevantRestaurants = restaurantsData.filter(restaurant => {
      const isInRegion = regions.includes(restaurant.region);
      const hasStyle = !style || style.length === 0 || style.includes(restaurant.style);
      return isInRegion && hasStyle;
    });

    return { restaurants: relevantRestaurants };
  }
);
