'use client';

import { Separator } from '@/components/ui/separator';
import { PriceDisplay } from '@/components/ui/price-display';

interface ReceiptSummaryProps {
  subtotal: number | null;
  tax: number | null;
  total: number | null;
}

export function ReceiptSummary({ subtotal, tax, total }: ReceiptSummaryProps) {
  return (
    <div className="space-y-2 pt-4">
      <Separator />
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <PriceDisplay amount={subtotal} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <PriceDisplay amount={tax} />
        </div>
        <Separator />
        <div className="flex items-center justify-between text-base font-semibold pt-1">
          <span>Total</span>
          <PriceDisplay amount={total} variant="large" />
        </div>
      </div>
    </div>
  );
}
