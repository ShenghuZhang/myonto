/**
 * useGraphData Hook
 * Fetch and manage graph data
 */

import { useState, useEffect } from 'react';
import { ontologyApi } from '../api/ontology';
import { GraphData, OntologyNode, OntologyLink } from '../types/ontology';

interface UseGraphDataResult {
  nodes: OntologyNode[];
  links: OntologyLink[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  search: (query: string) => Promise<OntologyNode[]>;
}

export const useGraphData = (): UseGraphDataResult => {
  const [nodes, setNodes] = useState<OntologyNode[]>([]);
  const [links, setLinks] = useState<OntologyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ontologyApi.getGraphData();
      setNodes(data.nodes);
      setLinks(data.links);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch graph data');
    } finally {
      setLoading(false);
    }
  };

  const search = async (query: string): Promise<OntologyNode[]> => {
    try {
      return await ontologyApi.searchNodes(query);
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    nodes,
    links,
    loading,
    error,
    refetch: fetchData,
    search,
  };
};
