
'use client';

import {
  BedDouble,
  Car,
  Copy,
  Share2,
  Ticket,
  Utensils,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { EstimateBudgetInput, EstimateBudgetOutput } from '@/ai/schemas';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

type BudgetData = {
  inputs: EstimateBudgetInput;
  outputs: EstimateBudgetOutput;
};

interface BudgetResultsProps {
  data: BudgetData | null;
  isLoading: boolean;
  onPlanItinerary: (inputs: EstimateBudgetInput, total: number) => void;
}

const categoryIcons = {
  accommodation: <BedDouble className="h-6 w-6 text-muted-foreground" />,
  food: <Utensils className="h-6 w-6 text-muted-foreground" />,
  transportation: <Car className="h-6 w-6 text-muted-foreground" />,
  activities: <Ticket className="h-6 w-6 text-muted-foreground" />,
};

type CategoryKey = keyof Omit<EstimateBudgetOutput, 'total'>;

const chartConfig = {
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


export default function BudgetResults({ data, isLoading, onPlanItinerary }: BudgetResultsProps) {
  const { toast } = useToast();

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Copied to Clipboard',
        description: 'The link to your budget estimate has been copied.',
        action: <Copy className="h-4 w-4" />,
      });
    }
  };

  const handlePlanClick = () => {
    if (data) {
        onPlanItinerary(data.inputs, data.outputs.total);
    }
  }

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
        </div>
      </div>
    );
  }

  const { inputs, outputs } = data;
  const chartData = (Object.keys(outputs) as CategoryKey[])
    .filter(key => key !== 'total' && outputs[key].total > 0)
    .map(key => ({
      name: key,
      value: outputs[key].total,
      fill: `var(--color-${key})`,
    }));

  const totalPerDay = outputs.total / inputs.duration;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl">Your Estimated Budget</CardTitle>
        <CardDescription>
          For a {inputs.duration}-day trip to {inputs.region.join(', ')} for {inputs.numTravelers} traveler(s) ({inputs.travelStyle} style).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
          <p className="text-5xl font-bold tracking-tighter text-primary">
            ${outputs.total.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            (${totalPerDay.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} / day)
          </p>
        </div>

        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                {chartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name as keyof typeof chartConfig].color} />
                ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(Object.keys(outputs) as CategoryKey[])
              .filter(key => key !== 'total')
              .map(key => (
              <Card key={key} className="bg-background/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </CardTitle>
                  {categoryIcons[key]}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${outputs[key].total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">${outputs[key].perDay.toLocaleString()} / day</p>
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="space-y-2">
            <Button onClick={handlePlanClick} className="w-full">
              <Wand2 className="mr-2 h-4 w-4" />
              Create a Plan with this Budget
            </Button>
            <Button onClick={handleShare} variant="outline" className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Share This Estimate
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
