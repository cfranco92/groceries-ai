'use client';

import { useState } from 'react';
import { Plus, Receipt as ReceiptIcon, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/features/page-header';
import { EmptyState } from '@/components/features/empty-state';
import { ErrorState } from '@/components/features/error-state';
import { ReceiptCard } from '@/components/features/receipts/receipt-card';
import { FileUpload } from '@/components/features/receipts/file-upload';
import { ProcessingSteps } from '@/components/features/receipts/processing-steps';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useReceipts, useUploadReceipt } from '@/hooks/use-receipts';
import { useRouter } from 'next/navigation';

const statusTabs = [
  { value: 'ALL', label: 'All' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
];

export default function ReceiptsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [merchantName, setMerchantName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [uploadStep, setUploadStep] = useState(-1); // -1 = idle

  const uploadReceipt = useUploadReceipt();

  const {
    data: receiptsData,
    isLoading,
    isError,
    refetch,
  } = useReceipts({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const receipts = receiptsData?.data ?? [];

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStep(0);

    try {
      // Simulate step progression
      await new Promise((r) => setTimeout(r, 800));
      setUploadStep(1);
      await new Promise((r) => setTimeout(r, 600));
      setUploadStep(2);

      const result = await uploadReceipt.mutateAsync({
        file: selectedFile,
        merchantName: merchantName || undefined,
        purchaseDate: purchaseDate || undefined,
      });

      toast({ title: 'Receipt uploaded! Processing...' });
      setUploadOpen(false);
      resetUploadState();

      if (result?.id) {
        router.push(`/receipts/${result.id}`);
      }
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
      setUploadStep(-1);
    }
  };

  const resetUploadState = () => {
    setSelectedFile(null);
    setMerchantName('');
    setPurchaseDate('');
    setUploadStep(-1);
  };

  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader title="Receipts" />
        <Button
          onClick={() => {
            resetUploadState();
            setUploadOpen(true);
          }}
          size="sm"
          aria-label="Upload new receipt"
        >
          <Plus className="h-4 w-4 mr-1 md:mr-2" />
          <span className="hidden md:inline">Upload Receipt</span>
        </Button>
      </div>

      {/* Status filter tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Date range filter */}
      <Collapsible open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
            {(startDate || endDate) && (
              <span className="text-xs text-muted-foreground">
                ({startDate || '...'} - {endDate || '...'})
              </span>
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="date-from" className="text-xs">From</Label>
              <Input
                id="date-from"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="date-to" className="text-xs">To</Label>
              <Input
                id="date-to"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Processing receipts notification */}
      {receipts.some((r) => r.status === 'PROCESSING') && (
        <div className="sr-only" aria-live="polite">
          Some receipts are still processing
        </div>
      )}

      {/* Receipt list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3" aria-busy="true">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="Could not load receipts" onRetry={() => refetch()} />
        ) : receipts.length === 0 ? (
          statusFilter !== 'ALL' || startDate || endDate ? (
            <EmptyState
              icon={Search}
              title={`No ${statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} receipts`}
              description="Try adjusting your filters"
              actionLabel="Clear filters"
              onAction={handleClearFilters}
            />
          ) : (
            <EmptyState
              icon={ReceiptIcon}
              title="No receipts yet"
              description="Upload your first receipt to start tracking purchases"
              actionLabel="Upload Receipt"
              onAction={() => {
                resetUploadState();
                setUploadOpen(true);
              }}
            />
          )
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {receipts.map((receipt) => (
              <ReceiptCard key={receipt.id} receipt={receipt} />
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog
        open={uploadOpen}
        onOpenChange={(open) => {
          if (!open && uploadStep >= 0) return; // prevent close during upload
          setUploadOpen(open);
          if (!open) resetUploadState();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {uploadStep >= 0 ? 'Processing Receipt...' : 'Upload Receipt'}
            </DialogTitle>
          </DialogHeader>

          {uploadStep >= 0 ? (
            <div className="space-y-6 py-4">
              {selectedFile && (
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center">
                    <ReceiptIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              )}
              <Progress value={uploadStep >= 2 ? 100 : uploadStep >= 1 ? 66 : 33} />
              <ProcessingSteps currentStep={uploadStep} />
              <p className="text-center text-xs text-muted-foreground">
                This usually takes 10&ndash;15 seconds
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <FileUpload
                onFileSelect={setSelectedFile}
                onFileRemove={() => setSelectedFile(null)}
                selectedFile={selectedFile}
              />

              {selectedFile && (
                <>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Optional details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="upload-merchant" className="text-xs">Merchant name</Label>
                        <Input
                          id="upload-merchant"
                          value={merchantName}
                          onChange={(e) => setMerchantName(e.target.value)}
                          placeholder="Store name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="upload-date" className="text-xs">Purchase date</Label>
                        <Input
                          id="upload-date"
                          type="date"
                          value={purchaseDate}
                          onChange={(e) => setPurchaseDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleUpload}
                    disabled={uploadReceipt.isPending}
                  >
                    Upload Receipt
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
