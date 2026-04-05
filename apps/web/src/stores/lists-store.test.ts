import { describe, it, expect } from 'vitest';
import { useListsStore } from '@/stores/lists-store';

describe('useListsStore', () => {
  it('has ACTIVE as default filter', () => {
    expect(useListsStore.getState().selectedFilter).toBe('ACTIVE');
  });

  it('setFilter updates the selected filter', () => {
    useListsStore.getState().setFilter('COMPLETED');
    expect(useListsStore.getState().selectedFilter).toBe('COMPLETED');
    useListsStore.getState().setFilter('ACTIVE');
  });

  it('createDialogOpen defaults to false', () => {
    expect(useListsStore.getState().createDialogOpen).toBe(false);
  });

  it('setCreateDialogOpen toggles dialog state', () => {
    useListsStore.getState().setCreateDialogOpen(true);
    expect(useListsStore.getState().createDialogOpen).toBe(true);
    useListsStore.getState().setCreateDialogOpen(false);
    expect(useListsStore.getState().createDialogOpen).toBe(false);
  });
});
