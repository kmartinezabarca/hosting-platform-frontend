import apiClient from './apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const getTickets = async () => {
  const response = await apiClient.get('/tickets');
  return response.data;
};

const getTicket = async (uuid) => {
  const response = await apiClient.get(`/tickets/${uuid}`);
  return response.data;
};

const createTicket = async (ticketData) => {
  const response = await apiClient.post('/tickets', ticketData);
  return response.data;
};

const updateTicket = async ({ uuid, data }) => {
  const response = await apiClient.put(`/tickets/${uuid}`, data);
  return response.data;
};

const deleteTicket = async (uuid) => {
  const response = await apiClient.delete(`/tickets/${uuid}`);
  return response.data;
};

export const useTickets = () => {
  return useQuery({ queryKey: ['tickets'], queryFn: getTickets });
};

export const useTicket = (uuid) => {
  return useQuery({ queryKey: ['ticket', uuid], queryFn: () => getTicket(uuid) });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket'] });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};


