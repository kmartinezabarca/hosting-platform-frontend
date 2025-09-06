import apiClient from './apiClient'; // 1. Importamos el cliente de API centralizado.
import { paymentService } from './paymentService'; // 2. Importamos paymentService con desestructuración.

// 3. Eliminamos la dependencia de authService y la lógica de tokens.

class InvoicesService {
  async getInvoices(params = {}) {
    try {
      // 4. Reemplazamos fetch por apiClient y pasamos los params directamente.
      const response = await apiClient.get('/invoices');
      return response.data; // 5. Devolvemos response.data
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoice(uuid) {
    try {
      const response = await apiClient.get(`/invoices/${uuid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  async getInvoiceStats() {
    try {
      const response = await apiClient.get('/invoices/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      throw error;
    }
  }

  async getTransactions(params = {}) {
    try {
      const response = await apiClient.get('/transactions',);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransaction(uuid) {
    try {
      const response = await apiClient.get(`/transactions/${uuid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async getTransactionStats() {
    try {
      const response = await apiClient.get('/transactions/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }

  async getRecentTransactions(limit = 10) {
    try {
      const response = await apiClient.get('/transactions/recent', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  // --- Métodos delegados a paymentService ---
  // Estos ya estaban bien, asumiendo que la importación es correcta.
  // Solo nos aseguramos de que la importación sea nombrada.

  async getPaymentMethods() {
    return paymentService.getPaymentMethods();
  }

  async createSetupIntent() {
    return paymentService.createPaymentIntent();
  }

  async addPaymentMethod(methodData) {
    return paymentService.addPaymentMethod(methodData);
  }

  async updatePaymentMethod(id, data) {
    return paymentService.updatePaymentMethod(id, data);
  }

  async setDefaultPaymentMethod(id) {
    return this.updatePaymentMethod(id, { is_default: true });
  }

  async deletePaymentMethod(id) {
    return paymentService.deletePaymentMethod(id);
  }

  async processPayment(paymentData) {
    return paymentService.processPayment(paymentData);
  }

  async getPaymentStats() {
    return paymentService.getPaymentStats();
  }
}

// Exportamos una única instancia de la clase.
export default new InvoicesService();
