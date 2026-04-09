/**
 * CapabilityPanel Component
 * Display capabilities for an entity
 */

import React, { useState, useEffect } from 'react';
import { Capability } from '../../types/ontology';
import { ontologyApi } from '../../api/ontology';
import { formatCapabilityType } from '../../utils/formatters';
import { Zap, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

interface CapabilityPanelProps {
  nodeId: string;
}

export const CapabilityPanel: React.FC<CapabilityPanelProps> = ({ nodeId }) => {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        setLoading(true);
        const data = await ontologyApi.getNodeCapabilities(nodeId);
        setCapabilities(data);
      } catch (error) {
        console.error('Error fetching capabilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCapabilities();
  }, [nodeId]);

  const toggle = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (capabilities.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No capabilities found
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {capabilities.map((cap) => (
        <div
          key={cap.cap_id}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => toggle(cap.cap_id)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${cap.active ? 'text-purple-600' : 'text-gray-400'}`} />
              <span className="font-medium text-gray-900">{cap.name}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {formatCapabilityType(cap.type)}
              </span>
              {!cap.active && (
                <span className="text-xs text-gray-400">(inactive)</span>
              )}
            </div>
            {expanded.has(cap.cap_id) ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {expanded.has(cap.cap_id) && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-700 mb-2">{cap.description}</p>
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">Implementation:</p>
                <code className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded block overflow-x-auto">
                  {cap.implementation}
                </code>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
