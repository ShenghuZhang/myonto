/**
 * Color Palette
 * Color schemes for node and link types
 *
 * MiroFish-inspired color palette for proven design consistency
 */

import { NodeType, LinkType } from '../types/ontology';

/**
 * Node colors by type - MiroFish Proven Color Palette
 * #FF6B35  #004E89  #7B2D8E  #1A936F  #C5283D
 * #E9724C  #3498db  #9b59b6  #27ae60  #f39c12
 */
export const nodeColors: Record<NodeType, { primary: string; hover: string; selected: string; text: string }> = {
  DistributionCenter: {
    primary: '#FF6B35',
    hover: '#FF8C60',
    selected: '#E55A2B',
    text: '#FFFFFF',
  },
  CustomerOrder: {
    primary: '#004E89',
    hover: '#0066B3',
    selected: '#003A66',
    text: '#FFFFFF',
  },
  Product: {
    primary: '#7B2D8E',
    hover: '#9B3DA0',
    selected: '#6B2270',
    text: '#FFFFFF',
  },
  Capability: {
    primary: '#1A936F',
    hover: '#2AB380',
    selected: '#0F7A55',
    text: '#FFFFFF',
  },
};

/**
 * Link colors by type - MiroFish inspired
 */
export const linkColors: Record<LinkType, { color: string; dashArray?: string }> = {
  CONTAINS: {
    color: '#004E89',
    dashArray: '5,5',
  },
  SOURCED_FROM: {
    color: '#FF6B35',
  },
  STOCKS: {
    color: '#7B2D8E',
  },
  HAS_CAPABILITY: {
    color: '#1A936F',
    dashArray: '2,4',
  },
};

/**
 * Status colors
 */
export const statusColors: Record<string, string> = {
  Active: '#10B981', // green
  Down: '#EF4444', // red
  Critical: '#F59E0B', // orange
  Pending: '#6B7280', // gray
  Allocated: '#3B82F6', // blue
  InTransit: '#8B5CF6', // purple
  Delivered: '#10B981', // green
  Cancelled: '#EF4444', // red
  Split: '#F59E0B', // orange
};

/**
 * Priority colors
 */
export const priorityColors: Record<string, string> = {
  Critical: '#EF4444', // red
  High: '#F59E0B', // orange
  Standard: '#3B82F6', // blue
};

/**
 * Get node color
 */
export function getNodeColor(type: NodeType, variant: 'primary' | 'hover' | 'selected' = 'primary'): string {
  return nodeColors[type]?.[variant] || '#6B7280';
}

/**
 * Get link color
 */
export function getLinkColor(type: LinkType): string {
  return linkColors[type]?.color || '#6B7280';
}

/**
 * Get link dash array
 */
export function getLinkDashArray(type: LinkType): string | undefined {
  return linkColors[type]?.dashArray;
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  return statusColors[status] || '#6B7280';
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string): string {
  return priorityColors[priority] || '#6B7280';
}

/**
 * Get node icon name (for lucide-react)
 */
export function getNodeIcon(type: NodeType): string {
  switch (type) {
    case 'DistributionCenter':
      return 'building';
    case 'CustomerOrder':
      return 'shopping-cart';
    case 'Product':
      return 'package';
    case 'Capability':
      return 'zap';
    default:
      return 'circle';
  }
}

/**
 * Background colors for visualization
 */
export const backgroundColors = {
  light: '#F9FAFB', // gray-50
  dark: '#1F2937', // gray-800
  grid: '#E5E7EB', // gray-200
};
