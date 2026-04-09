/**
 * MainLayout Component
 * Main application layout container
 */

import React from 'react';
import { Header } from './Header';
import { GraphLegend } from './GraphLegend';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col">
      {/* Top Header with title */}
      <Header />

      {/* Main Graph Area - Full Screen */}
      <main className="flex-1 overflow-hidden relative">
        {/* Legend - Bottom Left */}
        <GraphLegend />

        {/* Graph Content */}
        {children}
      </main>
    </div>
  );
};
