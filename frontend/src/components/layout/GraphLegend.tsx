/**
 * GraphLegend Component
 * Display entity type legend at bottom left
 */

import React from 'react';
import { useGraphStore } from '../../stores/graphStore';
import { nodeColors } from '../../utils/color-palette';

export const GraphLegend: React.FC = () => {
  const { filters, setFilters } = useGraphStore();

  const entityTypeConfig = [
    { type: 'DistributionCenter', label: 'Distribution Centers', color: nodeColors.DistributionCenter.primary },
    { type: 'CustomerOrder', label: 'Customer Orders', color: nodeColors.CustomerOrder.primary },
    { type: 'Product', label: 'Products', color: nodeColors.Product.primary },
    { type: 'Capability', label: 'Capabilities', color: nodeColors.Capability.primary },
  ] as const;

  const toggleFilter = (type: keyof typeof filters) => {
    setFilters({
      ...filters,
      [type]: !filters[type],
    });
  };

  return (
    <div className="graph-legend">
      <div className="legend-title">Entity Types</div>
      <div className="legend-items">
        {entityTypeConfig.map((config) => (
          <div
            key={config.type}
            className="legend-item"
            style={{ opacity: filters[config.type] ? 1 : 0.4 }}
            onClick={() => toggleFilter(config.type)}
          >
            <div
              className="legend-dot"
              style={{ backgroundColor: filters[config.type] ? config.color : '#CCC' }}
            />
            <span className="legend-label">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
