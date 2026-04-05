'use client';

import { Pencil, AlertCircle, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PriceDisplay } from '@/components/ui/price-display';
import { getCategoryIcon } from '@/components/features/products/category-chip';
import { cn } from '@/lib/utils';
import type { ReceiptItem, Product, Category } from '@groceries-ai/shared-types';

interface ReceiptItemRowProps {
  item: ReceiptItem;
  product?: Product | null;
  category?: Category | null;
  onEdit: (item: ReceiptItem) => void;
}

export function ReceiptItemRow({ item, product, category, onEdit }: ReceiptItemRowProps) {
  const isUnmatched = !item.productId;
  const CatIcon = getCategoryIcon(category?.icon);

  return (
    <Card
      className={cn(
        'flex items-center gap-3 p-3',
        isUnmatched && 'border-amber-300/50 bg-amber-50/50 dark:border-amber-700/50 dark:bg-amber-950/20',
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isUnmatched && <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />}
          <span className="text-sm font-medium truncate">{item.name}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            &times;{item.quantity}
          </span>
        </div>

        {product ? (
          <div className="flex items-center gap-1.5 mt-0.5">
            <CatIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <Link2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">{product.name}</span>
          </div>
        ) : (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Not linked to a product</p>
        )}
      </div>

      <div className="text-right shrink-0">
        <PriceDisplay amount={item.totalPrice} variant="standard" className="text-sm" />
        {item.quantity > 1 && (
          <p className="text-xs text-muted-foreground">
            <PriceDisplay amount={item.unitPrice} variant="muted" className="text-xs" />
            /unit
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-8 w-8"
        onClick={() => onEdit(item)}
        aria-label={`Edit ${item.name}`}
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </Card>
  );
}
