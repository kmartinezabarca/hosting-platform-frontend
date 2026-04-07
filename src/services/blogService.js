import apiClient from './apiClient';

const BlogService = {
  // Public Blog Routes
  getPosts: (params) => apiClient.get("/blog/posts", { params }),
  getPostBySlug: (slug) => apiClient.get(`/blog/posts/${slug}`),
  getCategories: () => apiClient.get("/blog/categories"),
  getPostsByCategory: (categorySlug, params) => 
    apiClient.get(`/blog/categories/${categorySlug}/posts`, { params }),

  // Admin Blog Routes
  adminGetPosts: (params) => apiClient.get("/admin/blog-posts", { params }),
  adminGetPost: (uuid) => apiClient.get(`/admin/blog-posts/${uuid}`),
  adminCreatePost: (data) => apiClient.post("/admin/blog-posts", data),
  adminUpdatePost: (uuid, data) => apiClient.put(`/admin/blog-posts/${uuid}`, data),
  adminDeletePost: (uuid) => apiClient.delete(`/admin/blog-posts/${uuid}`),

  adminGetCategories: (params) => apiClient.get("/admin/blog-categories", { params }),
  adminCreateCategory: (data) => apiClient.post("/admin/blog-categories", data),
  adminUpdateCategory: (uuid, data) => apiClient.put(`/admin/blog-categories/${uuid}`, data),
  adminDeleteCategory: (uuid) => apiClient.delete(`/admin/blog-categories/${uuid}`),

  // Image Upload (Mock or real endpoint if exists)
  uploadImage: (formData) => apiClient.post("/admin/blog/upload-image", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

export default BlogService;
