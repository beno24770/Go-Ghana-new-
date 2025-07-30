
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import localPulseData from '@/data/local-pulse.json';

const LocalPulseInputSchema = z.object({
  regions: z.array(z.string()).describe('The regions the user will be visiting.'),
  startDate: z.string().describe('The start date of the trip in YYYY-MM-DD format.'),
  endDate: z.string().describe('The end date of the trip in YYYY-MM-DD format.'),
});

const PulseEventSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.array(z.string()),
    region: z.array(z.string()),
    location: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    cost: z.string(),
    insiderTip: z.string(),
});

const LocalPulseOutputSchema = z.object({
  events: z.array(PulseEventSchema).describe('A list of relevant events and festivals.'),
});

/**
 * A Genkit tool that retrieves local events and festivals based on the user's travel plans.
 */
export const getLocalPulse = ai.defineTool(
  {
    name: 'getLocalPulse',
    description: 'Get a list of local events, festivals, and conditions based on travel dates and regions.',
    inputSchema: LocalPulseInputSchema,
    outputSchema: LocalPulseOutputSchema,
  },
  async (input) => {
    const { regions, startDate, endDate } = input;
    const userStartDate = new Date(startDate);
    const userEndDate = new Date(endDate);

    const relevantEvents = localPulseData.filter(event => {
      const eventStartDate = new Date(event.startDate);
      const eventEndDate = new Date(event.endDate);

      // Check for date overlap
      const hasDateOverlap = (
        userStartDate <= eventEndDate && userEndDate >= eventStartDate
      );

      // Check for region overlap
      const hasRegionOverlap = event.region.some(r => regions.includes(r));

      return hasDateOverlap && hasRegionOverlap;
    });

    return { events: relevantEvents };
  }
);

    
