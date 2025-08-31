import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

class AddOnsService {
  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Public methods (no authentication required)
  async getAddOns(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.is_active !== undefined) {
        queryParams.append('is_active', params.is_active);
      }
      if (params.search) {
        queryParams.append('search', params.search);
      }

      const endpoint = `/add-ons${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching add-ons:', error);
      throw error;
    }
  }

  async getActiveAddOns() {
    try {
      const response = await axios.get('/add-ons/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active add-ons:', error);
      throw error;
    }
  }

  async getAddOn(uuid) {
    try {
      const response = await axios.get(`/add-ons/${uuid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching add-on:', error);
      throw error;
    }
  }

  async getAddOnsByServicePlan(planUuid) {
    try {
      const response = await axios.get(`/add-ons/service-plan/${planUuid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching add-ons by service plan:', error);
      throw error;
    }
  }

  // Admin methods (authentication required)
  async createAddOn(addOnData) {
    try {
      const response = await axios.post('/admin/add-ons', addOnData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating add-on:', error);
      throw error;
    }
  }

  async updateAddOn(uuid, addOnData) {
    try {
      const response = await axios.put(`/admin/add-ons/${uuid}`, addOnData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating add-on:', error);
      throw error;
    }
  }

  async deleteAddOn(uuid) {
    try {
      const response = await axios.delete(`/admin/add-ons/${uuid}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting add-on:', error);
      throw error;
    }
  }

  async attachAddOnToPlan(addOnUuid, planData) {
    try {
      const response = await axios.post(`/admin/add-ons/${addOnUuid}/attach-plan`, planData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error attaching add-on to plan:', error);
      throw error;
    }
  }

  async detachAddOnFromPlan(addOnUuid, planData) {
    try {
      const response = await axios.post(`/admin/add-ons/${addOnUuid}/detach-plan`, planData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error detaching add-on from plan:', error);
      throw error;
    }
  }

  // Helper methods
  async getServicePlans() {
    try {
      const response = await axios.get('/service-plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching service plans:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const addOnsService = new AddOnsService();
export default addOnsService;

// Export individual methods for convenience
export const {
  getAddOns,
  getActiveAddOns,
  getAddOn,
  getAddOnsByServicePlan,
  createAddOn,
  updateAddOn,
  deleteAddOn,
  attachAddOnToPlan,
  detachAddOnFromPlan,
  getServicePlans,
} = addOnsService;

