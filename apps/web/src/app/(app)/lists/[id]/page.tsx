'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronDown,
  MoreVertical,
  Plus,
  GripVertical,
  Pencil,
  CheckCheck,
  Archive,
  Trash2,
  StickyNote,
  Loader2,
  ShoppingCart,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
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
import { LoadingSkeleton } from '@/components/features/loading-skeleton';
import { EmptyState } from '@/components/features/empty-state';
import { ErrorState } from '@/components/features/error-state';
import { useToast } from '@/components/ui/use-toast';
import {
  useList,
  useUpdateList,
  useDeleteList,
  useAddItem,
  useUpdateItem,
  useDeleteItem,
  useReorderItems,
} from '@/hooks/use-lists';
import { UnitType, ListStatus } from '@groceries-ai/shared-types';
import type { ListItem } from '@groceries-ai/shared-types';
import { cn } from '@/lib/utils';

// ─── Sortable Item ──────────────────────────────────────

interface SortableItemRowProps {
  item: ListItem;
  onToggle: (item: ListItem) => void;
  onEdit: (item: ListItem) => void;
}

function SortableItemRow({ item, onToggle, onEdit }: SortableItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-md px-2 py-3 hover:bg-accent/50 transition-colors',
        isDragging && 'opacity-50',
      )}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground"
        aria-label={`Drag to reorder ${item.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Checkbox
        checked={item.isChecked}
        onCheckedChange={() => onToggle(item)}
        aria-label={`Mark ${item.name} as ${item.isChecked ? 'unchecked' : 'checked'}`}
      />
      <button
        type="button"
        className="flex flex-1 items-center gap-2 min-w-0 text-left"
        onClick={() => onEdit(item)}
        aria-label={`Edit ${item.name}`}
      >
        <span className="truncate flex-1">{item.name}</span>
        {'notes' in item && (item as ListItem & { notes?: string }).notes && (
          <StickyNote className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
      </button>
      <span className="shrink-0 text-sm text-muted-foreground">
        {item.quantity} {item.unit.toLowerCase()}
      </span>
    </div>
  );
}

// ─── Checked Item Row ───────────────────────────────────

interface CheckedItemRowProps {
  item: ListItem;
  onToggle: (item: ListItem) => void;
  onEdit: (item: ListItem) => void;
}

function CheckedItemRow({ item, onToggle, onEdit }: CheckedItemRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-3 opacity-60">
      <div className="w-4 shrink-0" />
      <Checkbox
        checked={item.isChecked}
        onCheckedChange={() => onToggle(item)}
        aria-label={`Mark ${item.name} as unchecked`}
      />
      <button
        type="button"
        className="flex flex-1 items-center gap-2 min-w-0 text-left"
        onClick={() => onEdit(item)}
        aria-label={`Edit ${item.name}`}
      >
        <span className="truncate flex-1 line-through">{item.name}</span>
      </button>
      <span className="shrink-0 text-sm text-muted-foreground line-through">
        {item.quantity} {item.unit.toLowerCase()}
      </span>
    </div>
  );
}

// ─── Edit Item Dialog ───────────────────────────────────

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ListItem | null;
  listId: string;
}

function EditItemDialog({
  open,
  onOpenChange,
  item,
  listId,
}: EditItemDialogProps) {
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState<string>('UNIT');
  const [notes, setNotes] = useState('');

  // Sync form when item changes
  const prevItemId = useRef<string | null>(null);
  if (item && item.id !== prevItemId.current) {
    prevItemId.current = item.id;
    setName(item.name);
    setQuantity(String(item.quantity));
    setUnit(item.unit);
    setNotes((item as ListItem & { notes?: string }).notes || '');
  }

  if (!item) {
    if (prevItemId.current !== null) {
      prevItemId.current = null;
    }
  }

  const handleSave = async () => {
    if (!item) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      await updateItem.mutateAsync({
        listId,
        itemId: item.id,
        name: trimmedName,
        quantity: parseFloat(quantity) || 1,
        unit,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
      toast({ title: 'Item updated' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update item.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      await deleteItem.mutateAsync({ listId, itemId: item.id });
      onOpenChange(false);
      toast({ title: 'Item deleted' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete item.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update the item details below.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-item-name">Name</Label>
            <Input
              id="edit-item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item-quantity">Quantity</Label>
              <Input
                id="edit-item-quantity"
                type="number"
                min={0.01}
                step={0.01}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-item-unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="edit-item-unit">
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
          <div className="space-y-2">
            <Label htmlFor="edit-item-notes">Notes (optional)</Label>
            <Textarea
              id="edit-item-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any extra details..."
              rows={2}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteItem.isPending}
            >
              {deleteItem.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || updateItem.isPending}
            >
              {updateItem.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────────────────────

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const listId = params.id as string;

  const { data: list, isLoading, isError, refetch } = useList(listId);
  const updateList = useUpdateList();
  const deleteList = useDeleteList();
  const addItem = useAddItem();
  const updateItem = useUpdateItem();
  const reorderItems = useReorderItems();

  const [quickAddValue, setQuickAddValue] = useState('');
  const [checkedOpen, setCheckedOpen] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Local items state for optimistic drag reorder and checkbox toggle
  const [localItems, setLocalItems] = useState<ListItem[] | null>(null);

  const quickAddRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => {
    return localItems ?? list?.items ?? [];
  }, [localItems, list?.items]);

  // Reset local items when server data changes
  const lastServerItems = useRef<ListItem[] | undefined>(undefined);
  if (list?.items && list.items !== lastServerItems.current) {
    lastServerItems.current = list.items;
    if (localItems !== null) {
      setLocalItems(null);
    }
  }

  const uncheckedItems = useMemo(
    () => items.filter((item) => !item.isChecked),
    [items],
  );
  const checkedItems = useMemo(
    () => items.filter((item) => item.isChecked),
    [items],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = uncheckedItems.findIndex((i) => i.id === active.id);
      const newIndex = uncheckedItems.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(uncheckedItems, oldIndex, newIndex);
      setLocalItems([...reordered, ...checkedItems]);
      reorderItems.mutate({
        listId,
        itemIds: reordered.map((i) => i.id),
      });
    },
    [uncheckedItems, checkedItems, listId, reorderItems],
  );

  const handleToggleItem = useCallback(
    (item: ListItem) => {
      // Optimistic toggle
      setLocalItems(
        items.map((i) =>
          i.id === item.id ? { ...i, isChecked: !i.isChecked } : i,
        ),
      );
      updateItem.mutate({
        listId,
        itemId: item.id,
        isChecked: !item.isChecked,
      });
    },
    [items, listId, updateItem],
  );

  const handleEditItem = useCallback((item: ListItem) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  }, []);

  const handleQuickAdd = async () => {
    const trimmedName = quickAddValue.trim();
    if (!trimmedName) return;

    try {
      await addItem.mutateAsync({
        listId,
        name: trimmedName,
        quantity: 1,
        unit: 'UNIT',
      });
      setQuickAddValue('');
      quickAddRef.current?.focus();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add item.',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteList = async () => {
    try {
      await updateList.mutateAsync({ id: listId, status: ListStatus.COMPLETED });
      toast({ title: 'List completed' });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to complete list.',
        variant: 'destructive',
      });
    }
  };

  const handleArchiveList = async () => {
    try {
      await updateList.mutateAsync({ id: listId, status: ListStatus.ARCHIVED });
      toast({ title: 'List archived' });
      router.push('/lists');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to archive list.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteList = async () => {
    try {
      await deleteList.mutateAsync(listId);
      toast({ title: 'List deleted' });
      router.push('/lists');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete list.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/lists">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>
        <LoadingSkeleton variant="list-items" count={5} />
      </div>
    );
  }

  if (isError || !list) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/lists">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>
        <ErrorState
          message="Failed to load this list."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const statusVariant =
    list.status === ListStatus.ACTIVE ? 'default' : 'secondary';

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="space-y-4 pb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/lists">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-semibold truncate">{list.name}</h1>
            <Badge variant={statusVariant}>{(list.status ?? '').toLowerCase()}</Badge>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {checkedItems.length}/{items.length} items
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="List actions">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCompleteList}>
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Complete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchiveList}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 space-y-2">
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="This list is empty"
            description="Add your first item below"
          />
        ) : (
          <>
            {/* Unchecked items with drag and drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={uncheckedItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div role="list" aria-label="Unchecked items">
                  {uncheckedItems.map((item) => (
                    <SortableItemRow
                      key={item.id}
                      item={item}
                      onToggle={handleToggleItem}
                      onEdit={handleEditItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Checked items */}
            {checkedItems.length > 0 && (
              <Collapsible open={checkedOpen} onOpenChange={setCheckedOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                    aria-label={`${checkedOpen ? 'Collapse' : 'Expand'} checked items`}
                  >
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        !checkedOpen && '-rotate-90',
                      )}
                    />
                    Checked ({checkedItems.length})
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div role="list" aria-label="Checked items">
                    {checkedItems.map((item) => (
                      <CheckedItemRow
                        key={item.id}
                        item={item}
                        onToggle={handleToggleItem}
                        onEdit={handleEditItem}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}
      </div>

      {/* Quick add input - sticky at the bottom */}
      <div className="sticky bottom-0 border-t bg-background pt-3 pb-4 mt-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleQuickAdd();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={quickAddRef}
              value={quickAddValue}
              onChange={(e) => setQuickAddValue(e.target.value)}
              placeholder="Add an item..."
              className="pl-9"
              aria-label="Add a new item"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!quickAddValue.trim() || addItem.isPending}
          >
            {addItem.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Add'
            )}
          </Button>
        </form>
      </div>

      {/* Edit Item Dialog */}
      <EditItemDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={editingItem}
        listId={listId}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete list</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{list.name}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteList}
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

