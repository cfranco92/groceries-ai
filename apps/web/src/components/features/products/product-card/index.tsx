'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { PriceDisplay } from '@/components/ui/price-display';
import { getCategoryIcon } from '@/components/features/products/category-chip';
import type { Product, Category } from '@groceries-ai/shared-types';

interface ProductCardProps {
  product: Product;
  category?: Category;
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return 'Not yet purchased';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ProductCard({ product, category }: ProductCardProps) {
  const Icon = getCategoryIcon(category?.icon);

  return (
    <Link href={`/products/${product.id}`}>
      <Card
        className="flex items-center gap-3 p-3 transition-colors hover:bg-accent/50"
        role="article"
        aria-label={`${product.name}, ${category?.name ?? 'Uncategorized'}`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground">{category?.name ?? 'Uncategorized'}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PriceDisplay amount={product.avgPrice} variant="muted" />
            <span className="text-xs">avg</span>
            <span className="text-xs">&middot;</span>
            <span className="text-xs">
              Purchased {product.purchaseCount}&times;
            </span>
            <span className="text-xs">&middot;</span>
            <span className="text-xs">{formatRelativeDate(product.lastPurchasedAt)}</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Card>
    </Link>
  );
}
