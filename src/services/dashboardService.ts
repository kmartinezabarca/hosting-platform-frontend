
import apiClient from './apiClient';
import type { ApiResponse } from '@/types/api';
import type { DashboardStats, DashboardService, ActivityItem } from '@/types/models';

// Dashboard API service
export const dashboardService = {
  // Get dashboard statistics
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get user services
  async getServices(): Promise<ApiResponse<DashboardService[]>> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardService[]>>('/dashboard/services');
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Get recent activity
  async getActivity(): Promise<ApiResponse<ActivityItem[]>> {
    try {
      const response = await apiClient.get<ApiResponse<ActivityItem[]>>('/dashboard/activity');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw error;
    }
  }
};

export default dashboardService;
