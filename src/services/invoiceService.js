import apiClient from './apiClient';
import { useQuery } from '@tanstack/react-query';

const getInvoices = async () => {
  const response = await apiClient.get('/invoices');
  return response.data;
};

const getInvoice = async (uuid) => {
  const response = await apiClient.get(`/invoices/${uuid}`);
  return response.data;
};

export const useInvoices = () => {
  return useQuery({ queryKey: ['invoices'], queryFn: getInvoices });
};

export const useInvoice = (uuid) => {
  return useQuery({ queryKey: ['invoice', uuid], queryFn: () => getInvoice(uuid) });
};


