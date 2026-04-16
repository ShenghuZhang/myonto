/**
 * Ontology Entity Types
 * Types for the AIP MVP ontology visualization system
 */

// Node Types
export type NodeType = 'DistributionCenter' | 'CustomerOrder' | 'Product' | 'Capability';

// DistributionCenter Status
export type DistributionCenterStatus = 'Active' | 'Down' | 'Critical';

// CustomerOrder Priority
export type CustomerOrderPriority = 'Critical' | 'High' | 'Standard';

// CustomerOrder Status
export type CustomerOrderStatus = 'Pending' | 'Allocated' | 'InTransit' | 'Delivered' | 'Cancelled' | 'Split';

// Capability Type
export type CapabilityType = 'LogicFunction' | 'Action' | 'PredictModel';

// Relationship Types
export type LinkType = 'CONTAINS' | 'SOURCED_FROM' | 'STOCKS' | 'HAS_CAPABILITY';

// Geographic Point
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// DistributionCenter Entity
export interface DistributionCenter {
  dc_id: string;
  geo_location: GeoPoint;
  capacity: number;
  capacity_utilization: number; // 0-1 float
  status: DistributionCenterStatus;
  risk_score: number; // 0-1 float
  created_at: string;
  updated_at: string;
}

// CustomerOrder Entity
export interface CustomerOrder {
  order_id: string;
  due_date: string;
  total_value: number;
  priority: CustomerOrderPriority;
  status: CustomerOrderStatus;
  predicted_delay_days: number;
  created_at: string;
  updated_at: string;
}

// Product Entity
export interface Product {
  sku_id: string;
  unit_cost: number;
  lead_time: number; // days
  category: string;
  created_at: string;
  updated_at: string;
}

// Capability Entity
export interface Capability {
  cap_id: string;
  name: string;
  type: CapabilityType;
  description: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  implementation: string; // Python module path
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Ontology Node (generic)
export interface OntologyNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, any>;
  capabilities?: Capability[];
  x?: number; // D3 simulation position
  y?: number; // D3 simulation position
  fx?: number; // Fixed x position
  fy?: number; // Fixed y position
}

// Ontology Link
export interface OntologyLink {
  id: string;
  source: string; // node ID
  target: string; // node ID
  type: LinkType;
  label?: string;
  properties?: Record<string, any>;
}

// Graph Data
export interface GraphData {
  nodes: OntologyNode[];
  links: OntologyLink[];
}

// Rule/Constraint
export interface Rule {
  id: string;
  name: string;
  description: string;
  constraint: string;
  status: 'Satisfied' | 'Violated' | 'Pending';
}

// History Event
export interface HistoryEvent {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  user?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface GraphResponse {
  nodes: OntologyNode[];
  links: OntologyLink[];
  metadata: {
    total_nodes: number;
    total_links: number;
    node_type_counts: Record<NodeType, number>;
  };
}

// Node Filter State
export interface NodeFilter {
  DistributionCenter: boolean;
  CustomerOrder: boolean;
  Product: boolean;
  Capability: boolean;
}

// Layout Types
export type LayoutType = 'force-directed' | 'hierarchical' | 'circular';

// Graph Viewport State
export interface GraphViewport {
  transform: {
    k: number; // scale
    x: number;
    y: number;
  };
}

// Mock Data Helpers
export const createDistributionCenter = (overrides?: Partial<DistributionCenter>): DistributionCenter => ({
  dc_id: 'DC_LON_01',
  geo_location: { latitude: 51.5074, longitude: -0.1278 },
  capacity: 10000,
  capacity_utilization: 0.65,
  status: 'Active',
  risk_score: 0.15,
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-07T00:00:00Z',
  ...overrides,
});

export const createCustomerOrder = (overrides?: Partial<CustomerOrder>): CustomerOrder => ({
  order_id: 'ORD_001',
  due_date: '2026-04-15T00:00:00Z',
  total_value: 15000.00,
  priority: 'Standard',
  status: 'Pending',
  predicted_delay_days: 0,
  created_at: '2026-04-07T00:00:00Z',
  updated_at: '2026-04-07T00:00:00Z',
  ...overrides,
});

export const createProduct = (overrides?: Partial<Product>): Product => ({
  sku_id: 'SKU_001',
  unit_cost: 25.00,
  lead_time: 5,
  category: 'Electronics',
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-07T00:00:00Z',
  ...overrides,
});

export const createCapability = (overrides?: Partial<Capability>): Capability => ({
  cap_id: 'CAP_001',
  name: 'CheckCapacity',
  type: 'LogicFunction',
  description: 'Check if DC has enough capacity',
  input_schema: { dc_id: 'string', required_capacity: 'number' },
  output_schema: { available: 'boolean', remaining: 'number' },
  implementation: 'aip.mvp.capabilities.check_capacity',
  active: true,
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-07T00:00:00Z',
  ...overrides,
});

// View Mode Types
export type ViewMode = 'graph' | 'split' | 'agent';

// Chat Message Types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

// Chat Request Types
export interface ChatRequest {
  query: string;
  conversation_history?: ChatMessage[];
  context?: {
    graph_data?: GraphData;
    selected_nodes?: string[];
  };
}

// SSE Stream Response Types
export interface StreamingResponse {
  event: 'message' | 'error' | 'done';
  data: string;
  error?: string;
}
