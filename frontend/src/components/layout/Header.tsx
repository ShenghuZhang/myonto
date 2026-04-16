/**
 * Header Component
 * Main application header with tab switching
 */

import React from 'react';
import { ViewMode } from '../../types/ontology';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  const tabs = [
    { id: 'graph' as ViewMode, label: 'Graph' },
    { id: 'split' as ViewMode, label: 'Split' },
    { id: 'agent' as ViewMode, label: 'Agent' },
  ];

  return (
    <div className="panel-header">
      <div className="header-left">
        <span className="panel-title">Ontology Graph</span>
        <div className="tab-switcher">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${currentView === tab.id ? 'active' : ''}`}
              onClick={() => onViewChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
