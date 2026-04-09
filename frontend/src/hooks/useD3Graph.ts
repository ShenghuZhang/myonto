/**
 * useD3Graph Hook
 * D3 simulation and render logic - MiroFish inspired redesign
 *
 * Features:
 * - Uniform circular nodes with white stroke (2.5px)
 * - Curved links for multiple edges between same node pair
 * - Self-loop edges as circular arcs
 * - Dynamic force simulation with collision, gravity
 * - Edge labels with white background rectangles
 * - Threshold-based drag (3px before restart)
 */

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { OntologyNode, OntologyLink, NodeFilter } from '../types/ontology';
import { getNodeColor, getLinkColor, getLinkDashArray } from '../utils/color-palette';

interface UseD3GraphProps {
  containerRef: React.RefObject<SVGSVGElement>;
  nodes: OntologyNode[];
  links: OntologyLink[];
  width: number;
  height: number;
  filters: NodeFilter;
  showEdgeLabels?: boolean;
  onNodeClick?: (node: OntologyNode) => void;
  onNodeHover?: (node: OntologyNode | null) => void;
  onLinkClick?: (link: OntologyLink) => void;
}

export const useD3Graph = ({
  containerRef,
  nodes,
  links,
  width,
  height,
  filters,
  showEdgeLabels = true,
  onNodeClick,
  onNodeHover,
  onLinkClick,
}: UseD3GraphProps) => {
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>> | null>(null);
  const svgRef = useRef<d3.Selection<SVGSVGElement, any, any, any> | null>(null);
  const selectedLinkRef = useRef<d3.Selection<SVGPathElement, any, any, any> | null>(null);

  // Filter nodes and links
  const filteredNodes = nodes.filter(node => filters[node.type]);
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = links.filter(
    link => filteredNodeIds.has(link.source as string) && filteredNodeIds.has(link.target as string)
  );

  // Helper: Calculate link path with curvature
  const getLinkPath = useCallback((d: any) => {
    const sx = (d.source as any).x || 0;
    const sy = (d.source as any).y || 0;
    const tx = (d.target as any).x || 0;
    const ty = (d.target as any).y || 0;

    // Self-loop handling
    if (d.source === d.target) {
      return `M${sx + 8},${sy - 4} A30,30 0 1,1 ${sx + 8},${sy + 4}`;
    }

    // Straight line for single edge
    if (d.curvature === 0) {
      return `M${sx},${sy} L${tx},${ty}`;
    }

    // Curved path for multiple edges
    const dx = tx - sx;
    const dy = ty - sy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const offset = Math.max(35, dist * 0.3);
    const cx = (sx + tx) / 2 - (dy / dist) * d.curvature * offset;
    const cy = (sy + ty) / 2 + (dx / dist) * d.curvature * offset;

    return `M${sx},${sy} Q${cx},${cy} ${tx},${ty}`;
  }, []);

  // Helper: Calculate link midpoint for label positioning
  const getLinkMidpoint = useCallback((d: any) => {
    // For self-loop
    if (d.source === d.target) {
      return { x: (d.source as any).x + 70, y: (d.source as any).y };
    }

    // For straight line
    if (d.curvature === 0) {
      return {
        x: ((d.source as any).x + (d.target as any).x) / 2,
        y: ((d.source as any).y + (d.target as any).y) / 2,
      };
    }

    // For curved path (quadratic bezier at t=0.5)
    const dx = (d.target as any).x - (d.source as any).x;
    const dy = (d.target as any).y - (d.source as any).y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const offset = Math.max(35, dist * 0.3);
    const cx = ((d.source as any).x + (d.target as any).x) / 2 - (dy / dist) * d.curvature * offset;
    const cy = ((d.source as any).y + (d.target as any).y) / 2 + (dx / dist) * d.curvature * offset;

    return {
      x: 0.25 * (d.source as any).x + 0.5 * cx + 0.25 * (d.target as any).x,
      y: 0.25 * (d.source as any).y + 0.5 * cy + 0.25 * (d.target as any).y,
    };
  }, []);

  // Helper: Truncate label to 8 chars
  const truncateLabel = (label: string): string => {
    if (label.length <= 8) return label;
    return label.substring(0, 8) + '...';
  };

  const renderGraph = useCallback(() => {
    if (!containerRef.current) return;

    // Clear previous content
    d3.select(containerRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(containerRef.current)
      .attr('width', width)
      .attr('height', height);

    svgRef.current = svg;

    // Create main group for zoom/pan
    const mainGroup = svg.append('g').attr('class', 'main-group');

    // Count edges between each pair of nodes for curvature calculation
    const edgePairCount: Record<string, number> = {};
    filteredLinks.forEach((link: any) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      const pairKey = [sourceId, targetId].sort().join('_');
      edgePairCount[pairKey] = (edgePairCount[pairKey] || 0) + 1;
    });

    // Assign curvature to each link
    const edgePairIndex: Record<string, number> = {};
    const linksWithCurvature = filteredLinks.map((link: any) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      const pairKey = [sourceId, targetId].sort().join('_');
      const pairTotal = edgePairCount[pairKey] || 1;
      const currentIndex = edgePairIndex[pairKey] || 0;
      edgePairIndex[pairKey] = currentIndex + 1;

      return {
        ...link,
        pairTotal,
        curvature: pairTotal > 1 ? (currentIndex - (pairTotal - 1) / 2) : 0,
      };
    });

    // Create improved force simulation
    const simulation = d3.forceSimulation(filteredNodes)
      .force('link', d3.forceLink(linksWithCurvature)
        .id((d: any) => d.id)
        .distance((d: any) => 150 + ((d.pairTotal || 1) - 1) * 50)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(50))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04));

    simulationRef.current = simulation;

    // Draw link label backgrounds
    const linkLabelBg = mainGroup.append('g')
      .attr('class', 'link-label-bg')
      .selectAll('rect')
      .data(linksWithCurvature)
      .enter()
      .append('rect')
      .attr('fill', 'rgba(255, 255, 255, 0.95)')
      .attr('rx', 3)
      .attr('ry', 3)
      .style('display', showEdgeLabels ? 'block' : 'none');

    // Draw link labels
    const linkLabels = mainGroup.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(linksWithCurvature)
      .enter()
      .append('text')
      .text((d: any) => d.type)
      .attr('font-size', '9px')
      .attr('fill', '#666')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('display', showEdgeLabels ? 'block' : 'none');

    // Draw links (curved paths)
    const linkElements = mainGroup.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(linksWithCurvature)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d: any) => getLinkColor(d.type))
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d: any) => getLinkDashArray(d.type))
      .on('click', (event, d) => {
        event.stopPropagation();
        // Reset all links
        linkElements
          .attr('stroke', (dd: any) => getLinkColor(dd.type))
          .attr('stroke-width', 1.5);
        // Highlight selected
        d3.select(event.target as SVGPathElement)
          .attr('stroke', '#3498db')
          .attr('stroke-width', 3);
        selectedLinkRef.current = d3.select(event.target as SVGPathElement);
        onLinkClick?.(d);
      });

    // Draw nodes (uniform circles)
    const nodeElements = mainGroup.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(filteredNodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', (d: any) => getNodeColor(d.type, 'primary'))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2.5)
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', (event, d) => {
          d.fx = d.x;
          d.fy = d.y;
          (d as any)._dragStartX = event.x;
          (d as any)._dragStartY = event.y;
          (d as any)._isDragging = false;
        })
        .on('drag', (event, d) => {
          const dx = event.x - (d as any)._dragStartX;
          const dy = event.y - (d as any)._dragStartY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (!(d as any)._isDragging && distance > 3) {
            (d as any)._isDragging = true;
            simulation.alphaTarget(0.3).restart();
          }

          if ((d as any)._isDragging) {
            d.fx = event.x;
            d.fy = event.y;
          }
        })
        .on('end', (event, d) => {
          if ((d as any)._isDragging) {
            simulation.alphaTarget(0);
          }
          d.fx = null;
          d.fy = null;
          (d as any)._isDragging = false;
        })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick?.(d);
      })
      .on('mouseover', (event, d) => {
        onNodeHover?.(d);
        d3.select(event.target as SVGCircleElement)
          .attr('stroke', '#3498db')
          .attr('stroke-width', 3);
      })
      .on('mouseout', (event) => {
        onNodeHover?.(null);
        d3.select(event.target as SVGCircleElement)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2.5);
      });

    // Draw node labels (truncated, positioned to right)
    const nodeLabels = mainGroup.append('g')
      .attr('class', 'node-labels')
      .selectAll('text')
      .data(filteredNodes)
      .enter()
      .append('text')
      .text((d: any) => truncateLabel(d.label))
      .attr('dx', 14)
      .attr('dy', 4)
      .attr('font-size', '10px')
      .attr('fill', '#374151');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      // Update link paths
      linkElements.attr('d', getLinkPath);

      // Update link labels
      linkLabels
        .attr('x', (d: any) => getLinkMidpoint(d).x)
        .attr('y', (d: any) => getLinkMidpoint(d).y);

      // Update link label backgrounds
      linkLabelBg
        .attr('x', (d: any) => getLinkMidpoint(d).x - 15)
        .attr('y', (d: any) => getLinkMidpoint(d).y - 6)
        .attr('width', 30)
        .attr('height', 12);

      // Update nodes
      nodeElements.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);

      // Update node labels
      nodeLabels.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
    });

    // Setup zoom/pan
    svg.call(d3.zoom<SVGSVGElement, unknown>()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
      })
    );

  }, [
    containerRef,
    filteredNodes,
    filteredLinks,
    width,
    height,
    showEdgeLabels,
    onNodeClick,
    onNodeHover,
    onLinkClick,
    getLinkPath,
    getLinkMidpoint,
  ]);

  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  return {
    simulation: simulationRef.current,
    zoomTo: (scale: number, x: number, y: number) => {
      if (svgRef.current) {
        svgRef.current.transition().duration(750).call(
          d3.zoom<SVGSVGElement, unknown>().transform,
          new d3.ZoomTransform(scale, x, y)
        );
      }
    },
    resetZoom: () => {
      if (svgRef.current) {
        svgRef.current.transition().duration(750).call(
          d3.zoom<SVGSVGElement, unknown>().transform,
          d3.zoomIdentity
        );
      }
    },
  };
};
