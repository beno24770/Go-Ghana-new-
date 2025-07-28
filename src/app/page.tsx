import BudgetEstimator from '@/components/budget-estimator';
import { Suspense } from 'react';

// We wrap the main client component in Suspense to allow it to use `useSearchParams`
// without causing the entire page to be client-rendered.
const BudgetEstimatorFallback = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
)

export default function Home() {
  return (
    <Suspense fallback={<BudgetEstimatorFallback />}>
      <BudgetEstimator />
    </Suspense>
  );
}
