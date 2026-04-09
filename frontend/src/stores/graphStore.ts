/**
 * Graph Store
 * Zustand store for graph data and state
 */

import { create } from 'zustand';
import { OntologyNode, OntologyLink, NodeFilter, LayoutType } from '../types/ontology';

interface GraphState {
  // Data
  nodes: OntologyNode[];
  links: OntologyLink[];

  // Selection
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  selectedLinkIds: string[];

  // Viewport
  transform: {
    k: number;
    x: number;
    y: number;
  };

  // Controls
  filters: NodeFilter;
  layout: LayoutType;
  showLabels: boolean;

  // Actions
  setNodes: (nodes: OntologyNode[]) => void;
  setLinks: (links: OntologyLink[]) => void;
  setSelectedNode: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  setSelectedLinks: (ids: string[]) => void;
  setTransform: (transform: { k: number; x: number; y: number }) => void;
  setFilters: (filters: NodeFilter) => void;
  setLayout: (layout: LayoutType) => void;
  toggleShowLabels: () => void;
  updateNode: (id: string, updates: Partial<OntologyNode>) => void;
  resetGraph: () => void;
}

const initialFilters: NodeFilter = {
  DistributionCenter: true,
  CustomerOrder: true,
  Product: true,
  Capability: true,
};

export const useGraphStore = create<GraphState>((set) => ({
  // Initial state
  nodes: [],
  links: [],
  selectedNodeId: null,
  hoveredNodeId: null,
  selectedLinkIds: [],
  transform: { k: 1, x: 0, y: 0 },
  filters: initialFilters,
  layout: 'force-directed',
  showLabels: true,

  // Actions
  setNodes: (nodes) => set({ nodes }),

  setLinks: (links) => set({ links }),

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  setHoveredNode: (id) => set({ hoveredNodeId: id }),

  setSelectedLinks: (ids) => set({ selectedLinkIds: ids }),

  setTransform: (transform) => set({ transform }),

  setFilters: (filters) => set({ filters }),

  setLayout: (layout) => set({ layout }),

  toggleShowLabels: () => set((state) => ({ showLabels: !state.showLabels })),

  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map(node =>
      node.id === id ? { ...node, ...updates } : node
    ),
  })),

  resetGraph: () => set({
    nodes: [],
    links: [],
    selectedNodeId: null,
    hoveredNodeId: null,
    selectedLinkIds: [],
    transform: { k: 1, x: 0, y: 0 },
    filters: initialFilters,
    layout: 'force-directed',
    showLabels: true,
  }),
}));
