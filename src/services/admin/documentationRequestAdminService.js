import apiClient from "@/lib/apiClient";

const documentationRequestAdminService = {
  // Get all documentation requests with filters
  getDocumentationRequests: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.kind) params.append("kind", filters.kind);
      if (filters.is_resolved !== undefined) params.append("is_resolved", filters.is_resolved);
      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", filters.page);

      const response = await apiClient.get(`/admin/documentation-requests?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching documentation requests:", error);
      throw error;
    }
  },

  // Get a specific documentation request
  getDocumentationRequest: async (id) => {
    try {
      const response = await apiClient.get(`/admin/documentation-requests/${id}`);
      return response.data.data;
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
