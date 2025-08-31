import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class InvoicesService {
  async getInvoices(params = {}) {
    try {
      const token = authService.getToken();
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/invoices${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoice(uuid) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/invoices/${uuid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  async getInvoiceStats() {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/invoices/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      throw error;
    }
  }

  async getTransactions(params = {}) {
    try {
      const token = authService.getToken();
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/transactions${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransaction(uuid) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/transactions/${uuid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async getTransactionStats() {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/transactions/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }

  async getRecentTransactions(limit = 10) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/transactions/recent?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  async getPaymentMethods() {
    try {
return paymentService.getPaymentMethods();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  async createSetupIntent() {
    try {
return paymentService.createSetupIntent();
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  }

  async addPaymentMethod(methodData) {
    try {
return paymentService.addPaymentMethod(methodData);
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  async updatePaymentMethod(id, data) {
    try {
return paymentService.updatePaymentMethod(id, data);
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(id) {
    return this.updatePaymentMethod(id, { is_default: true });
  }

  async deletePaymentMethod(id) {
    try {
    return paymentService.deletePaymentMethod(id);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  async processPayment(paymentData) {
    return paymentService.processPayment(paymentData);
  }

  async getPaymentStats() {
    try {
return paymentService.getPaymentStats();
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }
}

export default new InvoicesService();


import paymentService from './paymentService';

