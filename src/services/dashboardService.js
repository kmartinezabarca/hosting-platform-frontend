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

// Dashboard API service
export const dashboardService = {
  // Get dashboard statistics
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get user services
  async getServices() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/services`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Get recent activity
  async getActivity() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/activity`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  }
};

export default dashboardService;

