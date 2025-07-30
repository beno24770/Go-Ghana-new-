
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Wand2, LoaderCircle, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type EstimateBudgetInput, EstimateBudgetInputSchema } from '@/ai/schemas';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import format from 'date-fns/format';
import add from 'date-fns/add';
import toDate from 'date-fns/toDate';

const ghanaRegions = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern",
  "Greater Accra", "North East", "Northern", "Oti", "Savannah",
  "Upper East", "Upper West", "Volta", "Western", "Western North"
];

const travelStyles: { name: EstimateBudgetInput['travelStyle'], description: string }[] = [
    { name: 'Budget', description: '(approx. $60-140/day)' },
    { name: 'Mid-range', description: '(approx. $150-320/day)' },
    { name: 'Luxury', description: '(approx. $400+/day)' },
];

interface BudgetFormProps {
  onSubmit: (data: EstimateBudgetInput) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<EstimateBudgetInput>;
}

const parseDateWithOffset = (dateString: string) => {
    const date = toDate(dateString);
    return add(date, { minutes: date.getTimezoneOffset() });
};


export default function BudgetForm({ onSubmit, isSubmitting, defaultValues }: BudgetFormProps) {
  const form = useForm<EstimateBudgetInput>({
    resolver: zodResolver(EstimateBudgetInputSchema),
    defaultValues: {
      duration: 7,
      region: ['Greater Accra'],
      travelStyle: 'Mid-range',
      numTravelers: 1,
      startDate: new Date().toISOString().split('T')[0],
      ...defaultValues
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
         <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Trip Start Date</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(parseDateWithOffset(field.value), "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value ? toDate(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
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
                                checked={field.value?.includes(region)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), region])
                                    : field.onChange(
                                        field.value?.filter(
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
          <span className="ml-2">{isSubmitting ? 'Estimating...' : 'Estimate Budget'}</span>
        </Button>
      </form>
    </Form>
  );
}
