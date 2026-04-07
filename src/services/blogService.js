import ApiService from "@/lib/apiClient";

const BlogService = {
  // Public Blog Routes
  getPosts: (params) => ApiService.get("/blog/posts", { params }),
  getPostBySlug: (slug) => ApiService.get(`/blog/posts/${slug}`),
  getCategories: () => ApiService.get("/blog/categories"),
  getPostsByCategory: (categorySlug, params) => 
    ApiService.get(`/blog/categories/${categorySlug}/posts`, { params }),

  // Admin Blog Routes
  adminGetPosts: (params) => ApiService.get("/admin/blog-posts", { params }),
  adminGetPost: (uuid) => ApiService.get(`/admin/blog-posts/${uuid}`),
  adminCreatePost: (data) => ApiService.post("/admin/blog-posts", data),
  adminUpdatePost: (uuid, data) => ApiService.put(`/admin/blog-posts/${uuid}`, data),
  adminDeletePost: (uuid) => ApiService.delete(`/admin/blog-posts/${uuid}`),

  adminGetCategories: (params) => ApiService.get("/admin/blog-categories", { params }),
  adminCreateCategory: (data) => ApiService.post("/admin/blog-categories", data),
  adminUpdateCategory: (uuid, data) => ApiService.put(`/admin/blog-categories/${uuid}`, data),
  adminDeleteCategory: (uuid) => ApiService.delete(`/admin/blog-categories/${uuid}`),

  // Image Upload (Mock or real endpoint if exists)
  uploadImage: (formData) => ApiService.post("/admin/blog/upload-image", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

export default BlogService;
