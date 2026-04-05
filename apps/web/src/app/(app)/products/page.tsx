'use client';

import { useState, useMemo } from 'react';
import { Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/features/page-header';
import { EmptyState } from '@/components/features/empty-state';
import { ErrorState } from '@/components/features/error-state';
import { CategoryChip } from '@/components/features/products/category-chip';
import { ProductCard } from '@/components/features/products/product-card';
import { useProducts, useCategories } from '@/hooks/use-products';

type SortOption = 'mostPurchased' | 'alphabetical' | 'recentlyPurchased';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<SortOption>('mostPurchased');
  const [page, setPage] = useState(1);

  const { data: categories } = useCategories();
  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useProducts({
    search: search || undefined,
    categoryId,
    sortBy,
    page,
    limit: 10,
  });

  const categoryMap = useMemo(
    () => new Map(categories?.map((c) => [c.id, c]) ?? []),
    [categories],
  );

  const products = productsData?.data ?? [];
  const meta = productsData?.meta;

  const handleClearFilter = () => {
    setSearch('');
    setCategoryId(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader title="Products" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchOpen(!searchOpen)}
          aria-label="Search products"
          className="md:hidden"
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Search bar */}
      <div className={searchOpen ? 'block' : 'hidden md:block'}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            className="pl-9"
            aria-label="Search products"
            aria-controls="product-list"
          />
        </div>
      </div>

      {/* Category filter chips */}
      {categories && categories.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          role="radiogroup"
          aria-label="Filter by category"
        >
          <CategoryChip
            category={{ id: '', name: 'All', icon: null }}
            isActive={!categoryId}
            onClick={() => {
              setCategoryId(undefined);
              setPage(1);
            }}
          />
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              category={cat}
              isActive={categoryId === cat.id}
              onClick={() => {
                setCategoryId(cat.id === categoryId ? undefined : cat.id);
                setPage(1);
              }}
            />
          ))}
        </div>
      )}

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort:</span>
        <Select
          value={sortBy}
          onValueChange={(val) => {
            setSortBy(val as SortOption);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[200px]" aria-label="Sort products by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mostPurchased">Most Purchased</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
            <SelectItem value="recentlyPurchased">Recently Purchased</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count for screen readers */}
      {search && products.length > 0 && (
        <div className="sr-only" aria-live="polite">
          Showing {products.length} results for &quot;{search}&quot;
        </div>
      )}

      {/* Product list */}
      <div id="product-list" className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3" aria-busy="true">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            message="Could not load products"
            onRetry={() => refetch()}
          />
        ) : products.length === 0 ? (
          search || categoryId ? (
            <EmptyState
              icon={Search}
              title="No products found"
              description={search ? `No results for "${search}"` : 'No products in this category'}
              actionLabel="Clear filter"
              onAction={handleClearFilter}
            />
          ) : (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Products appear here as you upload receipts and add items to your lists"
            />
          )
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={categoryMap.get(product.categoryId)}
                />
              ))}
            </div>

            {meta?.hasNextPage && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPage((p) => p + 1)}
              >
                Load more
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
