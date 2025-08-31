import apiClient from './apiClient';
import { useQuery } from '@tanstack/react-query';

const getDashboardStats = async () => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
};

export const useDashboardStats = () => {
  return useQuery({ queryKey: ['dashboardStats'], queryFn: getDashboardStats });
};


