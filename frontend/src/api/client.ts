/**
 * API Client
 * Base API client configuration
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '../types/api';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const apiError: ApiError = {
          message: error.message || 'An error occurred',
          code: error.code,
          details: error.response?.data,
        };
        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return this.wrapResponse(response);
    } catch (error) {
      throw this.handleError(error as ApiError);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return this.wrapResponse(response);
    } catch (error) {
      throw this.handleError(error as ApiError);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return this.wrapResponse(response);
    } catch (error) {
      throw this.handleError(error as ApiError);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return this.wrapResponse(response);
    } catch (error) {
      throw this.handleError(error as ApiError);
    }
  }

  private wrapResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  private handleError(error: ApiError): Error {
    return new Error(error.message);
  }

  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
    this.client.defaults.baseURL = baseURL;
  }
}

// Singleton instance
const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000');

export default apiClient;
