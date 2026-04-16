/**
 * MainLayout Component
 * Main application layout container with view modes
 */

import React, { useState } from 'react';
import { Header } from './Header';
import { GraphLegend } from './GraphLegend';
import { AgentChat } from '../chat/AgentChat';
import { ViewMode, GraphData, OntologyNode, ChatMessage } from '../../types/ontology';

interface MainLayoutProps {
  children: React.ReactNode;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  graphData?: GraphData;
  selectedNode?: OntologyNode | null;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  viewMode,
  onViewModeChange,
  graphData,
  selectedNode,
}) => {
  // Use simple local state for now - ensure messages work
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header with tabs */}
      <Header currentView={viewMode} onViewChange={onViewModeChange} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {/* Legend - Only show in graph and split modes */}
        {(viewMode === 'graph' || viewMode === 'split') && <GraphLegend />}

        {/* Render different content based on viewMode */}
        {viewMode === 'graph' && (
          <div className="view-content full-graph">{children}</div>
        )}

        {viewMode === 'split' && (
          <div className="view-content split-view">
            <div className="graph-area">{children}</div>
            <div className="chat-area">
              <AgentChat
                graphData={graphData}
                selectedNodes={selectedNode ? [selectedNode.id] : []}
              />
            </div>
          </div>
        )}

        {viewMode === 'agent' && (
          <div className="view-content full-chat">
            <AgentChat
              graphData={graphData}
              selectedNodes={selectedNode ? [selectedNode.id] : []}
              fullWidth={true}
            />
          </div>
        )}
      </main>
    </div>
  );
};
