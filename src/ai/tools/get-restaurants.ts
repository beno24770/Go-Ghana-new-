
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import restaurantsData from '@/data/restaurants.json';

const GetRestaurantsInputSchema = z.object({
  regions: z.array(z.string()).describe("The user's travel regions."),
  style: z.string().optional().describe("The user's travel style (e.g., 'Budget', 'Mid-range', 'Luxury'). This will be used to determine the star rating of restaurants to recommend."),
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
    description: "Get a list of restaurants based on travel regions and travel style (which maps to star rating).",
    inputSchema: GetRestaurantsInputSchema,
    outputSchema: GetRestaurantsOutputSchema,
  },
  async (input) => {
    const { regions, style } = input;

    // Map travel style to star ratings
    const allowedStyles: string[] = [];
    if (style === 'Budget') {
        allowedStyles.push('1-star', '2-star', 'Fast Food', 'Local Dining', 'Home-style Dining');
    } else if (style === 'Mid-range') {
        allowedStyles.push('3-star');
    } else if (style === 'Luxury') {
         allowedStyles.push('3-star', 'Fine Dining', 'Historic Dining');
    }

    let relevantRestaurants = restaurantsData.filter(restaurant => {
      const isInRegion = regions.includes(restaurant.region);
      
      let hasStyle = true;
      if (style && allowedStyles.length > 0) {
        hasStyle = allowedStyles.some(allowed => 
            restaurant.style.toLowerCase().includes(allowed.toLowerCase().replace('-star','')) ||
            restaurant.description.toLowerCase().includes(allowed.toLowerCase().replace('-star',''))
        );
      }

      return isInRegion && hasStyle;
    });

    // If no restaurants are found for the specific region and style,
    // broaden the search to any region with the correct style.
    if (relevantRestaurants.length === 0 && style && allowedStyles.length > 0) {
        relevantRestaurants = restaurantsData.filter(restaurant => {
            return allowedStyles.some(allowed => 
                restaurant.style.toLowerCase().includes(allowed.toLowerCase().replace('-star','')) ||
                restaurant.description.toLowerCase().includes(allowed.toLowerCase().replace('-star',''))
            );
        });
    }

    return { restaurants: relevantRestaurants };
  }
);
