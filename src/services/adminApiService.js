// Admin API service for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class AdminApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('auth_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('Admin API Error:', error);
      throw error;
    }
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  // Users Management
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams(params);
    const endpoint = queryParams.toString() ? `/admin/users?${queryParams}` : '/admin/users';
    return this.request(endpoint);
  }

  async createUser(userData) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateUserStatus(id, status) {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Services Management
  async getServices(params = {}) {
    const queryParams = new URLSearchParams(params);
    const endpoint = queryParams.toString() ? `/admin/services?${queryParams}` : '/admin/services';
    return this.request(endpoint);
  }

  async updateServiceStatus(id, status) {
    return this.request(`/admin/services/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Invoices Management
  async getInvoices(params = {}) {
    const queryParams = new URLSearchParams(params);
    const endpoint = queryParams.toString() ? `/admin/invoices?${queryParams}` : '/admin/invoices';
    return this.request(endpoint);
  }

  async createInvoice(invoiceData) {
    return this.request('/admin/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  async updateInvoice(id, invoiceData) {
    return this.request(`/admin/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  }

  async updateInvoiceStatus(id, status) {
    return this.request(`/admin/invoices/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async markInvoiceAsPaid(id) {
    return this.request(`/admin/invoices/${id}/mark-paid`, {
      method: 'POST',
    });
  }

  async sendInvoiceReminder(id) {
    return this.request(`/admin/invoices/${id}/send-reminder`, {
      method: 'POST',
    });
  }

  async cancelInvoice(id) {
    return this.request(`/admin/invoices/${id}/cancel`, {
      method: 'POST',
    });
  }

  async deleteInvoice(id) {
    return this.request(`/admin/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  // Tickets Management
  async getTickets(params = {}) {
    const queryParams = new URLSearchParams(params);
    const endpoint = queryParams.toString() ? `/admin/tickets?${queryParams}` : '/admin/tickets';
    return this.request(endpoint);
  }

  async createTicket(ticketData) {
    return this.request('/admin/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicket(id, ticketData) {
    return this.request(`/admin/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    });
  }

  async assignTicket(id, agentId) {
    return this.request(`/admin/tickets/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ agent_id: agentId }),
    });
  }

  async updateTicketStatus(id, status) {
    return this.request(`/admin/tickets/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateTicketPriority(id, priority) {
    return this.request(`/admin/tickets/${id}/priority`, {
      method: 'PUT',
      body: JSON.stringify({ priority }),
    });
  }

  async addTicketReply(id, replyData) {
    return this.request(`/admin/tickets/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
  }

  async deleteTicket(id) {
    return this.request(`/admin/tickets/${id}`, {
      method: 'DELETE',
    });
  }

  async getTicketCategories() {
    return this.request('/admin/tickets/categories');
  }

  async getSupportAgents() {
    return this.request('/admin/tickets/agents');
  }

  // Categories Management
  async createCategory(categoryData) {
    return this.request('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(uuid, categoryData) {
    return this.request(`/admin/categories/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(uuid) {
    return this.request(`/admin/categories/${uuid}`, {
      method: 'DELETE',
    });
  }

  // Billing Cycles Management
  async createBillingCycle(billingCycleData) {
    return this.request('/admin/billing-cycles', {
      method: 'POST',
      body: JSON.stringify(billingCycleData),
    });
  }

  async updateBillingCycle(uuid, billingCycleData) {
    return this.request(`/admin/billing-cycles/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(billingCycleData),
    });
  }

  async deleteBillingCycle(uuid) {
    return this.request(`/admin/billing-cycles/${uuid}`, {
      method: 'DELETE',
    });
  }

  // Service Plans Management
  async createServicePlan(servicePlanData) {
    return this.request('/admin/service-plans', {
      method: 'POST',
      body: JSON.stringify(servicePlanData),
    });
  }

  async updateServicePlan(uuid, servicePlanData) {
    return this.request(`/admin/service-plans/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(servicePlanData),
    });
  }

  async deleteServicePlan(uuid) {
    return this.request(`/admin/service-plans/${uuid}`, {
      method: 'DELETE',
    });
  }

  // Add-ons Management
  async createAddOn(addOnData) {
    return this.request('/admin/add-ons', {
      method: 'POST',
      body: JSON.stringify(addOnData),
    });
  }

  async updateAddOn(uuid, addOnData) {
    return this.request(`/admin/add-ons/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(addOnData),
    });
  }

  async deleteAddOn(uuid) {
    return this.request(`/admin/add-ons/${uuid}`, {
      method: 'DELETE',
    });
  }

  async attachAddOnToPlan(uuid, planUuid) {
    return this.request(`/admin/add-ons/${uuid}/attach-plan`, {
      method: 'POST',
      body: JSON.stringify({ plan_uuid: planUuid }),
    });
  }

  async detachAddOnFromPlan(uuid, planUuid) {
    return this.request(`/admin/add-ons/${uuid}/detach-plan`, {
      method: 'POST',
      body: JSON.stringify({ plan_uuid: planUuid }),
    });
  }

  // Products Management
  async createProduct(productData) {
    return this.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(uuid, productData) {
    return this.request(`/admin/products/${uuid}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(uuid) {
    return this.request(`/admin/products/${uuid}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
const adminApiService = new AdminApiService();
export default adminApiService;

