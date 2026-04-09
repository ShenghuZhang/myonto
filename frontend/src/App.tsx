/**
 * App Component
 * Main application component
 */

import React from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { OntologyGraph } from './components/graph/OntologyGraph';
import { useGraphData } from './hooks/useGraphData';
import { useGraphStore } from './stores/graphStore';
import { Loader2, AlertCircle } from 'lucide-react';

function App() {
  const { nodes: dataNodes, links: dataLinks, loading, error } = useGraphData();
  const {
    nodes: storeNodes,
    links: storeLinks,
    filters,
    setNodes,
    setLinks,
    setFilters,
  } = useGraphStore();

  // Use data from store if available, otherwise use data from hook
  const nodes = storeNodes.length > 0 ? storeNodes : dataNodes;
  const links = storeLinks.length > 0 ? storeLinks : dataLinks;

  // Update store when data changes
  React.useEffect(() => {
    if (dataNodes.length > 0) {
      setNodes(dataNodes);
      setLinks(dataLinks);
    }
  }, [dataNodes, dataLinks, setNodes, setLinks]);

  // Handle loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--background-color)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading ontology data...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--background-color)]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-600" />
          <p className="text-gray-900 font-semibold">Error Loading Data</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <OntologyGraph
        nodes={nodes}
        links={links}
        filters={filters}
        onFilterChange={setFilters}
        layout="force-directed"
        onLayoutChange={() => {}}
      />
    </MainLayout>
  );
}

export default App;
