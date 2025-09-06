import apiClient from './apiClient';
import paymentService from './paymentService';

export const servicesService = {
  // Get available service plans
  async getServicePlans() {
    try {
      const response = await apiClient.get('/services/plans');
      return response.data;
    } catch (error) {
      console.error("Error fetching service plans:", error);
      throw error;
    }
  },

  /**
   * Fetch the list of add-ons available for the specified plan.
   * @param {string|number} planId Identifier of the plan (uuid or slug)
   */
  async getPlanAddOns(planId) {
    try {
      const response = await apiClient.get(`/service-plans/add-ons/${planId}`);
      return response.data;
    } catch (err) {
      console.error("getPlanAddOns error:", err);
      // Lanzamos el error para que React Query pueda manejarlo.
      throw err;
    }
  },

  // Contract a new service
  async contractService(serviceData) {
    try {
      const response = await apiClient.post('/services/contract', serviceData);
      return response.data;
    } catch (error) {
      console.error("Error contracting service:", error);
      throw error;
    }
  },

  // Process payment for service (delegado a paymentService)
  async processPayment(paymentData) {
    return paymentService.processPayment(paymentData);
  },

  // Get user's services
  async getUserServices() {
    try {
      const response = await apiClient.get('/services/user');
      return response.data;
    } catch (error) {
      console.error("Error fetching user services:", error);
      throw error;
    }
  },

  // Get service details
  async getServiceDetails(serviceId) {
    try {
      const response = await apiClient.get(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching service details:", error);
      throw error;
    }
  },

  // Update service configuration
  async updateServiceConfig(serviceId, configData) {
    try {
      const response = await apiClient.put(`/services/${serviceId}/config`, configData);
      return response.data;
    } catch (error) {
      console.error("Error updating service config:", error);
      throw error;
    }
  },

  // Cancel service
  async cancelService(serviceId, reason) {
    try {
      const response = await apiClient.post(`/services/${serviceId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error("Error canceling service:", error);
      throw error;
    }
  },

  // Suspend service
  async suspendService(serviceId, reason) {
    try {
      const response = await apiClient.post(`/services/${serviceId}/suspend`, { reason });
      return response.data;
    } catch (error) {
      console.error("Error suspending service:", error);
      throw error;
    }
  },

  // Reactivate service
  async reactivateService(serviceId) {
    try {
      const response = await apiClient.post(`/services/${serviceId}/reactivate`);
      return response.data;
    } catch (error) {
      console.error("Error reactivating service:", error);
      throw error;
    }
  },

  // Get service usage statistics
  async getServiceUsage(serviceId) {
    try {
      const response = await apiClient.get(`/services/${serviceId}/usage`);
      return response.data;
    } catch (error) {
      console.error("Error fetching service usage:", error);
      throw error;
    }
  },

  // Get service backups
  async getServiceBackups(serviceId) {
    try {
      const response = await apiClient.get(`/services/${serviceId}/backups`);
      return response.data;
    } catch (error) {
      console.error("Error fetching service backups:", error);
      throw error;
    }
  },

  // Create service backup
  async createServiceBackup(serviceId, backupName) {
    try {
      const response = await apiClient.post(`/services/${serviceId}/backups`, { name: backupName });
      return response.data;
    } catch (error) {
      console.error("Error creating service backup:", error);
      throw error;
    }
  },

  // Restore service backup
  async restoreServiceBackup(serviceId, backupId) {
    try {
      const response = await apiClient.post(`/services/${serviceId}/backups/${backupId}/restore`);
      return response.data;
    } catch (error) {
      console.error("Error restoring service backup:", error);
      throw error;
    }
  },

  async updateServiceConfiguration(serviceId, config) {
    try {
    const response = await apiClient.patch(`/services/${serviceId}/configuration`, config);
    return response.data;
    } catch (error) {
      console.error("Error updating service configuration:", error);
      throw error;
    }
  },

  async getServiceInvoices(serviceId) {
    try {
      const response = await apiClient.get(`/services/${serviceId}/invoices`);
      return response.data;
    } catch (error) {
      console.error("Error fetching service invoices:", error);
      throw error;
    }
  },
};

export default servicesService;