/**
 * MiniMap Component
 * Navigation minimap for large graphs
 */

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { OntologyNode } from '../../types/ontology';

interface MiniMapProps {
  nodes: OntologyNode[];
  width: number;
  height: number;
  onViewChange?: (transform: { x: number; y: number; k: number }) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  nodes,
  width,
  height,
  onViewChange,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const minimapWidth = 200;
  const minimapHeight = 150;

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);

    // Calculate bounds
    const xValues = nodes.map(n => n.x || 0);
    const yValues = nodes.map(n => n.y || 0);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const graphWidth = maxX - minX || 100;
    const graphHeight = maxY - minY || 100;

    // Scale factors
    const scaleX = minimapWidth / graphWidth;
    const scaleY = minimapHeight / graphHeight;
    const scale = Math.min(scaleX, scaleY) * 0.8;

    // Draw nodes
    svg.selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 3)
      .attr('fill', '#6B7280')
      .attr('cx', (d) => ((d.x || 0) - minX) * scale + 10)
      .attr('cy', (d) => ((d.y || 0) - minY) * scale + 10);

  }, [nodes]);

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <svg
        ref={svgRef}
        width={minimapWidth}
        height={minimapHeight}
        className="bg-gray-50 rounded"
      />
    </div>
  );
};
