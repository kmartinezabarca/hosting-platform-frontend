import apiClient from "../apiClient";

const documentationRequestAdminService = {
  // Get all documentation requests with filters
  getDocumentationRequests: async (filters: Record<string, any> = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.kind) params.append("kind", String(filters.kind));
      if (filters.is_resolved !== undefined) params.append("is_resolved", String(filters.is_resolved));
      if (filters.search) params.append("search", String(filters.search));
      if (filters.page) params.append("page", String(filters.page));

      const response = await apiClient.get(`/admin/documentation-requests?${params.toString()}`);
      return (response.data as any).data;
    } catch (error) {
      console.error("Error fetching documentation requests:", error);
      throw error;
    }
  },

  // Get a specific documentation request
  getDocumentationRequest: async (id) => {
    try {
      const response = await apiClient.get(`/admin/documentation-requests/${id}`);
      return (response.data as any).data;
    } catch (error) {
      console.error("Error fetching documentation request:", error);
      throw error;
    }
  },

  // Mark a documentation request as resolved
  markAsResolved: async (id) => {
    try {
      const response = await apiClient.put(`/admin/documentation-requests/${id}/mark-resolved`);
      return response.data;
    } catch (error) {
      console.error("Error marking request as resolved:", error);
      throw error;
    }
  },

  // Delete a documentation request
  deleteDocumentationRequest: async (id) => {
    try {
      const response = await apiClient.delete(`/admin/documentation-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting documentation request:", error);
      throw error;
    }
  },
};

export default documentationRequestAdminService;
