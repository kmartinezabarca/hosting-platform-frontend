import apiClient from './apiClient';
import { useQuery } from '@tanstack/react-query';

const getProducts = async () => {
  const response = await apiClient.get('/products');
  return response.data;
};

const getProductsByServiceType = async (serviceType) => {
  const response = await apiClient.get(`/products/service-type/${serviceType}`);
  return response.data;
};

export const useProducts = () => {
  return useQuery({ queryKey: ['products'], queryFn: getProducts });
};

export const useProductsByServiceType = (serviceType) => {
  return useQuery({ queryKey: ['products', serviceType], queryFn: () => getProductsByServiceType(serviceType) });
};


