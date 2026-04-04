import { create } from 'zustand';

interface ListsUIState {
  selectedFilter: 'ALL' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createDialogOpen: boolean;
  setFilter: (filter: ListsUIState['selectedFilter']) => void;
  setCreateDialogOpen: (open: boolean) => void;
}

export const useListsStore = create<ListsUIState>((set) => ({
  selectedFilter: 'ACTIVE',
  createDialogOpen: false,
  setFilter: (filter) => set({ selectedFilter: filter }),
  setCreateDialogOpen: (open) => set({ createDialogOpen: open }),
}));
