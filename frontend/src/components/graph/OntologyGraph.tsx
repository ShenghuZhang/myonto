/**
 * OntologyGraph Component
 * Main D3 force-directed graph visualization
 */

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { OntologyNode, OntologyLink, NodeFilter, LayoutType } from '../../types/ontology';
import { useD3Graph } from '../../hooks/useD3Graph';
import { NodeDetailPanel } from './NodeDetailPanel';
import { GraphControls } from './GraphControls';

interface OntologyGraphProps {
  nodes: OntologyNode[];
  links: OntologyLink[];
  filters: NodeFilter;
  onFilterChange: (filters: NodeFilter) => void;
  layout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export const OntologyGraph: React.FC<OntologyGraphProps> = ({
  nodes,
  links,
  filters,
  onFilterChange,
  layout,
  onLayoutChange,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<OntologyNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<OntologyNode | null>(null);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { zoomTo, resetZoom } = useD3Graph({
    containerRef: svgRef,
    nodes,
    links,
    width: dimensions.width,
    height: dimensions.height,
    filters,
    showEdgeLabels,
    onNodeClick: setSelectedNode,
    onNodeHover: setHoveredNode,
    onLinkClick: (link) => console.log('Link clicked:', link),
  });

  const handleZoomIn = () => zoomTo(1.5, dimensions.width / 2, dimensions.height / 2);
  const handleZoomOut = () => zoomTo(0.7, dimensions.width / 2, dimensions.height / 2);

  const handleBackgroundClick = () => {
    setSelectedNode(null);
  };

  return (
    <div className="flex h-full">
      {/* Main Graph Area */}
      <div ref={containerRef} className="flex-1 relative graph-container">
        {/* Graph Controls */}
        <GraphControls
          filters={filters}
          onFilterChange={onFilterChange}
          showEdgeLabels={showEdgeLabels}
          onToggleEdgeLabels={() => setShowEdgeLabels(!showEdgeLabels)}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={resetZoom}
        />

        {/* SVG Container */}
        <div
          className="w-full h-full cursor-move"
          onClick={handleBackgroundClick}
        >
          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Tooltip */}
        {hoveredNode && (
          <div
            className="absolute pointer-events-none bg-white p-2 rounded shadow-lg border border-gray-200 text-sm z-30"
            style={{
              left: hoveredNode.x ? hoveredNode.x + 20 : 0,
              top: hoveredNode.y ? hoveredNode.y - 20 : 0,
            }}
          >
            <div className="font-semibold">{hoveredNode.label}</div>
            <div className="text-gray-500">{hoveredNode.type}</div>
          </div>
        )}

        {/* Detail Panel */}
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};
