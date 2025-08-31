const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Get authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Create headers with authentication
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Payment services
export const paymentService = {
  // Create payment intent for Stripe
  async createPaymentIntent(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/intent`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Process payment
  async processPayment(paymentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/methods`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Add payment method
  async addPaymentMethod(methodData) {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/methods`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(methodData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  // Get transactions
  async getTransactions() {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/transactions`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get payment stats
  async getPaymentStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/stats`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }
};

// Subscription services
export const subscriptionService = {
  // Get user subscriptions
  async getUserSubscriptions() {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  },

  // Create subscription
  async createSubscription(subscriptionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Get subscription details
  async getSubscriptionDetails(subscriptionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Resume subscription
  async resumeSubscription(subscriptionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/resume`, {
        method: 'POST',
        headers: createAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw error;
    }
  }
};

export default { paymentService, subscriptionService };

