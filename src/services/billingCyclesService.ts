import apiClient from './apiClient';
import type { ApiResponse } from '@/types/api';

export interface BillingCycle {
  id: number;
  uuid: string;
  name: string;
  months: number;
  discount_percentage?: number;
  [key: string]: unknown;
}

/**
 * Servicio para operaciones relacionadas con ciclos de facturación
 */
const billingCyclesService = {
  /**
   * Obtener todos los ciclos de facturación disponibles
   */
  getBillingCycles: async (): Promise<ApiResponse<BillingCycle[]>> => {
    const response = await apiClient.get<ApiResponse<BillingCycle[]>>('/billing-cycles');
    return response.data;
  },
};

export default billingCyclesService;
