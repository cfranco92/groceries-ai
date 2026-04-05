'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  amount: number | null | undefined;
  currency?: string;
  variant?: 'standard' | 'large' | 'muted' | 'trend-up' | 'trend-down';
  className?: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const variantStyles: Record<string, string> = {
  standard: 'text-sm',
  large: 'text-lg font-semibold',
  muted: 'text-sm text-muted-foreground',
  'trend-up': 'text-sm text-destructive',
  'trend-down': 'text-sm text-green-600 dark:text-green-400',
};

const trendIcons: Record<string, React.ElementType> = {
  'trend-up': TrendingUp,
  'trend-down': TrendingDown,
};

export function PriceDisplay({
  amount,
  currency = 'USD',
  variant = 'standard',
  className,
}: PriceDisplayProps) {
  if (amount == null) {
    return (
      <span className={cn('text-muted-foreground', className)} aria-label="No price">
        &mdash;
      </span>
    );
  }

  const Icon = trendIcons[variant];

  return (
    <span className={cn('inline-flex items-center gap-1', variantStyles[variant], className)}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {!Icon && variant === 'muted' && <Minus className="h-3 w-3 hidden" />}
      {formatCurrency(amount, currency)}
    </span>
  );
}
