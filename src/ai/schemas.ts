/**
 * @fileOverview This file contains the Zod schemas and TypeScript types for the application.
 */

import { z } from 'zod';

export const EstimateBudgetInputSchema = z.object({
  duration: z.number().describe('The duration of the trip in days.'),
  region: z.string().describe('The region in Ghana the user will be visiting.'),
  travelStyle: z.enum(['Budget', 'Mid-range', 'Luxury']).describe('The travel style of the user.'),
  numTravelers: z.number().describe('The number of travelers.'),
});
export type EstimateBudgetInput = z.infer<typeof EstimateBudgetInputSchema>;

export const EstimateBudgetOutputSchema = z.object({
  accommodation: z.number().describe('Estimated cost of accommodation for the entire trip.'),
  food: z.number().describe('Estimated cost of food for the entire trip.'),
  transportation: z.number().describe('Estimated cost of transportation for the entire trip.'),
  activities: z.number().describe('Estimated cost of activities for the entire trip.'),
  total: z.number().describe('Total estimated cost for the trip.'),
});
export type EstimateBudgetOutput = z.infer<typeof EstimateBudgetOutputSchema>;
