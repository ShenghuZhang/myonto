/**
 * EntityDetails Component
 * Generic entity detail view
 */

import React from 'react';
import { OntologyNode } from '../../types/ontology';
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
} from '../../utils/formatters';

interface EntityDetailsProps {
  node: OntologyNode;
}

export const EntityDetails: React.FC<EntityDetailsProps> = ({ node }) => {
  const props = node.properties;

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Basic Information</h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600">ID</dt>
            <dd className="text-sm text-gray-900 font-mono">{node.id}</dd>
          </div>

          {node.type === 'DistributionCenter' && (
            <>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Status</dt>
                <dd className="text-sm">{formatStatus(props.status)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Capacity</dt>
                <dd className="text-sm text-gray-900">{props.capacity.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Utilization</dt>
                <dd className="text-sm text-gray-900">{formatPercentage(props.capacity_utilization)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-gray-600">Risk Score</dt>
                <div className="flex items-center gap-2">
                  <dd className="text-sm text-gray-900">{formatRiskScore(props.risk_score)}</dd>
                  <span
                    className="px-2 py-0.5 text-xs font-medium rounded-full"
                    style={{ backgroundColor: `${getRiskColor(props.risk_score)}20`, color: getRiskColor(props.risk_score) }}
                  >
                    {getRiskLevel(props.risk_score)}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <dt className="text-sm text-gray-600">Location</dt>
                <dd className="text-sm text-gray-900">
                  {formatCoordinate(props.geo_location.latitude, props.geo_location.longitude)}
                </dd>
              </div>
            </>
          )}

          {node.type === 'CustomerOrder' && (
            <>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Priority</dt>
                <dd className="text-sm">{formatPriority(props.priority)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Status</dt>
                <dd className="text-sm">{formatStatus(props.status)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Total Value</dt>
                <dd className="text-sm text-gray-900">{formatCurrency(props.total_value)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Due Date</dt>
                <dd className="text-sm text-gray-900">{formatDateTime(props.due_date)}</dd>
              </div>
              {props.predicted_delay_days > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Predicted Delay</dt>
                  <dd className="text-sm text-orange-600">{formatDuration(props.predicted_delay_days)}</dd>
                </div>
              )}
            </>
          )}

          {node.type === 'Product' && (
            <>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Category</dt>
                <dd className="text-smtext-gray-900">{props.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Unit Cost</dt>
                <dd className="text-sm text-gray-900">{formatCurrency(props.unit_cost)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Lead Time</dt>
                <dd className="text-sm text-gray-900">{formatDuration(props.lead_time)}</dd>
              </div>
            </>
          )}
        </dl>
      </div>

      {/* Timestamps */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Timestamps</h3>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600">Created</dt>
            <dd className="text-sm text-gray-900">{formatDateTime(props.created_at)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-600">Updated</dt>
            <dd className="text-sm text-gray-900">{formatDateTime(props.updated_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
