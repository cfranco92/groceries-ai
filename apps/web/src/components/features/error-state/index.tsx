'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
      role="alert"
    >
      <AlertCircle className="h-12 w-12 text-destructive/50 mb-4" />
      <h3 className="text-lg font-semibold">Error</h3>
      <p className="text-sm text-muted-foreground mt-1">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-4">
          Retry
        </Button>
      )}
    </div>
  );
}
