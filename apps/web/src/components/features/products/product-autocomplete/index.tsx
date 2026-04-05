'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PriceDisplay } from '@/components/ui/price-display';
import { getCategoryIcon } from '@/components/features/products/category-chip';
import { useProducts, useCategories } from '@/hooks/use-products';
import { cn } from '@/lib/utils';
import type { Product } from '@groceries-ai/shared-types';

interface ProductAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
  onFreeTextSubmit?: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function ProductAutocomplete({
  value,
  onChange,
  onProductSelect,
  onFreeTextSubmit,
  placeholder = 'Add an item...',
  autoFocus,
  className,
}: ProductAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useCategories();
  const categoryMap = new Map(categories?.map((c) => [c.id, c]) ?? []);

  // Debounce search query
  useEffect(() => {
    if (value.length < 2) {
      setDebouncedSearch('');
      return;
    }
    const timer = setTimeout(() => setDebouncedSearch(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const { data: productsData, isLoading } = useProducts(
    { search: debouncedSearch, limit: 5 },
    { enabled: debouncedSearch.length >= 2 },
  );

  const products = useMemo(() => productsData?.data ?? [], [productsData?.data]);

  useEffect(() => {
    if (value.length >= 2 && (products.length > 0 || debouncedSearch.length >= 2)) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setActiveIndex(-1);
  }, [products, value.length, debouncedSearch.length]);

  const handleSelect = useCallback(
    (product: Product) => {
      onProductSelect(product);
      onChange('');
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [onProductSelect, onChange],
  );

  const handleFreeText = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onFreeTextSubmit?.(trimmed);
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  }, [value, onFreeTextSubmit, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleFreeText();
      }
      return;
    }

    const totalOptions = products.length + 1; // +1 for free text option

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % totalOptions);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < products.length && products[activeIndex]) {
          handleSelect(products[activeIndex]);
        } else {
          handleFreeText();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.length >= 2 && (products.length > 0 || debouncedSearch.length >= 2)) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            // Delay close to allow click on suggestion
            setTimeout(() => setIsOpen(false), 200);
          }}
          placeholder={placeholder}
          className="pl-9 pr-9"
          autoFocus={autoFocus}
          aria-label="Search products"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="product-suggestions"
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && (
        <div
          id="product-suggestions"
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg"
        >
          {products.map((product, index) => {
            const cat = categoryMap.get(product.categoryId);
            const CatIcon = getCategoryIcon(cat?.icon);
            return (
              <button
                key={product.id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(product)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors min-h-[48px]',
                  index === activeIndex ? 'bg-muted' : 'hover:bg-muted/50',
                )}
              >
                <CatIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {cat?.name ?? 'Uncategorized'} &middot; {product.defaultUnit}
                  </p>
                </div>
                {product.avgPrice != null && (
                  <PriceDisplay amount={product.avgPrice} variant="muted" className="text-xs shrink-0" />
                )}
              </button>
            );
          })}

          {!isLoading && products.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">No matching products</div>
          )}

          <div className="border-t">
            <button
              type="button"
              role="option"
              aria-selected={activeIndex === products.length}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleFreeText}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors min-h-[48px]',
                activeIndex === products.length ? 'bg-muted' : 'hover:bg-muted/50',
              )}
            >
              Add &ldquo;{value}&rdquo; as new item
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
