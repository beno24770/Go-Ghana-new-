
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import accommodationsData from '@/data/accommodations.json';

const GetAccommodationsInputSchema = z.object({
  regions: z.array(z.string()).describe('The regions the user will be visiting.'),
  travelStyle: z.string().describe("The user's travel style (e.g., Budget, Mid-range, Luxury)."),
});

const AccommodationSchema = z.object({
    id: z.string(),
    name: z.string(),
    region: z.string(),
    location: z.string(),
    travelStyle: z.array(z.string()),
    description: z.string(),
    image: z.string(),
    link: z.string().describe("A URL to the accommodation's website or booking page."),
});

const GetAccommodationsOutputSchema = z.object({
  accommodations: z.array(AccommodationSchema).describe('A list of suitable accommodations.'),
});

/**
 * A Genkit tool that retrieves accommodations based on the user's travel plans.
 */
export const getAccommodations = ai.defineTool(
  {
    name: 'getAccommodations',
    description: 'Get a list of accommodations based on travel regions and style.',
    inputSchema: GetAccommodationsInputSchema,
    outputSchema: GetAccommodationsOutputSchema,
  },
  async (input) => {
    const { regions, travelStyle } = input;

    let relevantAccommodations = accommodationsData.filter(accommodation => {
      const isInRegion = regions.includes(accommodation.region);
      const hasStyle = accommodation.travelStyle.includes(travelStyle);
      return isInRegion && hasStyle;
    });

    // If no accommodations are found for the specific region and style,
    // broaden the search to any region with the correct style.
    // This prevents the AI from failing if the user's selection is too narrow.
    if (relevantAccommodations.length === 0) {
      relevantAccommodations = accommodationsData.filter(accommodation => 
        accommodation.travelStyle.includes(travelStyle)
      );
    }

    return { accommodations: relevantAccommodations };
  }
);
