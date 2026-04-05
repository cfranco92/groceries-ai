'use client';

import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReceiptStatus } from '@groceries-ai/shared-types';

interface StatusBadgeProps {
  status: ReceiptStatus;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-muted text-muted-foreground',
  },
  PROCESSING: {
    label: 'Processing',
    icon: Loader2,
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig['PENDING']!;
  const Icon = config!.icon;
  const label = config!.label;
  const statusClassName = config!.className;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        statusClassName,
        className,
      )}
      aria-label={`Status: ${label}`}
    >
      <Icon
        className={cn(
          'h-3 w-3',
          status === 'PROCESSING' && 'animate-spin motion-reduce:animate-none',
        )}
      />
      {label}
    </span>
  );
}
