'use client';

import Link from 'next/link';
import { Receipt as ReceiptIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriceDisplay } from '@/components/ui/price-display';
import type { Receipt } from '@groceries-ai/shared-types';
import { cn } from '@/lib/utils';

interface ReceiptCardProps {
  receipt: Receipt & { itemCount?: number };
}

export function ReceiptCard({ receipt }: ReceiptCardProps) {
  const merchantName = receipt.merchantName ?? 'Unknown Merchant';
  const dateStr = receipt.purchaseDate
    ? new Date(receipt.purchaseDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(receipt.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <Link href={`/receipts/${receipt.id}`}>
      <Card
        className="flex items-center gap-3 p-3 transition-colors hover:bg-accent/50"
        role="article"
        aria-label={`${merchantName}, ${dateStr}, ${receipt.status}`}
      >
        {receipt.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element -- external GCS receipt image URL */
          <img
            src={receipt.imageUrl}
            alt={`Receipt from ${merchantName}`}
            className="h-16 w-16 shrink-0 rounded-md object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div
          className={cn(
            'flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted',
            receipt.imageUrl && 'hidden',
          )}
        >
          <ReceiptIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium truncate">{merchantName}</p>
          <p className="text-sm text-muted-foreground">{dateStr}</p>
          {receipt.status === 'COMPLETED' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PriceDisplay amount={receipt.total} variant="muted" />
              {receipt.itemCount != null && (
                <>
                  <span>&middot;</span>
                  <span>{receipt.itemCount} items</span>
                </>
              )}
            </div>
          )}
          {receipt.status === 'PROCESSING' && (
            <p className="text-sm text-amber-600 dark:text-amber-400">Processing...</p>
          )}
        </div>
        <StatusBadge status={receipt.status} className="shrink-0" />
      </Card>
    </Link>
  );
}
