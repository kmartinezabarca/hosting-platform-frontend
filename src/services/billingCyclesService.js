import apiClient from './apiClient';

/**
 * Servicio para operaciones relacionadas con ciclos de facturación
 */
const billingCyclesService = {
  /**
   * Obtener todos los ciclos de facturación disponibles
   */
  getBillingCycles: async () => {
    const response = await apiClient.get('/billing-cycles');
    return response.data;
  },
};

export default billingCyclesService;

