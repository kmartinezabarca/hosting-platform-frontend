// API service for communicating with the backend
const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Categories API
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoriesWithPlans() {
    return this.request('/categories/with-plans');
  }

  async getCategoryBySlug(slug) {
    return this.request(`/categories/slug/${slug}`);
  }

  // Billing Cycles API
  async getBillingCycles() {
    return this.request('/billing-cycles');
  }

  // Service Plans API
  async getServicePlans(categoryId = null) {
    const endpoint = categoryId 
      ? `/service-plans?category_id=${categoryId}` 
      : '/service-plans';
    return this.request(endpoint);
  }

  async getServicePlansByCategorySlug(categorySlug) {
    return this.request(`/service-plans/category/${categorySlug}`);
  }

  async getServicePlan(uuid) {
    return this.request(`/service-plans/${uuid}`);
  }

  // Products API (legacy support)
  async getProducts() {
    return this.request('/products');
  }

  async getProductsByServiceType(serviceType) {
    return this.request(`/products/service-type/${serviceType}`);
  }

  // Services API
  async getServices() {
    return this.request('/services');
  }

  async createService(serviceData) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  // Invoices API
  async getInvoices() {
    return this.request('/invoices');
  }

  async getInvoice(uuid) {
    return this.request(`/invoices/${uuid}`);
  }

  // Tickets API
  async getTickets() {
    return this.request('/tickets');
  }

  async createTicket(ticketData) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  // Domains API
  async getDomains() {
    return this.request('/domains');
  }

  async checkDomainAvailability(domain) {
    return this.request('/domains/check-availability', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    });
  }

  // Dashboard API
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for convenience
export const {
  getCategories,
  getCategoriesWithPlans,
  getCategoryBySlug,
  getBillingCycles,
  getServicePlans,
  getServicePlansByCategorySlug,
  getServicePlan,
  getProducts,
  getProductsByServiceType,
  getServices,
  createService,
  getInvoices,
  getInvoice,
  getTickets,
  createTicket,
  getDomains,
  checkDomainAvailability,
  getDashboardStats,
} = apiService;

