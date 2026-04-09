/**
 * Selection Store
 * Zustand store for node/link selection state
 */

import { create } from 'zustand';
import { OntologyNode, OntologyLink } from '../types/ontology';

interface SelectionState {
  selectedNode: OntologyNode | null;
  selectedLink: OntologyLink | null;
  multiSelectedNodes: string[];
  multiSelectedLinks: string[];
  selectionMode: 'single' | 'multi';

  // Actions
  selectNode: (node: OntologyNode | null) => void;
  selectLink: (link: OntologyLink | null) => void;
  addToSelection: (nodeId: string) => void;
  removeFromSelection: (nodeId: string) => void;
  clearSelection: () => void;
  toggleSelectionMode: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  // Initial state
  selectedNode: null,
  selectedLink: null,
  multiSelectedNodes: [],
  multiSelectedLinks: [],
  selectionMode: 'single',

  // Actions
  selectNode: (node) => set({ selectedNode: node, selectedLink: null }),

  selectLink: (link) => set({ selectedLink: link, selectedNode: null }),

  addToSelection: (nodeId) => set((state) => {
    if (state.multiSelectedNodes.includes(nodeId)) {
return state;
    }
    return {
      multiSelectedNodes: [...state.multiSelectedNodes, nodeId],
    };
  }),

  removeFromSelection: (nodeId) => set((state) => ({
    multiSelectedNodes: state.multiSelectedNodes.filter(id => id !== nodeId),
  })),

  clearSelection: () => set({
    selectedNode: null,
    selectedLink: null,
    multiSelectedNodes: [],
    multiSelectedLinks: [],
  }),

  toggleSelectionMode: () => set((state) => ({
    selectionMode: state.selectionMode === 'single' ? 'multi' : 'single',
  })),
}));
