import apiClient from './apiClient';

// --- Payment Services ---
export const paymentService = {
  // Create payment intent for Stripe
  async createPaymentIntent(paymentData) {
    try {
      // 3. Reemplazamos fetch por apiClient.post
      const response = await apiClient.post('/payments/intent', paymentData);
      return response.data; // 4. Devolvemos response.data
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Process payment
  async processPayment(paymentData) {
    try {
      const response = await apiClient.post('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await apiClient.get('/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Add payment method
  async addPaymentMethod(methodData) {
    try {
      const response = await apiClient.post('/payments/methods', methodData);
      return response.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  //Delete payment method
  async deletePaymentMethod(methodId) {
    try {
      const response = await apiClient.delete(`/payments/methods/${methodId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  },

  // Set default payment method
  async updatePaymentMethod(methodId, data) {
    try {
      const response = await apiClient.put(`/payments/methods/${methodId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },

  // Get transactions
  async getTransactions() {
    try {
      const response = await apiClient.get('/payments/transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get payment stats
  async getPaymentStats() {
    try {
      const response = await apiClient.get('/payments/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }
};

// --- Subscription Services ---
export const subscriptionService = {
  // Get user subscriptions
  async getUserSubscriptions() {
    try {
      const response = await apiClient.get('/subscriptions');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },

  // Create subscription
  async createSubscription(subscriptionData) {
    try {
      const response = await apiClient.post('/subscriptions', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Get subscription details
  async getSubscriptionDetails(subscriptionId) {
    try {
      const response = await apiClient.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId, reason) {
    try {
      const response = await apiClient.post(`/subscriptions/${subscriptionId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Resume subscription
  async resumeSubscription(subscriptionId) {
    try {
      const response = await apiClient.post(`/subscriptions/${subscriptionId}/resume`);
      return response.data;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  }
};

// Exportamos ambos servicios para que puedan ser importados donde se necesiten.
export default { paymentService, subscriptionService };
