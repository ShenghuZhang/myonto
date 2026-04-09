/**
 * Ontology API
 * API endpoints for ontology graph data
 */

import apiClient from './client';
import {
  OntologyNode,
  OntologyLink,
  GraphData,
  Capability,
  Rule,
  HistoryEvent,
} from '../types/ontology';

class OntologyApi {
  /**
   * Get graph data with nodes and links
   */
  async getGraphData(): Promise<GraphData> {
    try {
      const response = await apiClient.get<GraphData>('/api/v1/graph');
      return response.data;
    } catch (error) {
      // Return mock data if API is unavailable
      console.warn('API unavailable, using mock data');
      return this.getMockGraphData();
    }
  }

  /**
   * Get node details by ID
   */
  async getNode(id: string): Promise<OntologyNode> {
    const response = await apiClient.get<OntologyNode>(`/api/v1/nodes/${id}`);
    return response.data;
  }

  /**
   * Get nodes by type
   */
  async getNodesByType(type: string): Promise<OntologyNode[]> {
    const response = await apiClient.get<OntologyNode[]>(`/api/v1/nodes?type=${type}`);
    return response.data;
  }

  /**
   * Search nodes by query
   */
  async searchNodes(query: string): Promise<OntologyNode[]> {
    const response = await apiClient.get<OntologyNode[]>(`/api/v1/nodes/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  /**
   * Get node capabilities
   */
  async getNodeCapabilities(nodeId: string): Promise<Capability[]> {
    const response = await apiClient.get<Capability[]>(`/api/v1/nodes/${nodeId}/capabilities`);
    return response.data;
  }

  /**
   * Get rules for node type
   */
  async getRules(nodeType: string): Promise<Rule[]> {
    const response = await apiClient.get<Rule[]>(`/api/v1/rules?node_type=${nodeType}`);
    return response.data;
  }

  /**
   * Get node history
   */
  async getNodeHistory(nodeId: string): Promise<HistoryEvent[]> {
    const response = await apiClient.get<HistoryEvent[]>(`/api/v1/nodes/${nodeId}/history`);
    return response.data;
  }

  /**
   * Create new node
   */
  async createNode(node: Partial<OntologyNode>): Promise<OntologyNode> {
    const response = await apiClient.post<OntologyNode>('/api/v1/nodes', node);
    return response.data;
  }

  /**
   * Update node
   */
  async updateNode(id: string, node: Partial<OntologyNode>): Promise<OntologyNode> {
    const response = await apiClient.put<OntologyNode>(`/api/v1/nodes/${id}`, node);
    return response.data;
  }

  /**
   * Delete node
   */
  async deleteNode(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/nodes/${id}`);
  }

  /**
   * Create new link
   */
  async createLink(link: Partial<OntologyLink>): Promise<OntologyLink> {
    const response = await apiClient.post<OntologyLink>('/api/v1/links', link);
    return response.data;
  }

  /**
   * Delete link
   */
  async deleteLink(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/links/${id}`);
  }

  /**
   * Mock graph data for development/testing
   */
  private getMockGraphData(): GraphData {
    return {
      nodes: [
        // Distribution Centers
        {
          id: 'DC_LON_01',
          type: 'DistributionCenter',
          label: 'DC_LON_01',
          properties: {
            dc_id: 'DC_LON_01',
            geo_location: { latitude: 51.5074, longitude: -0.1278 },
            capacity: 10000,
            capacity_utilization: 0.65,
            status: 'Active',
            risk_score: 0.15,
          },
        },
        {
          id: 'DC_LON_02',
          type: 'DistributionCenter',
          label: 'DC_LON_02',
          properties: {
            dc_id: 'DC_LON_02',
            geo_location: { latitude: 51.5074, longitude: -0.1278 },
            capacity: 8000,
            capacity_utilization: 0.75,
            status: 'Active',
            risk_score: 0.10,
          },
        },
        {
          id: 'DC_MUC_01',
          type: 'DistributionCenter',
          label: 'DC_MUC_01',
          properties: {
            dc_id: 'DC_MUC_01',
            geo_location: { latitude: 48.1351, longitude: 11.5820 },
            capacity: 12000,
            capacity_utilization: 0.88,
            status: 'Active',
            risk_score: 0.65,
          },
        },
        {
          id: 'DC_MUC_02',
          type: 'DistributionCenter',
          label: 'DC_MUC_02',
          properties: {
            dc_id: 'DC_MUC_02',
            geo_location: { latitude: 48.1351, longitude: 11.5820 },
            capacity: 6000,
            capacity_utilization: 0.80,
            status: 'Active',
            risk_score: 0.25,
          },
        },
        // Products
        {
          id: 'SKU_ELECTRONICS_001',
          type: 'Product',
          label: 'SKU_ELEC_001',
          properties: {
            sku_id: 'SKU_ELECTRONICS_001',
            unit_cost: 150.00,
            lead_time: 7,
            category: 'Electronics',
          },
        },
        {
          id: 'SKU_FURNITURE_001',
          type: 'Product',
          label: 'SKU_FURN_001',
          properties: {
            sku_id: 'SKU_FURNITURE_001',
            unit_cost: 200.00,
            lead_time: 14,
            category: 'Furniture',
          },
        },
        {
          id: 'SKU_CLOTHING_001',
          type: 'Product',
          label: 'SKU_CLOTH_001',
          properties: {
            sku_id: 'SKU_CLOTHING_001',
            unit_cost: 50.00,
            lead_time: 5,
            category: 'Clothing',
          },
        },
        // Customer Orders
        {
          id: 'ORD_001',
          type: 'CustomerOrder',
          label: 'ORD_001',
          properties: {
            order_id: 'ORD_001',
            due_date: '2026-04-15T00:00:00Z',
            total_value: 450.00,
            priority: 'Critical',
            status: 'Pending',
            predicted_delay_days: 0,
          },
        },
        {
          id: 'ORD_002',
          type: 'CustomerOrder',
          label: 'ORD_002',
          properties: {
            order_id: 'ORD_002',
            due_date: '2026-04-21T00:00:00Z',
            total_value: 600.00,
            priority: 'High',
            status: 'Pending',
            predicted_delay_days: 0,
          },
        },
        {
          id: 'ORD_003',
          type: 'CustomerOrder',
          label: 'ORD_003',
          properties: {
            order_id: 'ORD_003',
            due_date: '2026-04-17T00:00:00Z',
            total_value: 300.00,
            priority: 'Standard',
            status: 'Pending',
            predicted_delay_days: 0,
          },
        },
        {
          id: 'ORD_004',
          type: 'CustomerOrder',
          label: 'ORD_004',
          properties: {
            order_id: 'ORD_004',
            due_date: '2026-04-14T00:00:00Z',
            total_value: 200.00,
            priority: 'Critical',
            status: 'Pending',
            predicted_delay_days: 0,
          },
        },
        // Capabilities
        {
          id: 'CAP_DC_CHECK_CAPACITY',
          type: 'Capability',
          label: 'CheckCapacity',
          properties: {
            cap_id: 'CAP_DC_CHECK_CAPACITY',
            name: 'CheckCapacity',
            type: 'LogicFunction',
            description: 'Check if DC has sufficient capacity',
            active: true,
          },
        },
        {
          id: 'CAP_DC_UPDATE_STATUS',
          type: 'Capability',
          label: 'UpdateStatus',
          properties: {
            cap_id: 'CAP_DC_UPDATE_STATUS',
            name: 'UpdateStatus',
            type: 'Action',
            description: 'Update DC status',
            active: true,
          },
        },
        {
          id: 'CAP_ORDER_REALLOCATE',
          type: 'Capability',
          label: 'ReallocateOrders',
          properties: {
            cap_id: 'CAP_ORDER_REALLOCATE',
            name: 'ReallocateOrders',
            type: 'Action',
            description: 'Reallocate orders to different DC',
            active: true,
          },
        },
      ],
      links: [
        // Orders contain products
        { id: 'L1', source: 'ORD_001', target: 'SKU_ELECTRONICS_001', type: 'CONTAINS', label: 'CONTAINS' },
        { id: 'L2', source: 'ORD_002', target: 'SKU_FURNITURE_001', type: 'CONTAINS', label: 'CONTAINS' },
        { id: 'L3', source: 'ORD_003', target: 'SKU_CLOTHING_001', type: 'CONTAINS', label: 'CONTAINS' },
        { id: 'L4', source: 'ORD_004', target: 'SKU_ELECTRONICS_001', type: 'CONTAINS', label: 'CONTAINS' },
        // Orders sourced from DCs
        { id: 'L5', source: 'ORD_001', target: 'DC_LON_02', type: 'SOURCED_FROM', label: 'SOURCED_FROM' },
        { id: 'L6', source: 'ORD_002', target: 'DC_LON_02', type: 'SOURCED_FROM', label: 'SOURCED_FROM' },
        { id: 'L7', source: 'ORD_003', target: 'DC_MUC_01', type: 'SOURCED_FROM', label: 'SOURCED_FROM' },
        { id: 'L8', source: 'ORD_004', target: 'DC_LON_02', type: 'SOURCED_FROM', label: 'SOURCED_FROM' },
        // DCs stock products
        { id: 'L9', source: 'DC_LON_01', target: 'SKU_ELECTRONICS_001', type: 'STOCKS', label: 'STOCKS' },
        { id: 'L10', source: 'DC_LON_02', target: 'SKU_ELECTRONICS_001', type: 'STOCKS', label: 'STOCKS' },
        { id: 'L11', source: 'DC_LON_02', target: 'SKU_FURNITURE_001', type: 'STOCKS', label: 'STOCKS' },
        { id: 'L12', source: 'DC_MUC_01', target: 'SKU_CLOTHING_001', type: 'STOCKS', label: 'STOCKS' },
        { id: 'L13', source: 'DC_MUC_02', target: 'SKU_CLOTHING_001', type: 'STOCKS', label: 'STOCKS' },
        // DCs have capabilities
        { id: 'L14', source: 'DC_LON_01', target: 'CAP_DC_CHECK_CAPACITY', type: 'HAS_CAPABILITY', label: 'HAS_CAPABILITY' },
        { id: 'L15', source: 'DC_LON_02', target: 'CAP_DC_CHECK_CAPACITY', type: 'HAS_CAPABILITY', label: 'HAS_CAPABILITY' },
        { id: 'L16', source: 'DC_MUC_01', target: 'CAP_DC_CHECK_CAPACITY', type: 'HAS_CAPABILITY', label: 'HAS_CAPABILITY' },
        { id: 'L17', source: 'DC_MUC_02', target: 'CAP_DC_UPDATE_STATUS', type: 'HAS_CAPABILITY', label: 'HAS_CAPABILITY' },
      ],
    };
  }
}

export const ontologyApi = new OntologyApi();
