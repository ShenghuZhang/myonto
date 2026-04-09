/**
 * Link Component
 * Relationship visualization
 */

import React from 'react';
import { OntologyLink, LinkType } from '../../types/ontology';
import { getLinkColor, getLinkDashArray } from '../../utils/color-palette';

interface LinkProps {
  link: OntologyLink;
  source: { x: number; y: number };
  target: { x: number; y: number };
  selected?: boolean;
  hovered?: boolean;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
}

export const Link: React.FC<LinkProps> = ({
  link,
  source,
  target,
  selected = false,
  hovered = false,
  onClick,
  onHover,
}) => {
  const color = getLinkColor(link.type);
  const dashArray = getLinkDashArray(link.type);

  return (
    <g onClick={onClick} onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
      {/* Main line */}
      <line
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
        stroke={color}
        strokeWidth={selected || hovered ? 3 : 2}
        strokeDasharray={dashArray}
        opacity={hovered ? 1 : 0.6}
        className="cursor-pointer transition-all"
      />

      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrow-${link.id}`}
          viewBox="0 -5 10 10"
          refX={20}
          refY={0}
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M0,-5L10,0L0,5" fill={color} />
        </marker>
      </defs>

      {/* Link label if present */}
      {link.label && hovered && (
        <text
          x={(source.x + target.x) / 2}
          y={(source.y + target.y) / 2}
          textAnchor="middle"
          fontSize="10"
          fill="#6B7280"
          className="bg-white px-1"
        >
          {link.label}
        </text>
      )}
    </g>
  );
};
