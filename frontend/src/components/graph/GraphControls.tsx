/**
 * GraphControls Component
 * Zoom, filter, and edge label controls
 */

import React, { useState } from 'react';
import { NodeFilter, NodeType } from '../../types/ontology';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface GraphControlsProps {
  filters: NodeFilter;
  onFilterChange: (filters: NodeFilter) => void;
  showEdgeLabels?: boolean;
  onToggleEdgeLabels?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  filters,
  onFilterChange,
  showEdgeLabels = true,
  onToggleEdgeLabels,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (type: NodeType) => {
    onFilterChange({
      ...filters,
      [type]: !filters[type],
    });
  };

  const nodeTypes: NodeType[] = ['DistributionCenter', 'CustomerOrder', 'Product', 'Capability'];
  const nodeTypeLabels: Record<NodeType, string> = {
    DistributionCenter: 'Distribution Centers',
    CustomerOrder: 'Customer Orders',
    Product: 'Products',
    Capability: 'Capabilities',
  };

  return (
    <div className="controls-wrapper">
      {/* Zoom Controls */}
      <div className="control-group">
        {onZoomIn && (
          <button
            onClick={onZoomIn}
            className="control-btn"
            title="Zoom In"
          >
            <ZoomIn className="btn-icon" />
          </button>
        )}
        {onResetZoom && (
          <button
            onClick={onResetZoom}
            className="control-btn"
            title="Reset Zoom"
          >
            <Maximize2 className="btn-icon" />
          </button>
        )}
        {onZoomOut && (
          <button
            onClick={onZoomOut}
            className="control-btn"
            title="Zoom Out"
          >
            <ZoomOut className="btn-icon" />
          </button>
        )}
      </div>

      {/* Edge Labels Toggle */}
      {onToggleEdgeLabels && (
        <div className="control-group">
          <button
            onClick={onToggleEdgeLabels}
            className="control-btn dropdown-btn"
          >
            {showEdgeLabels ? 'Hide' : 'Show'} Edge Labels
          </button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="control-group">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`control-btn dropdown-btn ${
            Object.values(filters).every((v) => v) ? 'disabled' : ''
          }`}
        >
          {Object.values(filters).every((v) => v) ? (
            <span className="filter-indicator all">✓</span>
          ) : (
            <span className={`filter-indicator ${
              Object.values(filters).some((v) => v) ? 'partial' : 'none'
            }`}>●</span>
          )}
          {showFilters ? (
            <ChevronUp className="btn-icon-sm" />
          ) : (
            <ChevronDown className="btn-icon-sm" />
          )}
        </button>

        {showFilters && (
          <div className="dropdown-menu">
            <p className="dropdown-title">Show Node Types</p>
            {nodeTypes.map((type) => (
              <label
                key={type}
                className="dropdown-item filter-item"
              >
                <input
                  type="checkbox"
                  checked={filters[type]}
                  onChange={() => toggleFilter(type)}
                  className="filter-checkbox"
                />
                <span className="filter-label">{nodeTypeLabels[type]}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
