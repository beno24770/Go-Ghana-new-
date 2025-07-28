
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
import { Checkbox } from '@/components/ui/checkbox';
import { type PlanTripInput, PlanTripInputSchema } from '@/ai/schemas';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from './ui/scroll-area';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const ghanaRegions = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern",
  "Greater Accra", "North East", "Northern", "Oti", "Savannah",
  "Upper East", "Upper West", "Volta", "Western", "Western North"
];

const travelStyles: { name: PlanTripInput['travelStyle'], description: string }[] = [
    { name: 'Budget', description: '(approx. $60-140/day)' },
    { name: 'Mid-range', description: '(approx. $150-320/day)' },
    { name: 'Luxury', description: '(approx. $400+/day)' },
];

const interests = [
  { id: 'Culture', label: 'Culture' },
  { id: 'Heritage & History', label: 'Heritage & History' },
  { id: 'Adventure', label: 'Adventure' },
  { id: 'Nature & Wildlife', label: 'Nature & Wildlife' },
  { id: 'Beaches & Relaxation', label: 'Beaches & Relaxation' },
  { id: 'Nightlife & Urban', label: 'Nightlife & Urban' },
]

interface TripPlanFormProps {
  onSubmit: (data: PlanTripInput) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<PlanTripInput>;
}

export default function TripPlanForm({ onSubmit, isSubmitting, defaultValues }: TripPlanFormProps) {
  const form = useForm<PlanTripInput>({
    resolver: zodResolver(PlanTripInputSchema),
    defaultValues: {
      duration: 7,
      region: ['Greater Accra'],
      budget: 1000,
      numTravelers: 1,
      travelStyle: 'Mid-range',
      interests: ['Culture', 'Heritage & History'],
      ...defaultValues,
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
          render={() => (
            <FormItem>
              <FormLabel>Regions</FormLabel>
              <Card>
                <CardContent className="p-4 pt-4">
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                    {ghanaRegions.map((region) => (
                      <FormField
                        key={region}
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={(field.value || []).includes(region)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValue, region])
                                    : field.onChange(
                                        currentValue?.filter(
                                          (value) => value !== region
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {region}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="interests"
          render={() => (
            <FormItem>
              <FormLabel>Interests</FormLabel>
              <Card>
                <CardContent className="p-4 pt-4">
                  <div className="space-y-2">
                  {interests.map((interest) => (
                    <FormField
                      key={interest.id}
                      control={form.control}
                      name="interests"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={interest.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={(field.value || []).includes(interest.id)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValue, interest.id])
                                    : field.onChange(
                                        currentValue?.filter(
                                          (value) => value !== interest.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {interest.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  </div>
                </CardContent>
              </Card>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="travelStyle"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Travel Style</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {travelStyles.map(style => (
                    <FormItem key={style.name} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={style.name} />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center">
                        {style.name}
                        <span className="text-xs text-muted-foreground ml-2">{style.description}</span>
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
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
