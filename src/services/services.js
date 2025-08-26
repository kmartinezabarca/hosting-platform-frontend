const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Get authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Create headers with authentication
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Services API service
export const servicesService = {
  // Get available service plans
  async getServicePlans() {
    try {
      const response = await fetch(`${API_BASE_URL}/services/plans`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching service plans:', error);
      throw error;
    }
  },

  // Contract a new service
  async contractService(serviceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/contract`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(serviceData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error contracting service:', error);
      throw error;
    }
  },

  // Process payment for service
  async processPayment(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Get user's services
  async getUserServices() {
    try {
      const response = await fetch(`${API_BASE_URL}/services/user`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user services:', error);
      throw error;
    }
  },

  // Get service details
  async getServiceDetails(serviceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching service details:', error);
      throw error;
    }
  },

  // Update service configuration
  async updateServiceConfig(serviceId, configData) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}/config`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(configData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating service config:', error);
      throw error;
    }
  },

  // Cancel service
  async cancelService(serviceId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}/cancel`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error canceling service:', error);
      throw error;
    }
  },

  // Suspend service
  async suspendService(serviceId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}/suspend`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error suspending service:', error);
      throw error;
    }
  },

  // Reactivate service
  async reactivateService(serviceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}/reactivate`, {
        method: 'POST',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error reactivating service:', error);
      throw error;
    }
  },

  // Get service usage statistics
  async getServiceUsage(serviceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}/usage`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching service usage:', error);
      throw error;
    }
  },

  // Get service backups
  async getServiceBackups(serviceId) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}/backups`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching service backups:', error);
      throw error;
    }
  },

  // Create service backup
  async createServiceBackup(serviceId, backupName) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}/backups`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ name: backupName })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating service backup:', error);
      throw error;
    }
  },

  // Restore service backup
  async restoreServiceBackup(serviceId, backupId) {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${serviceId}/backups/${backupId}/restore`, {
        method: 'POST',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error restoring service backup:', error);
      throw error;
    }
  }
};

export default servicesService;

