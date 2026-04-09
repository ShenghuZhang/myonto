/**
 * Sidebar Component
 * Left navigation sidebar
 */

import React from 'react';
import {
  Home,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  // Only show Graph View
  const views = [
    { id: 'graph', label: 'Graph View', icon: Home },
  ];

  return (
    <aside className="sidebar">
      {/* Navigation */}
      <nav className="sidebar-nav">
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={`sidebar-item ${activeView === view.id ? 'active' : ''}`}
            >
              <Icon className="sidebar-icon" />
              <span className="sidebar-label">{view.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
