import { config } from 'dotenv';
config();

import '@/ai/flows/estimate-budget.ts';
import '@/ai/flows/plan-trip.ts';
import '@/ai/flows/generate-itinerary.ts';
import '@/ai/flows/generate-packing-list.ts';
import '@/ai/flows/generate-language-guide.ts';
import '@/ai/flows/generate-audio.ts';
import '@/ai/flows/regenerate-itinerary.ts';
import '@/ai/tools/get-local-pulse';


    