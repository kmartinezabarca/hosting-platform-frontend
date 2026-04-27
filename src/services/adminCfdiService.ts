import apiClient from './apiClient';

const adminCfdiService = {
  /** Lista CFDI con filtros y paginación */
  getCfdis: async (params = {}) => {
    const response = await apiClient.get('/admin/cfdi', { params });
    return response.data;
  },

  /** Estadísticas por estado */
  getStats: async () => {
    const response = await apiClient.get('/admin/cfdi/stats');
    return response.data;
  },

  /** Detalle de un CFDI */
  getCfdi: async (id) => {
    const response = await apiClient.get(`/admin/cfdi/${id}`);
    return response.data;
  },

  /** Reintentar timbrado fallido */
  retry: async (id) => {
    const response = await apiClient.post(`/admin/cfdi/${id}/retry`);
    return response.data;
  },

  /** Cancelar CFDI con motivo SAT */
  cancel: async (id, payload) => {
    const response = await apiClient.post(`/admin/cfdi/${id}/cancel`, payload);
    return response.data;
  },

  /** Descargar PDF (devuelve Blob) */
  downloadPdf: async (id) => {
    const response = await apiClient.get(`/admin/cfdi/${id}/download/pdf`, { responseType: 'blob' });
    return response.data;
  },

  /** Descargar XML (devuelve Blob) */
  downloadXml: async (id) => {
    const response = await apiClient.get(`/admin/cfdi/${id}/download/xml`, { responseType: 'blob' });
    return response.data;
  },
};

export default adminCfdiService;
