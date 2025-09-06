
import apiClient from './apiClient';


// Dashboard API service
export const dashboardService = {
  // Get dashboard statistics
  async getStats() {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get user services
  async getServices() {
    try {
      const response = await apiClient.get('/dashboard/services');
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Get recent activity
  async getActivity() {
    try {
      const response = await apiClient.get('/dashboard/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  }
};

export default dashboardService;
