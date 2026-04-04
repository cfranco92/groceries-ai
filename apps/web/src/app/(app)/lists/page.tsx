'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/features/page-header';
import { LoadingSkeleton } from '@/components/features/loading-skeleton';
import { EmptyState } from '@/components/features/empty-state';
import { ErrorState } from '@/components/features/error-state';
import { useToast } from '@/components/ui/use-toast';
import { useListsStore } from '@/stores/lists-store';
import { useLists, useCreateList } from '@/hooks/use-lists';
import { cn } from '@/lib/utils';

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ListsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { selectedFilter, setFilter, createDialogOpen, setCreateDialogOpen } =
    useListsStore();
  const { data: lists, isLoading, isError, refetch } = useLists(selectedFilter);
  const createList = useCreateList();
  const [newListName, setNewListName] = useState('');

  const handleCreateList = async () => {
    const trimmedName = newListName.trim();
    if (!trimmedName) return;

    try {
      const result = await createList.mutateAsync(trimmedName);
      setCreateDialogOpen(false);
      setNewListName('');
      toast({ title: 'List created', description: `"${trimmedName}" is ready to use.` });
      router.push(`/lists/${result.id}`);
    } catch {
      toast({ title: 'Error', description: 'Failed to create list. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Lists"
        actions={
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="icon"
            className="md:w-auto md:px-4"
            aria-label="Create new list"
          >
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="sr-only md:not-sr-only">New List</span>
          </Button>
        }
      />

      <Tabs
        value={selectedFilter}
        onValueChange={(value) =>
          setFilter(value as 'ALL' | 'ACTIVE' | 'COMPLETED')
        }
      >
        <TabsList>
          <TabsTrigger value="ACTIVE">Active</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="ALL">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && <LoadingSkeleton variant="list-cards" />}

      {isError && (
        <ErrorState
          message="Failed to load your lists."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && lists && lists.length === 0 && (
        <EmptyState
          icon={ShoppingCart}
          title="No lists yet"
          description="Create your first shopping list to get started."
          actionLabel="Create a list"
          onAction={() => setCreateDialogOpen(true)}
        />
      )}

      {!isLoading && !isError && lists && lists.length > 0 && (
        <div className="space-y-3">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className={cn(
                'flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50',
                list.status === 'COMPLETED' && 'opacity-60',
              )}
            >
              <ShoppingCart className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{list.name}</p>
                <p className="text-sm text-muted-foreground">
                  {list.checkedCount}/{list.itemCount} items
                  {' \u00b7 '}
                  {list.createdByName}
                  {' \u00b7 '}
                  {formatRelativeDate(list.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new list</DialogTitle>
            <DialogDescription>
              Give your shopping list a name to get started.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateList();
            }}
          >
            <Input
              placeholder="e.g. Weekly Groceries"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              autoFocus
              aria-label="List name"
            />
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCreateDialogOpen(false);
                  setNewListName('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newListName.trim() || createList.isPending}
              >
                {createList.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
