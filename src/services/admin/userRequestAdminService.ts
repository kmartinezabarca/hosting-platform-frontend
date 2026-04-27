import apiClient from "../apiClient";

export const userRequestAdminService = {
  // Listar todas las solicitudes de usuario con filtros
  getUserRequests: async (filters: Record<string, any> = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.kind) {
        params.append("kind", String(filters.kind));
      }

      if (typeof filters.is_resolved === "boolean") {
        params.append("is_resolved", String(filters.is_resolved));
      }

      if (filters.search) {
        params.append("search", String(filters.search));
      }

      if (filters.page) {
        params.append("page", String(filters.page));
      }
      
      const queryString = params.toString();
      const url = `/admin/user-requests${queryString ? "?" + queryString : ""}`;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching user requests:", error);
      throw error;
    }
  },

  // Obtener una solicitud específica
  getUserRequest: async (id) => {
    try {
      const response = await apiClient.get(`/admin/user-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user request:", error);
      throw error;
    }
  },

  // Marcar una solicitud como resuelta
  markAsResolved: async (id) => {
    try {
      const response = await apiClient.put(`/admin/user-requests/${id}/mark-resolved`);
      return response.data;
    } catch (error) {
      console.error("Error marking user request as resolved:", error);
      throw error;
    }
  },

  // Eliminar una solicitud
  deleteUserRequest: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/user-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user request:", error);
      throw error;
    }
  },
};

export default userRequestAdminService;
