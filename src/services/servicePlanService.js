import apiClient from './apiClient';
import { useQuery } from '@tanstack/react-query';

const getServicePlans = async (categoryId = null) => {
  const endpoint = categoryId 
    ? `/service-plans?category_id=${categoryId}` 
    : '/service-plans';
  const response = await apiClient.get(endpoint);
  return response.data;
};

const getServicePlansByCategorySlug = async (categorySlug) => {
  const response = await apiClient.get(`/service-plans/category/${categorySlug}`);
  return response.data;
};

const getServicePlan = async (uuid) => {
  const response = await apiClient.get(`/service-plans/${uuid}`);
  return response.data;
};

export const useServicePlans = (categoryId = null) => {
  return useQuery({ queryKey: ['servicePlans', categoryId], queryFn: () => getServicePlans(categoryId) });
};

export const useServicePlansByCategorySlug = (categorySlug) => {
  return useQuery({ queryKey: ['servicePlansByCategory', categorySlug], queryFn: () => getServicePlansByCategorySlug(categorySlug) });
};

export const useServicePlan = (uuid) => {
  return useQuery({ queryKey: ['servicePlan', uuid], queryFn: () => getServicePlan(uuid) });
};


