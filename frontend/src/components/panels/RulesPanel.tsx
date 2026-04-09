/**
 * RulesPanel Component
 * Display rules and constraints
 */

import React, { useState, useEffect } from 'react';
import { Rule } from '../../types/ontology';
import { ontologyApi } from '../../api/ontology';
import { CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

interface RulesPanelProps {
  nodeType: string;
}

export const RulesPanel: React.FC<RulesPanelProps> = ({ nodeType }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        setLoading(true);
        const data = await ontologyApi.getRules(nodeType);
        setRules(data);
      } catch (error) {
        console.error('Error fetching rules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, [nodeType]);

  const getStatusIcon = (status: Rule['status']) => {
    switch (status) {
      case 'Satisfied':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Violated':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Rule['status']): string => {
    switch (status) {
      case 'Satisfied':
        return 'green';
      case 'Violated':
        return 'red';
      case 'Pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (rules.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No rules defined
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className={`border rounded-lg p-4 ${
            rule.status === 'Violated' ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-gray-900">{rule.name}</h4>
            {getStatusIcon(rule.status)}
          </div>
          <p className="text-sm text-gray-700 mb-2">{rule.description}</p>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                rule.status === 'Satisfied'
                  ? 'bg-green-100 text-green-800'
                  : rule.status === 'Violated'
                  ? 'bg-red-100 text与其他800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {rule.status}
            </span>
          </div>
          <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded block mt-2">
            {rule.constraint}
          </code>
        </div>
      ))}
    </div>
  );
};
