import apiClient from './apiClient';
import type { AxiosResponse } from 'axios';
import type { PaginatedResponse, ApiResponse, MessageResponse, FilterParams } from '@/types/api';

export interface BlogPost {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string | null;
  author?: {
    id: number;
    name: string;
  };
  category?: BlogCategory;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  posts_count?: number;
}

export interface BlogPostCreateData {
  title: string;
  content: string;
  excerpt?: string;
  status?: 'draft' | 'published';
  category_uuid?: string;
  [key: string]: unknown;
}

export interface BlogCategoryCreateData {
  name: string;
  slug?: string;
  [key: string]: unknown;
}

export interface UploadImageResponse {
  url: string;
  path?: string;
}

const BlogService = {
  // Public Blog Routes
  getPosts: (params?: FilterParams): Promise<AxiosResponse<PaginatedResponse<BlogPost>>> =>
    apiClient.get("/blog/posts", { params }),

  getPostBySlug: (slug: string): Promise<AxiosResponse<ApiResponse<BlogPost>>> =>
    apiClient.get(`/blog/posts/${slug}`),

  getCategories: (): Promise<AxiosResponse<ApiResponse<BlogCategory[]>>> =>
    apiClient.get("/blog/categories"),

  getPostsByCategory: (categorySlug: string, params?: FilterParams): Promise<AxiosResponse<PaginatedResponse<BlogPost>>> =>
    apiClient.get(`/blog/categories/${categorySlug}/posts`, { params }),

  // Admin Blog Routes
  adminGetPosts: (params?: FilterParams): Promise<AxiosResponse<PaginatedResponse<BlogPost>>> =>
    apiClient.get("/admin/blog-posts", { params }),

  adminGetPost: (uuid: string): Promise<AxiosResponse<ApiResponse<BlogPost>>> =>
    apiClient.get(`/admin/blog-posts/${uuid}`),

  adminCreatePost: (data: BlogPostCreateData): Promise<AxiosResponse<ApiResponse<BlogPost>>> =>
    apiClient.post("/admin/blog-posts", data),

  adminUpdatePost: (uuid: string, data: Partial<BlogPostCreateData>): Promise<AxiosResponse<ApiResponse<BlogPost>>> =>
    apiClient.put(`/admin/blog-posts/${uuid}`, data),

  adminDeletePost: (uuid: string): Promise<AxiosResponse<MessageResponse>> =>
    apiClient.delete(`/admin/blog-posts/${uuid}`),

  adminGetCategories: (params?: FilterParams): Promise<AxiosResponse<ApiResponse<BlogCategory[]>>> =>
    apiClient.get("/admin/blog-categories", { params }),

  adminCreateCategory: (data: BlogCategoryCreateData): Promise<AxiosResponse<ApiResponse<BlogCategory>>> =>
    apiClient.post("/admin/blog-categories", data),

  adminUpdateCategory: (uuid: string, data: Partial<BlogCategoryCreateData>): Promise<AxiosResponse<ApiResponse<BlogCategory>>> =>
    apiClient.put(`/admin/blog-categories/${uuid}`, data),

  adminDeleteCategory: (uuid: string): Promise<AxiosResponse<MessageResponse>> =>
    apiClient.delete(`/admin/blog-categories/${uuid}`),

  // Image Upload (Mock or real endpoint if exists)
  uploadImage: (formData: FormData): Promise<AxiosResponse<ApiResponse<UploadImageResponse>>> =>
    apiClient.post("/admin/blog/upload-image", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
};

export default BlogService;
