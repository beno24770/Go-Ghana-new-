'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Wand2, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type PlanTripInput, PlanTripInputSchema } from '@/ai/schemas';

const ghanaRegions = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern",
  "Greater Accra", "North East", "Northern", "Oti", "Savannah",
  "Upper East", "Upper West", "Volta", "Western", "Western North"
];

interface TripPlanFormProps {
  onSubmit: (data: PlanTripInput) => void;
  isSubmitting: boolean;
  defaultValues?: PlanTripInput;
}

export default function TripPlanForm({ onSubmit, isSubmitting, defaultValues }: TripPlanFormProps) {
  const form = useForm<PlanTripInput>({
    resolver: zodResolver(PlanTripInputSchema),
    defaultValues: defaultValues || {
      duration: 7,
      region: 'Greater Accra',
      budget: 1000,
      numTravelers: 1,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Budget (USD)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 1500" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trip Duration (days)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 10" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="numTravelers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Travelers</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 2" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a region to visit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ghanaRegions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Wand2 />
          )}
          <span className="ml-2">{isSubmitting ? 'Planning...' : 'Plan My Trip'}</span>
        </Button>
      </form>
    </Form>
  );
}
