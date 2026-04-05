'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  Pencil,
  Plus,
  Receipt,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PriceDisplay } from '@/components/ui/price-display';
import { getCategoryIcon } from '@/components/features/products/category-chip';
import { ErrorState } from '@/components/features/error-state';
import { useToast } from '@/components/ui/use-toast';
import {
  useProduct,
  useUpdateProduct,
  useCategories,
  useProductPurchaseHistory,
} from '@/hooks/use-products';
import { useLists, useAddItem } from '@/hooks/use-lists';
import { UnitType } from '@groceries-ai/shared-types';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { toast } = useToast();

  const { data: product, isLoading, isError, refetch } = useProduct(productId);
  const { data: categories } = useCategories();
  const { data: history } = useProductPurchaseHistory(productId);
  const { data: lists } = useLists('ACTIVE');
  const updateProduct = useUpdateProduct();
  const addItem = useAddItem();

  const [editOpen, setEditOpen] = useState(false);
  const [addToListOpen, setAddToListOpen] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editUnit, setEditUnit] = useState('UNIT');
  const [selectedListId, setSelectedListId] = useState('');
  const [addQuantity, setAddQuantity] = useState('1');
  const [addUnit, setAddUnit] = useState('UNIT');

  const categoryMap = useMemo(
    () => new Map(categories?.map((c) => [c.id, c]) ?? []),
    [categories],
  );

  const category = product ? categoryMap.get(product.categoryId) : undefined;
  const CatIcon = getCategoryIcon(category?.icon);

  // Price trend calculation
  const priceTrend = useMemo(() => {
    if (!history || history.length < 2) return null;
    const latest = history[0]!;
    const previous = history[1]!;
    const diff = latest.price - previous.price;
    const epsilon = 0.000001;

    if (Math.abs(previous.price) < epsilon) {
      if (Math.abs(diff) < epsilon) return 'stable';
      return diff > 0 ? 'up' : 'down';
    }

    const pctChange = Math.abs(diff / previous.price) * 100;
    if (pctChange < 5) return 'stable';
    return diff > 0 ? 'up' : 'down';
  }, [history]);

  const displayHistory = showAllHistory ? history : history?.slice(0, 5);

  const handleOpenEdit = () => {
    if (!product) return;
    setEditName(product.name);
    setEditCategoryId(product.categoryId);
    setEditUnit(product.defaultUnit);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!product) return;
    try {
      await updateProduct.mutateAsync({
        id: product.id,
        name: editName.trim(),
        categoryId: editCategoryId,
        defaultUnit: editUnit,
      });
      setEditOpen(false);
      toast({ title: 'Product updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update product.', variant: 'destructive' });
    }
  };

  const handleAddToList = async () => {
    if (!product || !selectedListId) return;
    try {
      await addItem.mutateAsync({
        listId: selectedListId,
        name: product.name,
        quantity: parseFloat(addQuantity) || 1,
        unit: addUnit,
      });
      setAddToListOpen(false);
      const list = lists?.find((l) => l.id === selectedListId);
      toast({ title: `Added to ${list?.name ?? 'list'}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to add item.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/products">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Products
          </Link>
        </Button>
        <div className="space-y-4" aria-busy="true">
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </Card>
          <Card className="p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-32" />
          </Card>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/products">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Products
          </Link>
        </Button>
        <ErrorState message="Could not load product details" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/products" aria-label="Back to Products">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Products
        </Link>
      </Button>

      {/* Product Header Card */}
      <Card className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
            <CatIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h1 className="text-xl font-semibold">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{category?.name ?? 'Uncategorized'}</Badge>
              <span className="text-sm text-muted-foreground">{product.defaultUnit}</span>
            </div>
            <PriceDisplay amount={product.avgPrice} variant="large" />
            <p className="text-sm text-muted-foreground">
              Purchased {product.purchaseCount} times
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleOpenEdit}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Price Trend */}
        <Card className="p-4 space-y-2">
          <h2 className="text-lg font-semibold">Price Trend</h2>
          {history && history.length >= 2 ? (
            <div className="flex items-center gap-2">
              {priceTrend === 'up' && (
                <>
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  <PriceDisplay amount={history[0]!.price} variant="trend-up" />
                  <span className="text-xs text-muted-foreground">Up from last purchase</span>
                </>
              )}
              {priceTrend === 'down' && (
                <>
                  <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <PriceDisplay amount={history[0]!.price} variant="trend-down" />
                  <span className="text-xs text-muted-foreground">Down from last purchase</span>
                </>
              )}
              {priceTrend === 'stable' && (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <PriceDisplay amount={history[0]!.price} />
                  <span className="text-xs text-muted-foreground">Stable</span>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not enough data yet</p>
          )}
        </Card>

        {/* Purchase History */}
        <Card className="p-4 space-y-3">
          <h2 className="text-lg font-semibold">Purchase History</h2>
          {!history || history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No purchases recorded yet</p>
          ) : (
            <ul className="space-y-2">
              {displayHistory?.map((entry, index) => {
                const prevPrice = history[index + 1]?.price;
                const priceVariant =
                  prevPrice != null
                    ? entry.price > prevPrice
                      ? 'trend-up'
                      : entry.price < prevPrice
                        ? 'trend-down'
                        : ('standard' as const)
                    : ('standard' as const);

                return (
                  <li
                    key={`${entry.date}-${index}`}
                    className="flex items-center gap-3"
                    aria-label={`${new Date(entry.date).toLocaleDateString()}: purchased at $${entry.price.toFixed(2)}`}
                  >
                    <span className="text-sm font-medium w-24 shrink-0">
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <PriceDisplay
                      amount={entry.price}
                      variant={priceVariant}
                    />
                    {entry.quantity > 1 && (
                      <span className="text-xs text-muted-foreground">
                        &times;{entry.quantity}
                      </span>
                    )}
                    <div className="flex-1" />
                    <Link href={`/receipts/${entry.receiptId}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="View receipt">
                        <Receipt className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {history && history.length > 5 && !showAllHistory && (
            <Button variant="ghost" size="sm" onClick={() => setShowAllHistory(true)}>
              Show all {history.length} purchases
            </Button>
          )}
        </Card>
      </div>

      {/* Add to List Button */}
      <Button
        className="w-full"
        onClick={() => {
          setAddUnit(product.defaultUnit);
          setAddQuantity('1');
          setSelectedListId(lists?.[0]?.id ?? '');
          setAddToListOpen(true);
        }}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add to List
      </Button>

      {/* Edit Product Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-product-name">Name</Label>
              <Input
                id="edit-product-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-category">Category</Label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                <SelectTrigger id="edit-product-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-unit">Default Unit</Label>
              <Select value={editUnit} onValueChange={setEditUnit}>
                <SelectTrigger id="edit-product-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UnitType).map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!editName.trim() || updateProduct.isPending}>
                {updateProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add to List Dialog */}
      <Dialog open={addToListOpen} onOpenChange={setAddToListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to List</DialogTitle>
            <DialogDescription>{product.name}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddToList();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Select list</Label>
              <div className="space-y-2">
                {lists?.map((list) => (
                  <label
                    key={list.id}
                    className={cn(
                      'flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors',
                      selectedListId === list.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted',
                    )}
                  >
                    <input
                      type="radio"
                      name="list"
                      value={list.id}
                      checked={selectedListId === list.id}
                      onChange={() => setSelectedListId(list.id)}
                      className="sr-only"
                    />
                    <span className={cn('text-sm', selectedListId === list.id && 'font-medium')}>
                      {list.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-quantity">Quantity</Label>
                <Input
                  id="add-quantity"
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-unit">Unit</Label>
                <Select value={addUnit} onValueChange={setAddUnit}>
                  <SelectTrigger id="add-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UnitType).map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={!selectedListId || addItem.isPending}
              >
                {addItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add to List
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
