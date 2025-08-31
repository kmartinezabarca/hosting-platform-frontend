import apiClient from './apiClient';
import { useQuery, useMutation } from '@tanstack/react-query';

const getDomains = async () => {
  const response = await apiClient.get('/domains');
  return response.data;
};

const checkDomainAvailability = async (domain) => {
  const response = await apiClient.post('/domains/check-availability', { domain });
  return response.data;
};

export const useDomains = () => {
  return useQuery({ queryKey: ['domains'], queryFn: getDomains });
};

export const useCheckDomainAvailability = () => {
  return useMutation({ mutationFn: checkDomainAvailability });
};


