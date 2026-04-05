'use client';

import { Check, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingStepsProps {
  currentStep: number; // 0-indexed
}

const steps = [
  'Uploading image',
  'Reading receipt',
  'Matching products',
];

export function ProcessingSteps({ currentStep }: ProcessingStepsProps) {
  return (
    <div className="space-y-3" aria-live="polite">
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step} className="flex items-center gap-3">
            {isComplete && (
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            )}
            {isCurrent && (
              <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0 motion-reduce:animate-none" />
            )}
            {!isComplete && !isCurrent && (
              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <span
              className={cn(
                'text-sm',
                isComplete && 'text-muted-foreground',
                isCurrent && 'font-medium',
                !isComplete && !isCurrent && 'text-muted-foreground',
              )}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
