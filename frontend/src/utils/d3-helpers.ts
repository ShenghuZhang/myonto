/**
 * D3 Helpers
 * Utility functions for D3.js operations
 */

import * as d3 from 'd3';
import { OntologyNode } from '../types/ontology';

/**
 * Get the bounding box of a D3 selection
 */
export function getBoundingBox(selection: d3.Selection<any, any, any, any>): { width: number; height: number } {
  const bbox = (selection.node() as SVGSVGElement)?.getBoundingClientRect();
  return {
    width: bbox?.width || 0,
    height: bbox?.height || 0,
  };
}

/**
 * Create a D3 force simulation
 */
export function createSimulation(
  nodes: d3.SimulationNodeDatum[],
  links: d3.SimulationLinkDatum<d3.SimulationNodeDatum>[],
  width: number,
  height: number
): d3.Simulation<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>> {
  return d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(30));
}

/**
 * Restart simulation with new data
 */
export function restartSimulation(
  simulation: d3.Simulation<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>>
): void {
  simulation.alpha(1).restart();
}

/**
 * Convert D3 nodes to ontology nodes
 */
export function d3NodesToOntologyNodes(d3Nodes: d3.SimulationNodeDatum[]): OntologyNode[] {
  return d3Nodes.map((node: any) => ({
    id: node.id,
    type: node.type,
    label: node.label,
    properties: node.properties || {},
    capabilities: node.capabilities || [],
    x: node.x,
    y: node.y,
  }));
}

/**
 * Create zoom behavior
 */
export function createZoomBehavior(
  svg: d3.Selection<SVGSVGElement, any, any, any>,
  onZoom: (transform: d3.ZoomTransform) => void
): d3.ZoomBehavior<SVGSVGElement, unknown> {
  return d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      svg.select('g.main-group').attr('transform', event.transform.toString());
      onZoom(event.transform);
    });
}

/**
 * Apply zoom transform
 */
export function applyZoomTransform(
  svg: d3.Selection<SVGSVGElement, any, any, any>,
  transform: { k: number; x: number; y: number }
): void {
  svg.call(
    d3.zoom<SVGSVGElement, unknown>().transform,
    new d3.ZoomTransform(transform.k, transform.x, transform.y)
  );
}

/**
 * Create drag behavior
 */
export function createDragBehavior(
  simulation: d3.Simulation<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>>,
  onDragStart?: (event: d3.D3DragEvent<any, any, any>) => void,
  onDrag?: (event: d3.D3DragEvent<any, any, any>) => void,
  onDragEnd?: (event: d3.D3DragEvent<any, any, any>) => void
): d3.DragBehavior<SVGGElement, d3.SimulationNodeDatum, d3.SimulationNodeDatum> {
  return d3.drag<SVGGElement, d3.SimulationNodeDatum, d3.SimulationNodeDatum>()
    .on('start', function(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
      onDragStart?.(event);
    })
    .on('drag', function(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
      onDrag?.(event);
    })
    .on('end', function(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
      onDragEnd?.(event);
    });
}

/**
 * Create curved path for link
 */
export function createLinkPath(
  source: { x: number; y: number },
  target: { x: number; y: number },
  curvature: number = 0.5
): string {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dr = Math.sqrt(dx * dx + dy * dy) * curvature;
  return `M${source.x},${source.y}A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
}

/**
 * Calculate link midpoint
 */
export function getLinkMidpoint(
  source: { x: number; y: number },
  target: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: (source.x + target.x) / 2,
    y: (source.y + target.y) / 2,
  };
}

/**
 * Check if point is inside SVG element
 */
export function isPointInsideElement(
  point: { x: number; y: number },
  element: SVGElement
): boolean {
  const bbox = element.getBoundingClientRect();
  return (
    point.x >= bbox.left &&
    point.x <= bbox.right &&
    point.y >= bbox.top &&
    point.y <= bbox.bottom
  );
}

/**
 * Get SVG coordinates from screen coordinates
 */
export function getSVGCoordinates(
  screenX: number,
  screenY: number,
  svg: SVGSVGElement
): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = screenX;
  pt.y = screenY;
  return pt.matrixTransform(svg.getScreenCTM()?.inverse() || new DOMMatrix());
}
