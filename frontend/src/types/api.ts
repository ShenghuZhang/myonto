/**
 * API Response Types
 * Types for API layer
 */

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}
