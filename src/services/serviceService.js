import apiClient from './apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const getServices = async () => {
  const response = await apiClient.get('/services');
  return response.data;
};

const createService = async (serviceData) => {
  const response = await apiClient.post('/services', serviceData);
  return response.data;
};

const getService = async (uuid) => {
  const response = await apiClient.get(`/services/${uuid}`);
  return response.data;
};

const updateService = async ({ uuid, data }) => {
  const response = await apiClient.put(`/services/${uuid}`, data);
  return response.data;
};

const deleteService = async (uuid) => {
  const response = await apiClient.delete(`/services/${uuid}`);
  return response.data;
};

export const useServices = () => {
  return useQuery({ queryKey: ['services'], queryFn: getServices });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useService = (uuid) => {
  return useQuery({ queryKey: ['service', uuid], queryFn: () => getService(uuid) });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service'] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};


