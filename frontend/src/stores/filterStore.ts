/**
 * Filter Store
 * Zustand store for filtering state
 */

import { create } from 'zustand';
import { NodeType, LinkType } from '../types/ontology';

interface FilterState {
  nodeFilters: Record<NodeType, boolean>;
  linkFilters: Record<LinkType, boolean>;
  searchQuery: string;
  activeFiltersCount: number;

  // Actions
  toggleNodeFilter: (type: NodeType) => void;
  toggleLinkFilter: (type: LinkType) => void;
  setNodeFilter: (type: NodeType, value: boolean) => void;
  setLinkFilter: (type: LinkType, value: boolean) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  isActive: () => boolean;
}

const initialNodeFilters: Record<NodeType, boolean> = {
  DistributionCenter: true,
  CustomerOrder: true,
  Product: true,
  Capability: true,
};

const initialLinkFilters: Record<LinkType, boolean> = {
  CONTAINS: true,
  SOURCED_FROM: true,
  STOCKS: true,
  HAS_CAPABILITY: true,
};

export const useFilterStore = create<FilterState>((set, get) => ({
  // Initial state
  nodeFilters: initialNodeFilters,
  linkFilters: initialLinkFilters,
  searchQuery: '',
  activeFiltersCount: 0,

  // Actions
  toggleNodeFilter: (type) => set((state) => ({
    nodeFilters: {
      ...state.nodeFilters,
      [type]: !state.nodeFilters[type],
    },
  })),

  toggleLinkFilter: (type) => set((state) => ({
    linkFilters: {
      ...state.linkFilters,
      [type]: !state.linkFilters[type],
    },
  })),

  setNodeFilter: (type, value) => set((state) => ({
    nodeFilters: {
      ...state.nodeFilters,
      [type]: value,
    },
  })),

  setLinkFilter: (type, value) => set((state) => ({
    linkFilters: {
      ...state.linkFilters,
      [type]: value,
    },
  })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  resetFilters: () => set({
    nodeFilters: initialNodeFilters,
    linkFilters: initialLinkFilters,
    searchQuery: '',
  }),

  isActive: () => {
    const state = get();
    const someNodeFilterDisabled = Object.values(state.nodeFilters).some(v => !v);
    const someLinkFilterDisabled = Object.values(state.linkFilters).some(v => !v);
    const hasSearchQuery = state.searchQuery.length > 0;
    return someNodeFilterDisabled || someLinkFilterDisabled || hasSearchQuery;
  },
}));
