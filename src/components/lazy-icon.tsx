
'use client';

import type { LucideProps } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Skeleton } from './ui/skeleton';

const fallback = <Skeleton className="h-10 w-10 rounded-full" />;

type IconName = 'Calculator' | 'Map' | 'Car' | 'Languages';

interface LazyIconProps extends LucideProps {
  name: IconName;
}

const iconComponents = {
  Calculator: dynamic(() => import('lucide-react').then(mod => mod.Calculator)),
  Map: dynamic(() => import('lucide-react').then(mod => mod.Map)),
  Car: dynamic(() => import('lucide-react').then(mod => mod.Car)),
  Languages: dynamic(() => import('lucide-react').then(mod => mod.Languages)),
};

export function LazyIcon({ name, ...props }: LazyIconProps) {
  const IconComponent = iconComponents[name];
  
  if (!IconComponent) {
    return fallback;
  }

  return (
    <Suspense fallback={fallback}>
      <IconComponent {...props} />
    </Suspense>
  );
}
