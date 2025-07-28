import { PlaneTakeoff } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <PlaneTakeoff className="h-8 w-8 text-primary" />
      <h1 className="font-headline text-2xl font-bold text-primary tracking-tight">
        GoGhana Estimator
      </h1>
    </div>
  );
}
