/**
 * Node Component
 * Individual node visualization
 */

import React from 'react';
import { OntologyNode, NodeType } from '../../types/ontology';
import { getNodeColor } from '../../utils/color-palette';

interface NodeProps {
  node: OntologyNode;
  selected?: boolean;
  hovered?: boolean;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
}

export const Node: React.FC<NodeProps> = ({
  node,
  selected = false,
  hovered = false,
  onClick,
  onHover,
}) => {
  const color = selected
    ? getNodeColor(node.type, 'selected')
    : hovered
    ? getNodeColor(node.type, 'hover')
    : getNodeColor(node.type, 'primary');

  const size = 20;

  const renderShape = () => {
    return (
      <circle
        r={size}
        fill={color}
        stroke={selected ? '#000' : 'none'}
        strokeWidth={selected ? 2 : 0}
      />
    );
  };

  return (
    <g
      transform={`translate(${node.x || 0}, ${node.y || 0})`}
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className="cursor-pointer transition-transform hover:scale-110"
      style={{ transformOrigin: 'center' }}
    >
      {renderShape()}

      {/* Icon */}
          {/* <use href={`#${getNodeIcon(node.type)}`} /> */}
        {/* </text> */}

      {/* Label */}
      <text
        dy={size + 12}
        textAnchor="middle"
        fontSize="12"
        fill="#374151"
        fontWeight="500"
      >
        {node.label}
      </text>

      {/* Status indicator */}
      {node.properties?.status && (
        <circle
          cx={size - 5}
          cy={-size + 5}
          r={4}
          fill={getStatusColor(node.properties.status)}
          stroke="#fff"
          strokeWidth={1}
        />
      )}
    </g>
  );
};

// Helper function for status color
function getStatusColor(status: string): string {
  switch (status) {
    case 'Active':
    case 'Delivered':
      return '#10B981';
    case 'Down':
    case 'Cancelled':
      return '#EF4444';
    case 'Critical':
      return '#F59E0B';
    case 'Pending':
      return '#6B7280';
    case 'Allocated':
    case 'InTransit':
      return '#3B82F6';
    default:
      return '#6B7280';
  }
}
