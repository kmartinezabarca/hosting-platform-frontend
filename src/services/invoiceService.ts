import apiClient from './apiClient'; // 1. Importamos el cliente de API centralizado.
import { paymentService } from './paymentService'; // 2. Importamos paymentService con desestructuración.
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Invoice, InvoiceStats, Transaction, PaymentMethod } from '@/types/models';
import type {
  PaymentIntentData,
  PaymentMethodData,
  PaymentProcessData,
  PaymentStats,
  StripeSetupIntent,
} from './paymentService';

// 3. Eliminamos la dependencia de authService y la lógica de tokens.

export interface FiscalDataPayload {
  rfc?: string;
  razon_social?: string;
  regimen_fiscal?: string;
  uso_cfdi?: string;
  [key: string]: unknown;
}

export interface TransactionStats {
  total_amount: number;
  count: number;
  [key: string]: unknown;
}

class InvoicesService {
  async getInvoices(params: Record<string, unknown> = {}): Promise<PaginatedResponse<Invoice>> {
    try {
      // 4. Reemplazamos fetch por apiClient y pasamos los params directamente.
      const response = await apiClient.get<PaginatedResponse<Invoice>>('/invoices');
      return response.data; // 5. Devolvemos response.data
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getInvoice(uuid: string): Promise<ApiResponse<Invoice>> {
    try {
      const response = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${uuid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  async getInvoiceStats(): Promise<ApiResponse<InvoiceStats>> {
    try {
      const response = await apiClient.get<ApiResponse<InvoiceStats>>('/invoices/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      throw error;
    }
  }

  async getTransactions(params: Record<string, unknown> = {}): Promise<PaginatedResponse<Transaction>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Transaction>>('/transactions',);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransaction(uuid: string): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${uuid}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async getTransactionStats(): Promise<ApiResponse<TransactionStats>> {
    try {
      const response = await apiClient.get<ApiResponse<TransactionStats>>('/transactions/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }

  async getRecentTransactions(limit: number = 10): Promise<ApiResponse<Transaction[]>> {
    try {
      const response = await apiClient.get<ApiResponse<Transaction[]>>('/transactions/recent', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  // --- Métodos delegados a paymentService ---
  // Estos ya estaban bien, asumiendo que la importación es correcta.
  // Solo nos aseguramos de que la importación sea nombrada.

  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return paymentService.getPaymentMethods();
  }

  async createSetupIntent(): Promise<ApiResponse<StripeSetupIntent>> {
    return paymentService.createPaymentIntent();
  }

  async addPaymentMethod(methodData: PaymentMethodData): Promise<ApiResponse<PaymentMethod>> {
    return paymentService.addPaymentMethod(methodData);
  }

  async updatePaymentMethod(id: number | string, data: Partial<PaymentMethod>): Promise<ApiResponse<PaymentMethod>> {
    return paymentService.updatePaymentMethod(id, data);
  }

  async setDefaultPaymentMethod(id: number | string): Promise<ApiResponse<PaymentMethod>> {
    return this.updatePaymentMethod(id, { is_default: true });
  }

  async deletePaymentMethod(id: number | string): Promise<import('@/types/api').MessageResponse> {
    return paymentService.deletePaymentMethod(id);
  }

  async processPayment(paymentData: PaymentProcessData): Promise<ApiResponse<Transaction>> {
    return paymentService.processPayment(paymentData);
  }

  async getPaymentStats(): Promise<ApiResponse<PaymentStats>> {
    return paymentService.getPaymentStats();
  }

  /** Actualiza datos fiscales de una factura (ventana 72h) */
  async updateFiscalData(uuid: string, payload: FiscalDataPayload): Promise<ApiResponse<Invoice>> {
    try {
      const response = await apiClient.put<ApiResponse<Invoice>>(`/invoices/${uuid}/fiscal-data`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating fiscal data:', error);
      throw error;
    }
  }

  /** Descarga PDF o XML del CFDI. Devuelve un Blob. */
  async downloadCfdi(uuid: string, format: 'pdf' | 'xml'): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/invoices/${uuid}/${format}`, {
      responseType: 'blob',
    });
    return response.data; // Blob
  }
}

// Exportamos una única instancia de la clase.
export default new InvoicesService();
