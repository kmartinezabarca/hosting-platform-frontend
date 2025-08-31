import apiClient from './apiClient';
import { useQuery } from '@tanstack/react-query';

const getBillingCycles = async () => {
  const response = await apiClient.get('/billing-cycles');
  return response.data;
};

export const useBillingCycles = () => {
  return useQuery({ queryKey: ['billingCycles'], queryFn: getBillingCycles });
};


