
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import entertainmentData from '@/data/entertainment-events.json';
import { getDay } from 'date-fns';

const EntertainmentEventsInputSchema = z.object({
  regions: z.array(z.string()).describe('The regions the user will be visiting.'),
  startDate: z.string().describe('The start date of the trip in YYYY-MM-DD format.'),
  endDate: z.string().describe('The end date of the trip in YYYY-MM-DD format.'),
});

const EntertainmentEventSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.array(z.string()),
    region: z.array(z.string()),
    location: z.string(),
    venue: z.string(),
    typicalDays: z.array(z.string()),
    cost: z.string(),
    insiderTip: z.string(),
});

const EntertainmentEventsOutputSchema = z.object({
  events: z.array(EntertainmentEventSchema).describe('A list of relevant entertainment and nightlife events.'),
});

/**
 * A Genkit tool that retrieves entertainment and nightlife events based on the user's travel plans.
 */
export const getEntertainmentEvents = ai.defineTool(
  {
    name: 'getEntertainmentEvents',
    description: 'Get a list of entertainment and nightlife events based on travel dates and regions.',
    inputSchema: EntertainmentEventsInputSchema,
    outputSchema: EntertainmentEventsOutputSchema,
  },
  async (input) => {
    const { regions, startDate, endDate } = input;
    const userStartDate = new Date(startDate);
    const userEndDate = new Date(endDate);

    const dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const tripDays = new Set<string>();
    let currentDate = new Date(userStartDate);
    while (currentDate <= userEndDate) {
        tripDays.add(dayMap[getDay(currentDate)]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const relevantEvents = entertainmentData.filter(event => {
      // Check if any of the event's typical days fall within the user's trip days
      const hasDayOverlap = event.typicalDays.some(day => tripDays.has(day));

      // Check for region overlap
      const hasRegionOverlap = event.region.some(r => regions.includes(r));

      return hasDayOverlap && hasRegionOverlap;
    });

    return { events: relevantEvents };
  }
);
    
