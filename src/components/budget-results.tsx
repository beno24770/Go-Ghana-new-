'use client';

import {
  BedDouble,
  Car,
  Copy,
  Share2,
  Ticket,
  Utensils,
} from 'lucide-react';
import { Pie, PieChart } from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useToast } from '@/hooks/use-toast';
import type { EstimateBudgetInput, EstimateBudgetOutput } from '@/ai/schemas';
import Image from 'next/image';

type BudgetData = {
  inputs: EstimateBudgetInput;
  outputs: EstimateBudgetOutput;
};

interface BudgetResultsProps {
  data: BudgetData | null;
  isLoading: boolean;
}

const chartConfig = {
  cost: {
    label: 'Cost (USD)',
  },
  accommodation: {
    label: 'Accommodation',
    color: 'hsl(var(--chart-1))',
  },
  food: {
    label: 'Food',
    color: 'hsl(var(--chart-2))',
  },
  transportation: {
    label: 'Transportation',
    color: 'hsl(var(--chart-3))',
  },
  activities: {
    label: 'Activities',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

const categoryIcons = {
  accommodation: <BedDouble className="h-6 w-6 text-muted-foreground" />,
  food: <Utensils className="h-6 w-6 text-muted-foreground" />,
  transportation: <Car className="h-6 w-6 text-muted-foreground" />,
  activities: <Ticket className="h-6 w-6 text-muted-foreground" />,
};

export default function BudgetResults({ data, isLoading }: BudgetResultsProps) {
  const { toast } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Copied to Clipboard',
      description: 'The link to your budget estimate has been copied.',
      action: <Copy className="h-4 w-4" />,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[500px] w-full items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
            <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 font-headline text-xl">Generating your estimate...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full min-h-[500px] w-full items-center justify-center rounded-lg border border-dashed bg-muted/50 p-8">
        <div className="text-center">
          <h3 className="font-headline text-2xl">Your Budget Awaits</h3>
          <p className="mt-2 text-muted-foreground">
            Your personalized budget estimate will appear here once you fill out the form.
          </p>
          <Image 
            src="https://placehold.co/600x400"
            alt="Placeholder image of a Ghana landscape"
            width={600}
            height={400}
            className="mt-6 rounded-lg object-cover"
            data-ai-hint="ghana beach"
          />
        </div>
      </div>
    );
  }

  const { inputs, outputs } = data;
  const chartData = Object.keys(outputs)
    .filter(key => key !== 'total')
    .map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      cost: outputs[key as keyof typeof outputs],
      fill: `var(--color-${key})`,
    }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Your Estimated Budget</CardTitle>
        <CardDescription>
          For a {inputs.duration}-day trip to {inputs.region} for {inputs.numTravelers} traveler(s) ({inputs.travelStyle} style).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
          <p className="font-headline text-5xl font-bold tracking-tighter text-primary">
            ${outputs.total.toLocaleString()}
          </p>
        </div>

        <div className="h-[250px] w-full">
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="cost"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
                labelLine={false}
              />
            </PieChart>
          </ChartContainer>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(Object.keys(outputs) as Array<keyof typeof outputs>)
              .filter(key => key !== 'total')
              .map(key => (
              <Card key={key} className="bg-background/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </CardTitle>
                  {categoryIcons[key as keyof typeof categoryIcons]}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${outputs[key].toLocaleString()}</div>
                </CardContent>
              </Card>
            ))}
        </div>

        <Button onClick={handleShare} variant="outline" className="w-full">
          <Share2 className="mr-2 h-4 w-4" />
          Share This Estimate
        </Button>
      </CardContent>
    </Card>
  );
}
