
'use client';

import type { LucideProps } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ComponentType, Suspense } from 'react';
import { Skeleton } from './ui/skeleton';

const fallback = <Skeleton className="h-10 w-10 rounded-full" />

type IconName = 'Calculator' | 'Map' | 'Car' | 'Languages';

interface LazyIconProps extends LucideProps {
  name: IconName;
}

const iconComponents: { [key in IconName]: ComponentType<LucideProps> } = {
  Calculator: dynamic(() => import('lucide-react').then(module => module.Calculator), { ssr: false }),
  Map: dynamic(() => import('lucide-react').then(module => module.Map), { ssr: false }),
  Car: dynamic(() => import('lucide-react').then(module => module.Car), { ssr: false }),
  Languages: dynamic(() => import('lucide-react').then(module => module.Languages), { ssr: false }),
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
