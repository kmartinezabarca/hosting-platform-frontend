import apiClient from "./apiClient";

/**
 * Servicio centralizado para gestionar la Documentación de API en el panel administrativo
 */

export const apiDocumentationAdminService = {
  /**
   * Obtener todas las documentaciones de API
   */
  async getAll() {
    try {
      const response = await apiClient.get("/admin/api-documentation");
      return (response.data as any).data || [];
    } catch (error) {
      console.error("Error fetching API documentation:", error);
      throw error;
    }
  },

  /**
   * Obtener una documentación de API por UUID
   */
  async getByUuid(uuid) {
    try {
      const response = await apiClient.get(`/admin/api-documentation/${uuid}`);
      return (response.data as any).data;
    } catch (error) {
      console.error("Error fetching API documentation:", error);
      throw error;
    }
  },

  /**
   * Crear una nueva documentación de API
   */
  async create(data) {
    try {
      const response = await apiClient.post("/admin/api-documentation", data);
      return (response.data as any).data;
    } catch (error) {
      console.error("Error creating API documentation:", error);
      throw error;
    }
  },

  /**
   * Actualizar una documentación de API existente
   */
  async update(uuid, data) {
    try {
      const response = await apiClient.put(`/admin/api-documentation/${uuid}`, data);
      return (response.data as any).data;
    } catch (error) {
      console.error("Error updating API documentation:", error);
      throw error;
    }
  },

  /**
   * Eliminar una documentación de API
   */
  async delete(uuid) {
    try {
      await apiClient.delete(`/admin/api-documentation/${uuid}`);
      return true;
    } catch (error) {
      console.error("Error deleting API documentation:", error);
      throw error;
    }
  },
};

export default apiDocumentationAdminService;
