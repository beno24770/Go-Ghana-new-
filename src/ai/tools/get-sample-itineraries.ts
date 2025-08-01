
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import sampleItinerariesData from '@/data/sample-itineraries.json';
import { number } from 'zod';

const GetSampleItinerariesInputSchema = z.object({
  interests: z.array(z.string()).optional().describe('The interests of the user, e.g., Culture, Heritage, Adventure.'),
  duration: z.number().optional().describe('The duration of the trip in days. Used to find itineraries with a similar length.'),
});

const ItineraryDaySchema = z.object({
    day: z.number(),
    location: z.string(),
    activities: z.string(),
    overnight: z.string().optional(),
    driveTime: z.string().optional(),
});

const SampleItinerarySchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    duration: z.number(),
    style: z.array(z.string()),
    itinerary: z.array(ItineraryDaySchema),
});

const GetSampleItinerariesOutputSchema = z.object({
  itineraries: z.array(SampleItinerarySchema).describe('A list of sample itineraries that match the user\'s preferences.'),
});

/**
 * A Genkit tool that retrieves sample itineraries based on the user's interests and trip duration.
 */
export const getSampleItineraries = ai.defineTool(
  {
    name: 'getSampleItineraries',
    description: 'Get a list of expert-crafted sample itineraries based on interests and duration.',
    inputSchema: GetSampleItinerariesInputSchema,
    outputSchema: GetSampleItinerariesOutputSchema,
  },
  async (input) => {
    const { interests, duration } = input;

    let relevantItineraries = sampleItinerariesData;

    if (interests && interests.length > 0) {
        relevantItineraries = relevantItineraries.filter(itinerary => 
            interests.some(interest => 
                itinerary.style.some(style => style.toLowerCase().includes(interest.toLowerCase()))
            )
        );
    }
    
    // If a duration is provided, sort by the closest duration
    if (duration) {
        relevantItineraries.sort((a, b) => {
            const aDiff = Math.abs(a.duration - duration);
            const bDiff = Math.abs(b.duration - duration);
            return aDiff - bDiff;
        });
    }

    // Return the top 3 matches to give the AI some choice but not overwhelm it.
    return { itineraries: relevantItineraries.slice(0, 3) };
  }
);
