/**
 * useNodeInteraction Hook
 * Handle node click, hover, drag interactions
 */

import { useState, useCallback } from 'react';
import { OntologyNode } from '../types/ontology';

interface UseNodeInteractionResult {
  selectedNode: OntologyNode | null;
  hoveredNode: OntologyNode | null;
  draggingNode: OntologyNode | null;
  handleNodeClick: (node: OntologyNode) => void;
  handleNodeHover: (node: OntologyNode | null) => void;
  handleDragStart: (node: OntologyNode) => void;
  handleDragEnd: () => void;
  clearSelection: () => void;
}

export const useNodeInteraction = (): UseNodeInteractionResult => {
  const [selectedNode, setSelectedNode] = useState<OntologyNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<OntologyNode | null>(null);
  const [draggingNode, setDraggingNode] = useState<OntologyNode | null>(null);

  const handleNodeClick = useCallback((node: OntologyNode) => {
    setSelectedNode(node);
  }, []);

  const handleNodeHover = useCallback((node: OntologyNode | null) => {
    setHoveredNode(node);
  }, []);

  const handleDragStart = useCallback((node: OntologyNode) => {
    setDraggingNode(node);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingNode(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return {
    selectedNode,
    hoveredNode,
    draggingNode,
    handleNodeClick,
    handleNodeHover,
    handleDragStart,
    handleDragEnd,
    clearSelection,
  };
};
