'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronDown,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Pencil,
  Loader2,
  Plus,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { Alert } from '@/components/ui/alert';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriceDisplay } from '@/components/ui/price-display';
import { ImageViewer } from '@/components/features/receipts/image-viewer';
import { ReceiptItemRow } from '@/components/features/receipts/receipt-item-row';
import { ReceiptSummary } from '@/components/features/receipts/receipt-summary';
import { ErrorState } from '@/components/features/error-state';
import { useToast } from '@/components/ui/use-toast';
import {
  useReceipt,
  useUpdateReceiptItem,
  useDeleteReceipt,
} from '@/hooks/use-receipts';
import { useProducts, useCategories } from '@/hooks/use-products';
import { UnitType } from '@groceries-ai/shared-types';
import type { ReceiptItem } from '@groceries-ai/shared-types';
import { cn } from '@/lib/utils';

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const receiptId = params.id as string;

  const { data: receipt, isLoading, isError, refetch } = useReceipt(receiptId);
  const { data: categories } = useCategories();
  const updateReceiptItem = useUpdateReceiptItem();
  const deleteReceipt = useDeleteReceipt();

  const [imageOpen, setImageOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReceiptItem | null>(null);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Correction form state
  const [corrName, setCorrName] = useState('');
  const [corrQuantity, setCorrQuantity] = useState('1');
  const [corrUnitPrice, setCorrUnitPrice] = useState('0');
  const [corrTotalPrice, setCorrTotalPrice] = useState('0');
  const [corrProductSearch, setCorrProductSearch] = useState('');

  const { data: searchResults } = useProducts(
    { search: corrProductSearch, limit: 5 },
    { enabled: corrProductSearch.length >= 2 },
  );
  const [corrProductId, setCorrProductId] = useState<string | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories?.map((c) => [c.id, c]) ?? []),
    [categories],
  );

  // Simple product map from items that have productId
  const productMap = useMemo(() => {
    const map = new Map<string, { name: string; categoryId: string }>();
    if (!receipt?.items) return map;
    for (const item of receipt.items) {
      if (item.productId) {
        // In real app we'd have product data from API; using item name as placeholder
        map.set(item.productId, { name: item.name, categoryId: '' });
      }
    }
    return map;
  }, [receipt?.items]);

  const handleEditItem = (item: ReceiptItem) => {
    setEditingItem(item);
    setCorrName(item.name);
    setCorrQuantity(String(item.quantity));
    setCorrUnitPrice(String(item.unitPrice));
    setCorrTotalPrice(String(item.totalPrice));
    setCorrProductId(item.productId);
    setCorrProductSearch('');
    setCorrectionOpen(true);
  };

  const handleSaveCorrection = async () => {
    if (!editingItem) return;
    try {
      await updateReceiptItem.mutateAsync({
        receiptId,
        itemId: editingItem.id,
        name: corrName.trim(),
        quantity: parseFloat(corrQuantity) || 1,
        unitPrice: parseFloat(corrUnitPrice) || 0,
        totalPrice: parseFloat(corrTotalPrice) || 0,
        productId: corrProductId ?? undefined,
      });
      setCorrectionOpen(false);
      toast({ title: 'Item updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update item.', variant: 'destructive' });
    }
  };

  const handleDeleteReceipt = async () => {
    try {
      await deleteReceipt.mutateAsync(receiptId);
      toast({ title: 'Receipt deleted' });
      router.push('/receipts');
    } catch {
      toast({ title: 'Error', description: 'Failed to delete receipt.', variant: 'destructive' });
    }
  };

  // Auto-calculate total when qty/unit price change
  const handleQuantityChange = (val: string) => {
    setCorrQuantity(val);
    const qty = parseFloat(val) || 0;
    const unit = parseFloat(corrUnitPrice) || 0;
    setCorrTotalPrice((qty * unit).toFixed(2));
  };

  const handleUnitPriceChange = (val: string) => {
    setCorrUnitPrice(val);
    const qty = parseFloat(corrQuantity) || 0;
    const unit = parseFloat(val) || 0;
    setCorrTotalPrice((qty * unit).toFixed(2));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/receipts"><ChevronLeft className="h-4 w-4 mr-1" />Receipts</Link>
        </Button>
        <div className="space-y-4" aria-busy="true">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-48 w-full rounded-lg" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
              <Skeleton className="h-4 w-32 flex-1" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !receipt) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/receipts"><ChevronLeft className="h-4 w-4 mr-1" />Receipts</Link>
        </Button>
        <ErrorState message="Could not load receipt details" onRetry={() => refetch()} />
      </div>
    );
  }

  const merchantName = receipt.merchantName ?? 'Unknown Merchant';
  const dateStr = receipt.purchaseDate
    ? new Date(receipt.purchaseDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/receipts" aria-label="Back to Receipts">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Receipts
        </Link>
      </Button>

      {/* Receipt header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{merchantName}</h1>
          <div className="flex items-center gap-2 mt-1">
            {dateStr && <span className="text-sm text-muted-foreground">{dateStr}</span>}
            <StatusBadge status={receipt.status} />
          </div>
        </div>
      </div>

      {/* FAILED state */}
      {receipt.status === 'FAILED' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <div className="ml-2 space-y-2">
            <p className="text-sm font-medium">Processing Failed</p>
            <p className="text-sm">
              Could not extract text from image. Please upload a clearer photo.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Retry Processing
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete Receipt
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* PROCESSING state */}
      {receipt.status === 'PROCESSING' && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500 motion-reduce:animate-none" />
            <p className="text-sm">Still processing... Check back in a moment.</p>
          </div>
        </Card>
      )}

      {/* Desktop: Split view / Mobile: Stacked */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Image panel */}
        {receipt.imageUrl && (
          <>
            {/* Desktop: sticky image panel */}
            <div className="hidden md:block">
              <div className="sticky top-4">
                <ImageViewer
                  src={receipt.imageUrl}
                  alt={`Receipt image from ${merchantName} on ${dateStr}`}
                  className="h-[500px]"
                />
              </div>
            </div>

            {/* Mobile: Collapsible image */}
            <div className="md:hidden">
              <Collapsible open={imageOpen} onOpenChange={setImageOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {imageOpen ? 'Hide receipt image' : 'View receipt image'}
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        !imageOpen && '-rotate-90',
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <ImageViewer
                    src={receipt.imageUrl}
                    alt={`Receipt image from ${merchantName} on ${dateStr}`}
                    className="h-[300px]"
                  />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </>
        )}

        {/* Data panel */}
        <div className={cn('space-y-4', !receipt.imageUrl && 'md:col-span-2')}>
          {/* Items */}
          {receipt.status === 'COMPLETED' && receipt.items.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">
                Items ({receipt.items.length})
              </h2>
              {receipt.items.map((item) => {
                const prod = item.productId ? productMap.get(item.productId) : null;
                const cat = prod?.categoryId ? categoryMap.get(prod.categoryId) : null;
                return (
                  <ReceiptItemRow
                    key={item.id}
                    item={item}
                    product={prod ? { ...prod, id: item.productId!, householdId: 'h1', defaultUnit: UnitType.UNIT, avgPrice: null, lastPurchasedAt: null, purchaseCount: 0, avgDaysBetweenPurchases: null, createdAt: '', updatedAt: '' } : null}
                    category={cat}
                    onEdit={handleEditItem}
                  />
                );
              })}

              <ReceiptSummary
                subtotal={receipt.subtotal}
                tax={receipt.tax}
                total={receipt.total}
              />
            </div>
          )}

          {receipt.status === 'COMPLETED' && receipt.items.length === 0 && (
            <p className="text-sm text-muted-foreground">No items were extracted from this receipt.</p>
          )}
        </div>
      </div>

      {/* Item Correction Dialog */}
      <Dialog open={correctionOpen} onOpenChange={setCorrectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Correct OCR errors for this item.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCorrection();
              }}
              className="space-y-4"
            >
              {/* Original OCR value */}
              <div className="rounded-md bg-muted px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Original OCR:</span>{' '}
                  <span className="italic">&ldquo;{editingItem.name}&rdquo;</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="corr-name">Name</Label>
                <Input
                  id="corr-name"
                  value={corrName}
                  onChange={(e) => setCorrName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="corr-quantity">Quantity</Label>
                  <Input
                    id="corr-quantity"
                    type="number"
                    min={0.01}
                    step={0.01}
                    inputMode="decimal"
                    value={corrQuantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corr-unitprice">Unit Price</Label>
                  <Input
                    id="corr-unitprice"
                    type="number"
                    min={0.01}
                    step={0.01}
                    inputMode="decimal"
                    value={corrUnitPrice}
                    onChange={(e) => handleUnitPriceChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="corr-totalprice">Total Price</Label>
                <Input
                  id="corr-totalprice"
                  type="number"
                  min={0}
                  step={0.01}
                  inputMode="decimal"
                  value={corrTotalPrice}
                  onChange={(e) => setCorrTotalPrice(e.target.value)}
                  aria-live="polite"
                />
              </div>

              {/* Product linking */}
              <div className="space-y-2">
                <Label>Link to product</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={corrProductSearch}
                    onChange={(e) => setCorrProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="pl-9"
                  />
                </div>
                {corrProductSearch.length >= 2 && searchResults?.data && (
                  <div className="rounded-md border max-h-40 overflow-y-auto">
                    {searchResults.data.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setCorrProductId(p.id);
                          setCorrProductSearch(p.name);
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted',
                          corrProductId === p.id && 'bg-primary/5',
                        )}
                      >
                        {p.name}
                        {p.avgPrice != null && (
                          <PriceDisplay amount={p.avgPrice} variant="muted" className="text-xs ml-auto" />
                        )}
                      </button>
                    ))}
                    {searchResults.data.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">No products found</div>
                    )}
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary hover:bg-muted border-t"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create new product
                    </button>
                  </div>
                )}
                {corrProductId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCorrProductId(null);
                      setCorrProductSearch('');
                    }}
                  >
                    Clear product link
                  </Button>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setCorrectionOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!corrName.trim() || updateReceiptItem.isPending}>
                  {updateReceiptItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this receipt?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReceipt}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
