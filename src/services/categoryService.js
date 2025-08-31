import apiClient from './apiClient';
import { useQuery } from '@tanstack/react-query';

const getCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};

const getCategoriesWithPlans = async () => {
  const response = await apiClient.get('/categories/with-plans');
  return response.data;
};

const getCategoryBySlug = async (slug) => {
  const response = await apiClient.get(`/categories/slug/${slug}`);
  return response.data;
};

export const useCategories = () => {
  return useQuery({ queryKey: ['categories'], queryFn: getCategories });
};

export const useCategoriesWithPlans = () => {
  return useQuery({ queryKey: ['categoriesWithPlans'], queryFn: getCategoriesWithPlans });
};

export const useCategoryBySlug = (slug) => {
  return useQuery({ queryKey: ['category', slug], queryFn: () => getCategoryBySlug(slug) });
};


