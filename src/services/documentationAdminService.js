import apiClient from "@/lib/apiClient";

/**
 * Servicio centralizado para gestionar la Documentación en el panel administrativo
 */

export const documentationAdminService = {
  /**
   * Obtener todas las documentaciones
   */
  async getAll() {
    try {
      const response = await apiClient.get("/admin/documentation");
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching documentation:", error);
      throw error;
    }
  },

  /**
   * Obtener una documentación por UUID
   */
  async getByUuid(uuid) {
    try {
      const response = await apiClient.get(`/admin/documentation/${uuid}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching documentation:", error);
      throw error;
    }
  },

  /**
   * Crear una nueva documentación
   */
  async create(data) {
    try {
      const response = await apiClient.post("/admin/documentation", data);
      return response.data.data;
    } catch (error) {
      console.error("Error creating documentation:", error);
      throw error;
    }
  },

  /**
   * Actualizar una documentación existente
   */
  async update(uuid, data) {
    try {
      const response = await apiClient.put(`/admin/documentation/${uuid}`, data);
      return response.data.data;
    } catch (error) {
      console.error("Error updating documentation:", error);
      throw error;
    }
  },

  /**
   * Eliminar una documentación
   */
  async delete(uuid) {
    try {
      await apiClient.delete(`/admin/documentation/${uuid}`);
      return true;
    } catch (error) {
      console.error("Error deleting documentation:", error);
      throw error;
    }
  },
};

export default documentationAdminService;
