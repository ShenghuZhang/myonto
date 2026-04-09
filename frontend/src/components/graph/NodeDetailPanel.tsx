/**
 * NodeDetailPanel Component
 * Side panel for node details - MiroFish inspired design
 */

import React, { useState, useEffect } from 'react';
import { OntologyNode, Capability, Rule, HistoryEvent } from '../../types/ontology';
import { ontologyApi } from '../../api/ontology';
import {
  formatCurrency,
  formatPercentage,
  formatCoordinate,
  formatDateTime,
  formatRiskScore,
  formatDuration,
  getRiskLevel,
  getRiskColor,
  formatStatus,
  formatPriority,
  formatCapabilityType,
} from '../../utils/formatters';
import {
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface NodeDetailPanelProps {
  node: OntologyNode;
  onClose: () => void;
}

type TabType = 'details' | 'capabilities' | 'rules' | 'history';

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [caps, rulesData, historyData] = await Promise.all([
          ontologyApi.getNodeCapabilities(node.id),
          ontologyApi.getRules(node.type),
          ontologyApi.getNodeHistory(node.id),
        ]);
        setCapabilities(caps);
        setRules(rulesData);
        setHistory(historyData);
      } catch (error) {
        console.error('Error fetching node details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [node.id, node.type]);

  return (
    <div className="detail-panel">
      {/* Header */}
      <div className="detail-panel-header">
        <div className="detail-title">{node.label}</div>
        <button className="detail-close" onClick={onClose}>×</button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
        {[
          { id: 'details' as TabType, label: 'Details' },
          { id: 'capabilities' as TabType, label: `Capabilities (${capabilities.length})` },
          { id: 'rules' as TabType, label: 'Rules' },
          { id: 'history' as TabType, label: 'History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-color)' : '2px solid transparent',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
        )}

        {!loading && activeTab === 'details' && (
          <DetailsTab node={node} />
        )}

        {!loading && activeTab === 'capabilities' && (
          <CapabilitiesTab capabilities={capabilities} />
        )}

        {!loading && activeTab === 'rules' && (
          <RulesTab rules={rules} />
        )}

        {!loading && activeTab === 'history' && (
          <HistoryTab history={history} />
        )}
      </div>
    </div>
  );
};

// Details Tab
interface DetailsTabProps {
  node: OntologyNode;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ node }) => {
  const props = node.properties || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Node Type */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
          Type
        </div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
          {node.type}
        </div>
      </div>

      {/* Node ID */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
          ID
        </div>
        <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
          {node.id}
        </div>
      </div>

      {/* Type-specific properties */}
      {node.type === 'DistributionCenter' && (
        <>
          {props.status !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Status
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {formatStatus(props.status)}
              </div>
            </div>
          )}

          {props.capacity !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Capacity
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {props.capacity.toLocaleString()}
              </div>
            </div>
          )}

          {props.capacity_utilization !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Utilization
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {formatPercentage(props.capacity_utilization)}
              </div>
            </div>
          )}

          {props.risk_score !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Risk Score
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                  {formatRiskScore(props.risk_score)}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: 500,
                    borderRadius: '12px',
                    backgroundColor: `${getRiskColor(props.risk_score)}20`,
                    color: getRiskColor(props.risk_score),
                  }}
                >
                  {getRiskLevel(props.risk_score)}
                </span>
              </div>
            </div>
          )}

          {props.geo_location !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Location
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {formatCoordinate(props.geo_location.latitude, props.geo_location.longitude)}
              </div>
            </div>
          )}
        </>
      )}

      {node.type === 'CustomerOrder' && (
        <>
          {props.priority !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Priority
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {formatPriority(props.priority)}
              </div>
            </div>
          )}

          {props.status !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Status
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {formatStatus(props.status)}
              </div>
            </div>
          )}

          {props.total_value !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Total Value

              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {formatCurrency(props.total_value)}
              </div>
            </div>
          )}

          {props.due_date !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Due Date
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {formatDateTime(props.due_date)}
              </div>
            </div>
          )}

          {props.predicted_delay_days !== undefined && props.predicted_delay_days > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Predicted Delay
              </div>
              <div style={{ fontSize: '13px', color: '#F59E0B' }}>
                {formatDuration(props.predicted_delay_days)}
              </div>
            </div>
          )}
        </>
      )}

      {node.type === 'Product' && (
        <>
          {props.category !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Category
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {props.category}
              </div>
            </div>
          )}

          {props.unit_cost !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Unit Cost
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {formatCurrency(props.unit_cost)}
              </div>
            </div>
          )}

          {props.lead_time !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Lead Time
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {formatDuration(props.lead_time)}
              </div>
            </div>
          )}
        </>
      )}

      {node.type === 'Capability' && (
        <>
          {props.name !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Name
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {props.name}
              </div>
            </div>
          )}

          {props.type !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Type
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {formatCapabilityType(props.type)}
              </div>
            </div>
          )}

          {props.active !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Active
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {props.active ? 'Yes' : 'No'}
              </div>
            </div>
          )}

          {props.description !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Description
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {props.description}
              </div>
            </div>
          )}

          {props.implementation !== undefined && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                Implementation
              </div>
              <code style={{ fontSize: '12px', color: 'var(--text-secondary)', backgroundColor: 'rgba(0,0,0,0.05)', padding: '4px 8px', borderRadius: '4px', display: 'block' }}>
                {props.implementation}
              </code>
            </div>
          )}
        </>
      )}

      {/* Timestamps */}
      {props.created_at !== undefined && props.updated_at !== undefined && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
            Created
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {formatDateTime(props.created_at)}
          </div>

          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
            Updated
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
            {formatDateTime(props.updated_at)}
          </div>
        </div>
      )}
    </div>
  );
};

// Capabilities Tab
interface CapabilitiesTabProps {
  capabilities: Capability[];
}

const CapabilitiesTab: React.FC<CapabilitiesTabProps> = ({ capabilities }) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  if (capabilities.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
        No capabilities found
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {capabilities.map((cap) => (
        <div
          key={cap.cap_id}
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'var(--card-bg)',
          }}
        >
          <button
            onClick={() => toggle(cap.cap_id)}
            style={{
              width: '100%',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              gap: '12px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {cap.name}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {formatCapabilityType(cap.type)}
              </span>
            </div>
            {expanded.has(cap.cap_id) ? (
              <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
            ) : (
              <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
            )}
          </button>

          {expanded.has(cap.cap_id) && (
            <div style={{ padding: '12px 16px', backgroundColor: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px', margin: '0 0 8px 0' }}>
                {cap.description}
              </p>
              <div style={{ fontSize: '13px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', margin: '0 0 4px 0' }}>
                  Implementation:
                </p>
                <code style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  display: 'block',
                }}>
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

// Rules Tab
interface RulesTabProps {
  rules: Rule[];
}

const RulesTab: React.FC<RulesTabProps> = ({ rules }) => {
  if (rules.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
        No rules defined
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {rules.map((rule) => (
        <div
          key={rule.id}
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: 'var(--card-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {rule.name}
            </h4>
            {rule.status === 'Satisfied' ? (
              <CheckCircle style={{ width: '20px', height: '20px', color: '#10B981' }} />
            ) : (
              <AlertCircle style={{ width: '20px', height: '20px', color: '#EF4444' }} />
            )}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px', margin: '0 0 8px 0' }}>
            {rule.description}
          </p>
          <code style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            backgroundColor: 'rgba(0,0,0,0.05)',
            padding: '6px 10px',
            borderRadius: '4px',
            display: 'block',
          }}>
            {rule.constraint}
          </code>
        </div>
      ))}
    </div>
  );
};

// History Tab
interface HistoryTabProps {
  history: HistoryEvent[];
}

const HistoryTab: React.FC<HistoryTabProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
        No history available
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {history.map((event, index) => (
        <div
          key={event.id}
          style={{
            display: 'flex',
            gap: '16px',
            paddingBottom: index < history.length - 1 ? '24px' : '0',
          }}
        >
          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }} />
            {index < history.length - 1 && (
              <div style={{ width: '1px', height: '100%', backgroundColor: 'var(--border-color)', marginTop: '4px' }} />
            )}
          </div>

          {/* Event */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
              {event.action}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
              {event.description}
            </p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 4px 0' }}>
              {formatDateTime(event.timestamp)}
            </p>
            {event.user && (
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                by {event.user}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
