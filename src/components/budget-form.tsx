
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
import { useEffect, useState, useMemo } from 'react';
import { Slider } from './ui/slider';

const ghanaRegions = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern",
  "Greater Accra", "North East", "Northern", "Oti", "Savannah",
  "Upper East", "Upper West", "Volta", "Western", "Western North"
];

const travelStyles: { name: EstimateBudgetInput['travelStyle'], description: string, range: [number, number] }[] = [
    { name: 'Budget', description: '($60 - $140/day)', range: [60, 140] },
    { name: 'Mid-range', description: '($150 - $320/day)', range: [150, 320] },
    { name: 'Luxury', description: '($400 - $1000+/day)', range: [400, 1000] },
];

interface BudgetFormProps {
  onSubmit: (data: EstimateBudgetInput) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<EstimateBudgetInput>;
}

export default function BudgetForm({ onSubmit, isSubmitting, defaultValues }: BudgetFormProps) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<EstimateBudgetInput>({
    resolver: zodResolver(EstimateBudgetInputSchema),
    defaultValues: {
      duration: 7,
      region: ['Greater Accra'],
      travelStyle: 'Mid-range',
      numTravelers: 1,
      startDate: new Date().toISOString().split('T')[0],
      isNewToGhana: false,
      dailyBudget: 235,
      ...defaultValues
    },
  });

  const isNewToGhana = form.watch('isNewToGhana');
  const travelStyle = form.watch('travelStyle');
  const dailyBudget = form.watch('dailyBudget');

  const selectedStyleConfig = useMemo(() => travelStyles.find(s => s.name === travelStyle), [travelStyle]);


  useEffect(() => {
    if (isNewToGhana) {
      form.setValue('region', []);
    }
  }, [isNewToGhana, form]);

  useEffect(() => {
    if (selectedStyleConfig) {
      // Set default daily budget to the middle of the range when style changes
      const [min, max] = selectedStyleConfig.range;
      const middle = Math.round((min + max) / 2);
      form.setValue('dailyBudget', middle);
    }
  }, [travelStyle, selectedStyleConfig, form]);

  const selectedDate = form.watch('startDate');
  const dateForPicker = selectedDate ? new Date(selectedDate) : undefined;
  if (dateForPicker) {
      dateForPicker.setMinutes(dateForPicker.getMinutes() + dateForPicker.getTimezoneOffset());
  }


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
                        {isClient && field.value ? (
                            format(dateForPicker || new Date(), "PPP")
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
                        selected={dateForPicker}
                        onSelect={(date) => {
                            if (date) {
                                field.onChange(format(date, 'yyyy-MM-dd'));
                            }
                        }}
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
                <div className="flex justify-between items-center">
                    <FormLabel>Regions</FormLabel>
                    <FormField
                        control={form.control}
                        name="isNewToGhana"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal text-sm">
                                    I'm new to Ghana
                                </FormLabel>
                            </FormItem>
                        )}
                    />
                </div>
              <Card className={cn(isNewToGhana && "bg-muted/50")}>
                <CardContent className="p-4 pt-4">
                  <ScrollArea className="h-48">
                    <div className={cn("space-y-2", isNewToGhana && "opacity-50")}>
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
                                  const currentValue = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValue, region]);
                                  } else {
                                    field.onChange(
                                      currentValue.filter(
                                        (value) => value !== region
                                      )
                                    );
                                  }
                                }}
                                disabled={isNewToGhana}
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
               <FormDescription>
                Select the regions you want to visit, or let us suggest some if you're new!
              </FormDescription>
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

        {selectedStyleConfig && (
            <FormField
                control={form.control}
                name="dailyBudget"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Daily Budget (per person)</FormLabel>
                        <div className="flex items-center gap-4">
                            <FormControl>
                                <Slider
                                    min={selectedStyleConfig.range[0]}
                                    max={selectedStyleConfig.range[1]}
                                    step={5}
                                    value={[field.value ?? 0]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="flex-1"
                                />
                            </FormControl>
                            <div className="font-bold text-lg w-24 text-right text-primary">
                                ${dailyBudget?.toLocaleString()}
                            </div>
                        </div>
                        <FormDescription>
                            Fine-tune your daily spending within the {travelStyle} range.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )}


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
