/**
 * @fileOverview This file contains the Zod schemas and TypeScript types for the application.
 */

import { z } from 'zod';

export const EstimateBudgetInputSchema = z.object({
  duration: z.number().describe('The duration of the trip in days.'),
  region: z.array(z.string()).min(1, 'Please select at least one region.').describe('The regions in Ghana the user will be visiting.'),
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

export const PlanTripInputSchema = z.object({
  duration: z.number().describe('The duration of the trip in days.'),
  region: z.array(z.string()).min(1, 'Please select at least one region.').describe('The regions in Ghana the user will be visiting.'),
  budget: z.number().describe('The total budget for the trip in USD.'),
  numTravelers: z.number().describe('The number of travelers.'),
});
export type PlanTripInput = z.infer<typeof PlanTripInputSchema>;

export const PlanTripOutputSchema = z.object({
  suggestedTravelStyle: z.enum(['Budget', 'Mid-range', 'Luxury']).describe('The suggested travel style based on the budget.'),
  accommodation: z.object({
    cost: z.number().describe('Estimated cost of accommodation.'),
    description: z.string().describe('Description of accommodation options.'),
  }),
  food: z.object({
    cost: z.number().describe('Estimated cost of food.'),
    description: z.string().describe('Description of food options and where to eat.'),
  }),
  transportation: z.object({
    cost: z.number().describe('Estimated cost of transportation.'),
    description: z.string().describe('Description of transportation options.'),
  }),
  activities: z.object({
    cost: z.number().describe('Estimated cost of activities.'),
    description: z.string().describe('Suggested activities and itineraries.'),
  }),
  total: z.number().describe('Total estimated cost for the trip.'),
});
export type PlanTripOutput = z.infer<typeof PlanTripOutputSchema>;

export const GenerateItineraryInputSchema = z.object({
    duration: z.number().describe('The duration of the trip in days.'),
    region: z.array(z.string()).describe('The regions in Ghana the user will be visiting.'),
    travelStyle: z.enum(['Budget', 'Mid-range', 'Luxury']).describe('The travel style of the user.'),
    activitiesBudget: z.number().describe('The budget allocated for activities.'),
});
export type GenerateItineraryInput = z.infer<typeof GenerateItineraryInputSchema>;

export const DayItinerarySchema = z.object({
    day: z.number().describe('The day number of the itinerary.'),
    title: z.string().describe('A short, catchy title for the day\'s plan.'),
    details: z.string().describe('A detailed description of the activities for the day.'),
});

export const GenerateItineraryOutputSchema = z.object({
    itinerary: z.array(DayItinerarySchema).describe('A day-by-day itinerary for the trip.'),
});
export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;
