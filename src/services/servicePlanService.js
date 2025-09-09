import apiClient from './apiClient';

class ServicePlansService {
  // Public methods (no authentication required)
  async getServicePlans(categoryId = null) {
    try {
      const endpoint = categoryId 
        ? `/service-plans?category_id=${categoryId}` 
        : '/service-plans';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching service plans:', error);
      throw error;
    }
  }

  async getServicePlansByCategorySlug(categorySlug) {
    try {
      const response = await apiClient.get(`/service-plans/category/${categorySlug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service plans by category:', error);
      throw error;
    }
  }

  async getServicePlan(uuid) {
    try {
      const response = await apiClient.get(`/service-plans/${uuid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service plan:', error);
      throw error;
    }
  }

  async getServicePlanAddOns(planSlug) {
    try {
      const response = await apiClient.get(`/service-plans/add-ons/${planSlug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service plan add-ons:', error);
      throw error;
    }
  }

  // Admin methods (authentication required)
  async createServicePlan(planData) {
    try {
      const response = await apiClient.post('/admin/service-plans', planData);
      return response.data;
    } catch (error) {
      console.error('Error creating service plan:', error);
      throw error;
    }
  }

  async updateServicePlan(uuid, planData) {
    try {
      const response = await apiClient.put(`/admin/service-plans/${uuid}`, planData);
      return response.data;
    } catch (error) {
      console.error('Error updating service plan:', error);
      throw error;
    }
  }

  async deleteServicePlan(uuid) {
    try {
      const response = await apiClient.delete(`/admin/service-plans/${uuid}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting service plan:', error);
      throw error;
    }
  }

  // Helper methods
  async getCategories() {
    try {
      const response = await apiClient.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getBillingCycles() {
    try {
      const response = await apiClient.get('/billing-cycles');
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

