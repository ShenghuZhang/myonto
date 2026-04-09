/**
 * HistoryPanel Component
 * Display change history timeline
 */

import React, { useState, useEffect } from 'react';
import { HistoryEvent } from '../../types/ontology';
import { ontologyApi } from '../../api/ontology';
import { formatDateTime } from '../../utils/formatters';
import { Loader2 } from 'lucide-react';

interface HistoryPanelProps {
  nodeId: string;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ nodeId }) => {
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await ontologyApi.getNodeHistory(nodeId);
        setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [nodeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No history available
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />

        {/* Timeline items */}
        {history.map((event, index) => (
          <EventItem key={event.id} event={event} isLast={index === history.length - 1} />
        ))}
      </div>
    </div>
  );
};

interface EventItemProps {
  event: HistoryEvent;
  isLast: boolean;
}

const EventItem: React.FC<EventItemProps> = ({ event, isLast }) => {
  return (
    <div className="flex gap-4 pb-6 last:pb-0">
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        {!isLast && (
          <div className="w-px h-full bg-gray-200 mt-1" />
        )}
      </div>

      {/* Event content */}
      <div className="flex-1 pb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900">{event.action}</h4>
            <span className="text-xs text-gray-400">{formatDateTime(event.timestamp)}</span>
          </div>
          <p className="text-sm text-gray-700">{event.description}</p>
          {event.user && (
            <div className="mt-2 text-xs text-gray-500">
              by <span className="font-medium">{event.user}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
