import React, { useState, useEffect } from 'react';
import { Receipt, CreditCard, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import StatsCards from '../../components/invoices/StatsCards';
import InvoicesList from '../../components/invoices/InvoicesList';
import PaymentMethods from '../../components/invoices/PaymentMethods';
import Transactions from '../../components/invoices/Transactions';
import PaymentModal from '../../components/invoices/PaymentModal';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import invoicesService from '../../services/invoices';

/**
 * Main page for clients to view and manage their invoices, payment methods
 * and transaction history. Data fetching is performed on mount and the UI
 * delegates presentation to child components.
 */
const ClientInvoicesPage = () => {
  // Data sets
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [invoiceStats, setInvoiceStats] = useState({});
  const [transactionStats, setTransactionStats] = useState({});
  const [paymentStats, setPaymentStats] = useState({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('invoices');
  const [filters, setFilters] = useState({ status: 'all', dateRange: 'all', search: '' });

  // Modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * Loads invoices, payment methods, transactions and stats in parallel.
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        invoicesResponse,
        paymentMethodsResponse,
        transactionsResponse,
        invoiceStatsResponse,
        transactionStatsResponse,
        paymentStatsResponse,
      ] = await Promise.allSettled([
        invoicesService.getInvoices(),
        invoicesService.getPaymentMethods(),
        invoicesService.getTransactions(),
        invoicesService.getInvoiceStats(),
        invoicesService.getTransactionStats(),
        invoicesService.getPaymentStats(),
      ]);
      if (invoicesResponse.status === 'fulfilled' && invoicesResponse.value.success) {
        setInvoices(invoicesResponse.value.data?.data || []);
      }
      if (paymentMethodsResponse.status === 'fulfilled' && paymentMethodsResponse.value.success) {
        setPaymentMethods(paymentMethodsResponse.value.data || []);
      }
      if (transactionsResponse.status === 'fulfilled' && transactionsResponse.value.success) {
        setTransactions(transactionsResponse.value.data?.data || []);
      }
      if (invoiceStatsResponse.status === 'fulfilled' && invoiceStatsResponse.value.success) {
        setInvoiceStats(invoiceStatsResponse.value.data || {});
      }
      if (transactionStatsResponse.status === 'fulfilled' && transactionStatsResponse.value.success) {
        setTransactionStats(transactionStatsResponse.value.data || {});
      }
      if (paymentStatsResponse.status === 'fulfilled' && paymentStatsResponse.value.success) {
        setPaymentStats(paymentStatsResponse.value.data || {});
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Processes an invoice payment via the service layer and reloads data on success.
   *
   * @param {string|number} invoiceId The ID of the invoice.
   * @param {string|number} paymentMethodId The ID of the payment method to use.
   */
  const processPayment = async (invoiceId, paymentMethodId) => {
    try {
      const response = await invoicesService.processPayment({
        invoice_id: invoiceId,
        payment_method_id: paymentMethodId,
        provider: 'stripe',
      });
      if (response.success) {
        setShowPaymentModal(false);
        await loadData();
      }
    } catch (err) {
      console.error('Error processing payment:', err);
    }
  };

  // Event handlers for selecting and paying invoices
  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };
  const handlePayInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  if (loading) {
    // Skeleton state while data loads
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-8 mb-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-48 rounded" />
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-32 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-card border border-border rounded-2xl p-6">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-3/4 mb-4 rounded" />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    // Error state
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-8 mb-10">
        <div className="text-center bg-white dark:bg-card border border-dashed border-border/60 rounded-2xl p-16">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4 inline-block">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Error al cargar datos</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-8 mb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Facturas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus facturas, métodos de pago y transacciones
          </p>
        </div>
      </div>
      {/* Stats cards */}
      <StatsCards invoiceStats={invoiceStats} paymentMethodCount={paymentMethods.length} />
      {/* Tab container */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Tabs navigation */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'invoices', name: 'Facturas', icon: Receipt },
              { id: 'payments', name: 'Métodos de Pago', icon: CreditCard },
              { id: 'transactions', name: 'Transacciones', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        {/* Tabs content */}
        <div className="p-6">
          {activeTab === 'invoices' && (
            <InvoicesList
              invoices={invoices}
              filters={filters}
              setFilters={setFilters}
              onSelectInvoice={handleSelectInvoice}
              onPayInvoice={handlePayInvoice}
            />
          )}
          {activeTab === 'payments' && (
            <PaymentMethods
              paymentMethods={paymentMethods}
              onAddMethod={() => { /* placeholder for add */ }}
              onEditMethod={(method) => { /* placeholder for edit */ }}
              onDeleteMethod={(method) => { /* placeholder for delete */ }}
            />
          )}
          {activeTab === 'transactions' && (
            <Transactions
              transactions={transactions}
              filters={filters}
              setFilters={setFilters}
            />
          )}
        </div>
      </div>
      {/* Modals */}
      <PaymentModal
        show={showPaymentModal}
        invoice={selectedInvoice}
        paymentMethods={paymentMethods}
        onClose={() => setShowPaymentModal(false)}
        onPay={(invoiceId, methodId) => processPayment(invoiceId, methodId)}
      />
      <InvoiceDetailModal
        show={showInvoiceModal}
        invoice={selectedInvoice}
        onClose={() => setShowInvoiceModal(false)}
        onPay={(invoice) => {
          // When paying from detail modal, open payment modal
          setShowInvoiceModal(false);
          setSelectedInvoice(invoice);
          setShowPaymentModal(true);
        }}
      />
    </div>
  );
};

export default ClientInvoicesPage;