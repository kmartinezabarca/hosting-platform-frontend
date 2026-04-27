import apiClient from './apiClient';
import type { ApiResponse, PaginatedResponse, MessageResponse } from '@/types/api';
import type { ServicePlan } from '@/types/models';

export interface Category {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  [key: string]: unknown;
}

export interface BillingCycle {
  id: number;
  uuid: string;
  name: string;
  months: number;
  [key: string]: unknown;
}

export interface ServicePlanCreateData {
  name: string;
  price: number;
  billing_cycle_id: number;
  category_id?: number;
  features?: string[];
  [key: string]: unknown;
}

class ServicePlansService {
  // Public methods (no authentication required)
  async getServicePlans(categoryId: string | number | null = null): Promise<ApiResponse<ServicePlan[]>> {
    try {
      const endpoint = categoryId
        ? `/service-plans?category_id=${categoryId}`
        : '/service-plans';
      const response = await apiClient.get<ApiResponse<ServicePlan[]>>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching service plans:', error);
      throw error;
    }
  }

  async getServicePlansByCategorySlug(categorySlug: string): Promise<ApiResponse<ServicePlan[]>> {
    try {
      const response = await apiClient.get<ApiResponse<ServicePlan[]>>(`/service-plans/category/${categorySlug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service plans by category:', error);
      throw error;
    }
  }

  async getServicePlan(uuid: string): Promise<ApiResponse<ServicePlan>> {
    try {
      const response = await apiClient.get<ApiResponse<ServicePlan>>(`/service-plans/${uuid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service plan:', error);
      throw error;
    }
  }

  async getServicePlanAddOns(planSlug: string): Promise<ApiResponse<unknown[]>> {
    try {
      const response = await apiClient.get<ApiResponse<unknown[]>>(`/service-plans/add-ons/${planSlug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service plan add-ons:', error);
      throw error;
    }
  }

  // Admin methods (authentication required)
  async createServicePlan(planData: ServicePlanCreateData): Promise<ApiResponse<ServicePlan>> {
    try {
      const response = await apiClient.post<ApiResponse<ServicePlan>>('/admin/service-plans', planData);
      return response.data;
    } catch (error) {
      console.error('Error creating service plan:', error);
      throw error;
    }
  }

  async updateServicePlan(uuid: string, planData: Partial<ServicePlanCreateData>): Promise<ApiResponse<ServicePlan>> {
    try {
      const response = await apiClient.put<ApiResponse<ServicePlan>>(`/admin/service-plans/${uuid}`, planData);
      return response.data;
    } catch (error) {
      console.error('Error updating service plan:', error);
      throw error;
    }
  }

  async deleteServicePlan(uuid: string): Promise<MessageResponse> {
    try {
      const response = await apiClient.delete<MessageResponse>(`/admin/service-plans/${uuid}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting service plan:', error);
      throw error;
    }
  }

  // Helper methods
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getBillingCycles(): Promise<ApiResponse<BillingCycle[]>> {
    try {
      const response = await apiClient.get<ApiResponse<BillingCycle[]>>('/billing-cycles');
      return response.data;
    } catch (error) {
      console.error('Error fetching billing cycles:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const servicePlansService = new ServicePlansService();
export default servicePlansService;

// Export individual methods for convenience
export const {
  getServicePlans,
  getServicePlansByCategorySlug,
  getServicePlan,
  getServicePlanAddOns,
  createServicePlan,
  updateServicePlan,
  deleteServicePlan,
  getCategories,
  getBillingCycles,
} = servicePlansService;
