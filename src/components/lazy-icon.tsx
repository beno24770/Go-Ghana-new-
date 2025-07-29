
'use client';

import { lazy, Suspense } from 'react';
import type { LucideProps } from 'lucide-react';
import dynamic from 'next/dynamic';

const fallback = <div style={{ background: '#ddd', width: 24, height: 24 }}/>

type IconName = 'Calculator' | 'Map' | 'Car' | 'Languages';

interface LazyIconProps extends LucideProps {
  name: IconName;
}

const iconComponents = {
  Calculator: lazy(() => import('lucide-react').then(module => ({ default: module.Calculator }))),
  Map: lazy(() => import('lucide-react').then(module => ({ default: module.Map }))),
  Car: lazy(() => import('lucide-react').then(module => ({ default: module.Car }))),
  Languages: lazy(() => import('lucide-react').then(module => ({ default: module.Languages }))),
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
