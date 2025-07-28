/**
 * @fileOverview This file contains the Zod schemas and TypeScript types for the application.
 */

import { z } from 'zod';

const CostBreakdownSchema = z.object({
  perDay: z.number().describe('Estimated cost per day for this category.'),
  total: z.number().describe('Estimated total cost for this category for the entire trip.'),
});

export const EstimateBudgetInputSchema = z.object({
  duration: z.number().describe('The duration of the trip in days.'),
  region: z.array(z.string()).min(1, 'Please select at least one region.').describe('The regions in Ghana the user will be visiting.'),
  travelStyle: z.enum(['Budget', 'Mid-range', 'Luxury']).describe('The travel style of the user.'),
  numTravelers: z.number().describe('The number of travelers.'),
});
export type EstimateBudgetInput = z.infer<typeof EstimateBudgetInputSchema>;

export const EstimateBudgetOutputSchema = z.object({
  accommodation: CostBreakdownSchema.describe('Estimated cost of accommodation.'),
  food: CostBreakdownSchema.describe('Estimated cost of food.'),
  transportation: CostBreakdownSchema.describe('Estimated cost of transportation.'),
  activities: CostBreakdownSchema.describe('Estimated cost of activities.'),
  total: z.number().describe('Total estimated cost for the trip.'),
});
export type EstimateBudgetOutput = z.infer<typeof EstimateBudgetOutputSchema>;

export const PlanTripInputSchema = z.object({
  duration: z.number().describe('The duration of the trip in days.'),
  region: z.array(z.string()).min(1, 'Please select at least one region.').describe('The regions in Ghana the user will be visiting.'),
  budget: z.number().describe('The total budget for the trip in USD.'),
  numTravelers: z.number().describe('The number of travelers.'),
  travelStyle: z.enum(['Budget', 'Mid-range', 'Luxury']).describe('The travel style of the user.'),
  interests: z.array(z.string()).optional().describe('The interests of the user, e.g., Culture, Heritage, Adventure.'),
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
    title: z.string().describe("A short, catchy title for the day's plan."),
    details: z.string().describe('A detailed description of the activities for the day, formatted in Markdown.'),
});

export const GenerateItineraryOutputSchema = z.object({
    itinerary: z.array(DayItinerarySchema).describe('A day-by-day itinerary for the trip.'),
});
export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;


export const GeneratePackingListInputSchema = z.object({
    duration: z.number().describe('The duration of the trip in days.'),
    region: z.array(z.string()).describe('The regions in Ghana the user will be visiting.'),
    travelStyle: z.enum(['Budget', 'Mid-range', 'Luxury']).describe('The travel style of the user.'),
});
export type GeneratePackingListInput = z.infer<typeof GeneratePackingListInputSchema>;

export const PackingListItemSchema = z.object({
    item: z.string().describe('The name of the packing item.'),
    notes: z.string().describe('A brief, helpful note about the item.'),
});

export const GeneratePackingListOutputSchema = z.object({
    clothing: z.array(PackingListItemSchema).describe('List of clothing items.'),
    toiletries: z.array(PackingListItemSchema).describe('List of toiletries.'),
    healthAndSafety: z.array(PackingListItemSchema).describe('List of health and safety items.'),
    documents: z.array(PackingListItemSchema).describe('List of important documents.'),
    electronics: z.array(PackingListItemSchema).describe('List of electronic items and accessories.'),
    miscellaneous: z.array(PackingListItemSchema).describe('List of miscellaneous items.'),
});
export type GeneratePackingListOutput = z.infer<typeof GeneratePackingListOutputSchema>;

export const GenerateLanguageGuideInputSchema = z.object({
    region: z.array(z.string()).describe('The regions in Ghana the user will be visiting.'),
});
export type GenerateLanguageGuideInput = z.infer<typeof GenerateLanguageGuideInputSchema>;

export const PhraseSchema = z.object({
    english: z.string().describe('The phrase in English.'),
    translation: z.string().describe('The translated phrase in the local language.'),
    languageName: z.string().describe('The name of the local language (e.g., Twi, Ga).'),
});

export const GenerateLanguageGuideOutputSchema = z.object({
    phrases: z.array(PhraseSchema).describe('A list of useful phrases for the traveler.'),
});
export type GenerateLanguageGuideOutput = z.infer<typeof GenerateLanguageGuideOutputSchema>;

export const GenerateAudioInputSchema = z.object({
    text: z.string().describe('The text to be converted to speech.'),
});
export type GenerateAudioInput = z.infer<typeof GenerateAudioInputSchema>;

export const GenerateAudioOutputSchema = z.object({
    media: z.string().describe("The generated audio as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type GenerateAudioOutput = z.infer<typeof GenerateAudioOutputSchema>;
