
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
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

type BudgetData = {
  inputs: EstimateBudgetInput;
  outputs: EstimateBudgetOutput;
};

interface BudgetResultsProps {
  data: BudgetData | null;
  isLoading: boolean;
  onPlanItinerary: (inputs: EstimateBudgetInput, total: number) => void;
}

const categoryDetails = {
  accommodation: { icon: <BedDouble className="h-5 w-5" />, color: 'hsl(var(--chart-1))' },
  food: { icon: <Utensils className="h-5 w-5" />, color: 'hsl(var(--chart-2))' },
  transportation: { icon: <Car className="h-5 w-5" />, color: 'hsl(var(--chart-3))' },
  activities: { icon: <Ticket className="h-5 w-5" />, color: 'hsl(var(--chart-4))' },
};

type CategoryKey = keyof Omit<EstimateBudgetOutput, 'total'>;


export default function BudgetResults({ data, isLoading, onPlanItinerary }: BudgetResultsProps) {
  const { toast } = useToast();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
  const totalPerDay = outputs.total > 0 && inputs.duration > 0 ? outputs.total / inputs.duration : 0;

  const chartData = (Object.keys(outputs) as CategoryKey[])
    .filter(key => key !== 'total' && outputs[key] && outputs[key].total > 0)
    .map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: outputs[key].total,
      ...categoryDetails[key],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percent = ((payload[0].value / outputs.total) * 100).toFixed(0);
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <p className="font-bold">{`${payload[0].name}: $${payload[0].value.toLocaleString()} (${percent}%)`}</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;

    if (!payload) return null;
    
    return (
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-sm">
        {
          payload.map((entry: any, index: number) => {
            const categoryKey = entry.value.toLowerCase() as CategoryKey;
            
            // This check is to prevent a crash if a category doesn't exist in our details map.
            if (!categoryDetails[categoryKey] || !outputs[categoryKey]) return null;

            return (
              <li 
                key={`item-${index}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="capitalize text-muted-foreground">{entry.value}</span>
                <span className="font-semibold ml-auto">${outputs[categoryKey].total.toLocaleString()}</span>
              </li>
            )
          })
        }
      </ul>
    );
  }
  
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

        <div className="w-full h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={true}
                        activeIndex={activeIndex ?? -1}
                        activeShape={(props: any) => {
                            const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                            // This is a simplified active shape; you can customize it further.
                            return (
                                <g>
                                    <path d={props.d} stroke={props.stroke} fill={fill} />
                                    <path 
                                        d={props.d} 
                                        stroke={fill} 
                                        strokeWidth={2}
                                        fill="none"
                                        style={{ transform: 'scale(1.05)', transformOrigin: `${cx}px ${cy}px` }}
                                    />
                                </g>
                            );
                        }}
                    >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>

        <Legend content={renderLegend} onMouseEnter={(e: any) => e.payload && setActiveIndex(e.payload.index)} onMouseLeave={() => setActiveIndex(null)} />
        
        <div className="space-y-2 pt-4">
            <Button onClick={handlePlanClick} className="w-full" size="lg">
              <Wand2 className="mr-2 h-4 w-4" />
              Create a Plan with this Budget
            </Button>
            <Button onClick={handleShare} variant="outline" className="w-full" size="lg">
              <Share2 className="mr-2 h-4 w-4" />
              Share This Estimate
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
