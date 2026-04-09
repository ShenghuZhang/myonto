/**
 * Graph Types
 * Types for graph visualization
 */

import { NodeType, OntologyNode, LinkType } from './ontology';

// Graph State
export interface GraphState {
  nodes: OntologyNode[];
  links: {
    id: string;
    source: OntologyNode | string;
    target: string;
    type: LinkType;
  }[];
}

// Node Appearance
export interface NodeAppearance {
  color: string;
  hoverColor: string;
  selectedColor: string;
  textColor: string;
  size: number;
  shape: 'circle' | 'hexagon' | 'diamond' | 'rounded-rect';
  icon: string;
}

// Link Appearance
export interface LinkAppearance {
  color: string;
  width: number;
  dashArray?: string;
  markerEnd?: boolean;
  markerStart?: boolean;
}

// Filter State
export interface FilterState {
  nodeTypes: Record<NodeType, boolean>;
  linkTypes: Record<LinkType, boolean>;
  searchText: string;
}

// Layout Options
export interface LayoutOptions {
  type: 'force-directed' | 'hierarchical' | 'circular';
  nodeSpacing: number;
  linkDistance: number;
  iterations: number;
}

// Zoom/Pan State
export interface TransformState {
  k: number;
  x: number;
  y: number;
}

// Selection State
export interface SelectionState {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  selectedLinkIds: string[];
  hoveredLinkId: string | null;
}

// Tooltip State
export interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}
