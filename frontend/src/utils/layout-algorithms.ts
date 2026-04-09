/**
 * Layout Algorithms
 * Different layout algorithms for graph visualization
 */

import * as d3 from 'd3';
import { OntologyNode, OntologyLink, LayoutType } from '../types/ontology';

export interface LayoutOptions {
  width: number;
  height: number;
  nodeSpacing: number;
  linkDistance: number;
  iterations: number;
}

/**
 * Force-directed layout
 */
export function forceDirectedLayout(
  nodes: OntologyNode[],
  links: OntologyLink[],
  options: LayoutOptions
): { nodes: OntologyNode[]; links: OntologyLink[] } {
  const width = options.width || 800;
  const height = options.height || 600;

  // Create simulation nodes
  const simNodes = nodes.map(node => ({
    ...node,
    x: width / 2 + (Math.random() - 0.5) * 100,
    y: height / 2 + (Math.random() - 0.5) * 100,
  })) as OntologyNode[];

  // Create simulation links
  const simLinks = links.map(link => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id;
    const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id;
    return {
      ...link,
      source: sourceId,
      target: targetId,
    };
  }) as any[];

  const simulation = d3.forceSimulation(simNodes as any)
    .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(options.linkDistance || 100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(40));

  // Run simulation
  for (let i = 0; i < (options.iterations || 100); i++) {
    simulation.tick();
  }

  // Stop simulation
  simulation.stop();

  return { nodes: simNodes, links };
}

/**
 * Hierarchical layout (tree-like)
 */
export function hierarchicalLayout(
  nodes: OntologyNode[],
  links: OntologyLink[],
  options: LayoutOptions
): { nodes: OntologyNode[]; links: OntologyLink[] } {
  const width = options.width || 800;
  const height = options.height || 600;

  // Group nodes by type for better visualization
  const nodesByType = nodes.reduce((acc, node) => {
    if (!acc[node.type]) {
      acc[node.type] = [];
    }
    acc[node.type].push(node);
    return acc;
  }, {} as Record<string, OntologyNode[]>);

  const types = Object.keys(nodesByType);
  const typeHeight = height / types.length;
  const typeWidth = width / Math.max(...types.map(t => nodesByType[t].length));

  // Position nodes by type
  const positionedNodes = nodes.map(node => {
    const typeIndex = types.indexOf(node.type);
    const typeNodes = nodesByType[node.type];
    const nodeIndex = typeNodes.findIndex(n => n.id === node.id);

    return {
      ...node,
      x: nodeIndex * typeWidth + typeWidth / 2,
      y: typeIndex * typeHeight + typeHeight / 2,
    };
  });

  return { nodes: positionedNodes, links };
}

/**
 * Circular layout
 */
export function circularLayout(
  nodes: OntologyNode[],
  links: OntologyLink[],
  options: LayoutOptions
): { nodes: OntologyNode[]; links: OntologyLink[] } {
  const width = options.width || 800;
  const height = options.height || 600;
  const radius = Math.min(width, height) / 2 - 50;

  const centerX = width / 2;
  const centerY = height / 2;

  // Position nodes in a circle
  const positionedNodes = nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    return {
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return { nodes: positionedNodes, links };
}

/**
 * Apply layout to graph
 */
export function applyLayout(
  nodes: OntologyNode[],
  links: OntologyLink[],
  layout: LayoutType,
  options: LayoutOptions
): { nodes: OntologyNode[]; links: OntologyLink[] } {
  switch (layout) {
    case 'force-directed':
      return forceDirectedLayout(nodes, links, options);
    case 'hierarchical':
      return hierarchicalLayout(nodes, links, options);
    case 'circular':
      return circularLayout(nodes, links, options);
    default:
      return forceDirectedLayout(nodes, links, options);
  }
}

/**
 * Get optimal layout dimensions
 */
export function getLayoutDimensions(
  nodeCount: number,
  aspectRatio: number = 4/3
): { width: number; height: number } {
  const area = nodeCount * 10000; // 100x100 pixels per node
  const height = Math.sqrt(area / aspectRatio);
  const width = height * aspectRatio;

  return {
    width: Math.max(width, 800),
    height: Math.max(height, 600),
  };
}
