import apiClient from "./apiClient";

/**
 * Servicio centralizado para gestionar el Estado del Sistema en el panel administrativo
 */

export const systemStatusAdminService = {
  /**
   * Obtener todos los estados del sistema
   */
  async getAll() {
    try {
      const response = await apiClient.get("/admin/system-status");
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching system status:", error);
      throw error;
    }
  },

  /**
   * Obtener un estado del sistema por UUID
   */
  async getByUuid(uuid) {
    try {
      const response = await apiClient.get(`/admin/system-status/${uuid}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching system status:", error);
      throw error;
    }
  },

  /**
   * Crear un nuevo estado del sistema
   */
  async create(data) {
    try {
      const response = await apiClient.post("/admin/system-status", data);
      return response.data.data;
    } catch (error) {
      console.error("Error creating system status:", error);
      throw error;
    }
  },

  /**
   * Actualizar un estado del sistema existente
   */
  async update(uuid, data) {
    try {
      const response = await apiClient.put(`/admin/system-status/${uuid}`, data);
      return response.data.data;
    } catch (error) {
      console.error("Error updating system status:", error);
      throw error;
    }
  },

  /**
   * Eliminar un estado del sistema
   */
  async delete(uuid) {
    try {
      await apiClient.delete(`/admin/system-status/${uuid}`);
      return true;
    } catch (error) {
      console.error("Error deleting system status:", error);
      throw error;
    }
  },
};

export default systemStatusAdminService;
