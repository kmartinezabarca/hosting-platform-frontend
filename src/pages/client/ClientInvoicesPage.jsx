import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  Download, 
  Plus, 
  Eye, 
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import invoicesService from '../../services/invoices';

const ClientInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [invoiceStats, setInvoiceStats] = useState({});
  const [transactionStats, setTransactionStats] = useState({});
  const [paymentStats, setPaymentStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

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
        paymentStatsResponse
      ] = await Promise.allSettled([
        invoicesService.getInvoices(),
        invoicesService.getPaymentMethods(),
        invoicesService.getTransactions(),
        invoicesService.getInvoiceStats(),
        invoicesService.getTransactionStats(),
        invoicesService.getPaymentStats()
      ]);

      // Handle invoices
      if (invoicesResponse.status === 'fulfilled' && invoicesResponse.value.success) {
        setInvoices(invoicesResponse.value.data?.data || []);
      }

      // Handle payment methods
      if (paymentMethodsResponse.status === 'fulfilled' && paymentMethodsResponse.value.success) {
        setPaymentMethods(paymentMethodsResponse.value.data || []);
      }

      // Handle transactions
      if (transactionsResponse.status === 'fulfilled' && transactionsResponse.value.success) {
        setTransactions(transactionsResponse.value.data?.data || []);
      }

      // Handle stats
      if (invoiceStatsResponse.status === 'fulfilled' && invoiceStatsResponse.value.success) {
        setInvoiceStats(invoiceStatsResponse.value.data || {});
      }

      if (transactionStatsResponse.status === 'fulfilled' && transactionStatsResponse.value.success) {
        setTransactionStats(transactionStatsResponse.value.data || {});
      }

      if (paymentStatsResponse.status === 'fulfilled' && paymentStatsResponse.value.success) {
        setPaymentStats(paymentStatsResponse.value.data || {});
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadData();
  };

  const processPayment = async (invoiceId, paymentMethodId) => {
    try {
      const response = await invoicesService.processPayment({
        invoice_id: invoiceId,
        payment_method_id: paymentMethodId,
        provider: 'stripe'
      });

      if (response.success) {
        setShowPaymentModal(false);
        loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20';
      case 'sent':
      case 'pending':
        return 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20';
      case 'overdue':
      case 'failed':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
      case 'refunded':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'sent':
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'overdue':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'sent': return 'Enviada';
      case 'paid': return 'Pagada';
      case 'overdue': return 'Vencida';
      case 'cancelled': return 'Cancelada';
      case 'refunded': return 'Reembolsada';
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'completed': return 'Completada';
      case 'failed': return 'Fallida';
      default: return 'Desconocido';
    }
  };

  const formatCurrency = (amount, currency = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-8 mb-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-48 rounded"></div>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-32 rounded"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-card border border-border rounded-2xl p-6">
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 w-3/4 mb-4 rounded"></div>
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 mt-8 mb-10">
        <div className="text-center bg-white dark:bg-card border border-dashed border-border/60 rounded-2xl p-16">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4 inline-block">
            <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Error al cargar datos</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={handleRetry}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Facturado</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(invoiceStats.total_amount || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pagado</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(invoiceStats.paid_amount || 0)}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pendiente</p>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(invoiceStats.pending_amount || 0)}
              </p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Métodos de Pago</p>
              <p className="text-2xl font-bold text-foreground">
                {paymentMethods.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'invoices', name: 'Facturas', icon: Receipt },
              { id: 'payments', name: 'Métodos de Pago', icon: CreditCard },
              { id: 'transactions', name: 'Transacciones', icon: TrendingUp }
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

        <div className="p-6">
          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Mis Facturas
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar facturas..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="paid">Pagadas</option>
                    <option value="pending">Pendientes</option>
                    <option value="overdue">Vencidas</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-full mb-4 inline-block">
                      <Receipt className="w-12 h-12 text-muted-foreground/60" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No hay facturas
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Aún no tienes facturas generadas. Las facturas aparecerán aquí cuando realices compras.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {invoices.map((invoice, index) => (
                      <motion.div
                        key={invoice.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-card"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                              {invoice.invoice_number}
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                {getStatusIcon(invoice.status)}
                                {getStatusText(invoice.status)}
                              </span>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Creada: {formatDate(invoice.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">
                              {formatCurrency(invoice.total, invoice.currency)}
                            </p>
                          </div>
                        </div>

                        {invoice.items && invoice.items.length > 0 && (
                          <div className="space-y-2 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            {invoice.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{item.description}</span>
                                <span className="text-foreground font-medium">{formatCurrency(item.total || item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t border-border">
                          <div className="text-sm text-muted-foreground">
                            {invoice.status === 'paid' ? 
                              `Pagada el ${formatDate(invoice.paid_at)}` :
                              `Vence el ${formatDate(invoice.due_date)}`
                            }
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowInvoiceModal(true);
                              }}
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:bg-accent rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Ver Detalles
                            </button>
                            {invoice.status === 'sent' || invoice.status === 'overdue' ? (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowPaymentModal(true);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
                              >
                                <DollarSign className="w-4 h-4" />
                                Pagar Ahora
                              </button>
                            ) : (
                              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:bg-accent rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                                Descargar PDF
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Métodos de Pago
                </h3>
                <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors">
                  <Plus className="w-4 h-4" />
                  Agregar Método
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentMethods.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-full mb-4 inline-block">
                      <CreditCard className="w-12 h-12 text-muted-foreground/60" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No hay métodos de pago
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Agrega un método de pago para realizar pagos automáticos
                    </p>
                    <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors">
                      <Plus className="w-4 h-4" />
                      Agregar Primer Método
                    </button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {paymentMethods.map((method, index) => (
                      <motion.div
                        key={method.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-card"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {method.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {method.type === 'card' ? 'Tarjeta de Crédito/Débito' : 
                                 method.type === 'bank_account' ? 'Cuenta Bancaria' : 
                                 method.type === 'paypal' ? 'PayPal' : 'Otro método'}
                              </p>
                            </div>
                          </div>
                          {method.is_default && (
                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs px-2 py-1 rounded-full font-medium">
                              Predeterminado
                            </span>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                            Editar
                          </button>
                          <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors">
                            Eliminar
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Historial de Transacciones
                </h3>
                <div className="flex items-center gap-3">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="completed">Completadas</option>
                    <option value="pending">Pendientes</option>
                    <option value="failed">Fallidas</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-full mb-4 inline-block">
                      <TrendingUp className="w-12 h-12 text-muted-foreground/60" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No hay transacciones
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Aún no tienes transacciones registradas. Las transacciones aparecerán aquí cuando realices pagos.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-card"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {transaction.description || `Transacción ${transaction.transaction_id}`}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {transaction.transaction_id} • {formatDate(transaction.created_at)}
                              </p>
                              {transaction.provider && (
                                <p className="text-xs text-muted-foreground">
                                  Procesado por {transaction.provider}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </p>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {getStatusIcon(transaction.status)}
                              {getStatusText(transaction.status)}
                            </div>
                            {transaction.fee_amount > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Comisión: {formatCurrency(transaction.fee_amount, transaction.currency)}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Pagar Factura {selectedInvoice.invoice_number}
              </h3>
              
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Total a pagar</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium text-foreground">
                  Método de Pago
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option>Seleccionar método de pago</option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border border-border text-foreground hover:bg-accent font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => processPayment(selectedInvoice.id, paymentMethods[0]?.id)}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Pagar Ahora
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {showInvoiceModal && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-card border border-border rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">
                  Detalles de Factura
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Factura</p>
                    <p className="font-semibold text-foreground">{selectedInvoice.invoice_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.status)}`}>
                      {getStatusIcon(selectedInvoice.status)}
                      {getStatusText(selectedInvoice.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                    <p className="font-semibold text-foreground">{formatDate(selectedInvoice.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                    <p className="font-semibold text-foreground">{formatDate(selectedInvoice.due_date)}</p>
                  </div>
                </div>

                {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Elementos de la Factura</h4>
                    <div className="space-y-2">
                      {selectedInvoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-foreground">{item.description}</span>
                          <span className="font-semibold text-foreground">{formatCurrency(item.total || item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-foreground">
                      {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 border border-border text-foreground hover:bg-accent font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </button>
                  {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                    <button
                      onClick={() => {
                        setShowInvoiceModal(false);
                        setShowPaymentModal(true);
                      }}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Pagar Ahora
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientInvoicesPage;

            {/* Payment Methods Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Métodos de Pago
                  </h3>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Agregar Método
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paymentMethods.length === 0 ? (
                    <div className="col-span-2 text-center py-12">
                      <span className="text-6xl mb-4 block">💳</span>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No hay métodos de pago
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Agrega un método de pago para realizar pagos automáticos
                      </p>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                        Agregar Primer Método
                      </button>
                    </div>
                  ) : (
                    paymentMethods.map((method) => (
                      <div key={method.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <span className="text-xl">
                                {method.type === 'card' ? '💳' : 
                                 method.type === 'bank_account' ? '🏦' : '💰'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {method.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {method.type === 'card' ? 'Tarjeta' : 
                                 method.type === 'bank_account' ? 'Cuenta Bancaria' : 'PayPal'}
                              </p>
                            </div>
                          </div>
                          {method.is_default && (
                            <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                              Predeterminado
                            </span>
                          )}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                            Editar
                          </button>
                          <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium">
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Historial de Transacciones
                </h3>

                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-6xl mb-4 block">📊</span>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No hay transacciones
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Las transacciones aparecerán aquí cuando realices pagos
                      </p>
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {transaction.description}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {transaction.transaction_id} • {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              ${transaction.amount} {transaction.currency}
                            </p>
                            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status === 'completed' ? 'Completada' : 
                               transaction.status === 'pending' ? 'Pendiente' : 'Fallida'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Pagar Factura {selectedInvoice.invoice_number}
              </h3>
              
              <div className="mb-6">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${selectedInvoice.total} {selectedInvoice.currency}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Método de Pago
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option>Seleccionar método de pago</option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => processPayment(selectedInvoice.id, paymentMethods[0]?.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Pagar Ahora
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientInvoicesPage;


          {/* Payment Methods Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Métodos de Pago
                </h3>
                <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors">
                  <Plus className="w-4 h-4" />
                  Agregar Método
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentMethods.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-full mb-4 inline-block">
                      <CreditCard className="w-12 h-12 text-muted-foreground/60" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No hay métodos de pago
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Agrega un método de pago para realizar pagos automáticos
                    </p>
                    <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors">
                      <Plus className="w-4 h-4" />
                      Agregar Primer Método
                    </button>
                  </div>
                ) : (
                  <AnimatePresence>
                    {paymentMethods.map((method, index) => (
                      <motion.div
                        key={method.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-card"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                              <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {method.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {method.type === 'card' ? 'Tarjeta de Crédito/Débito' : 
                                 method.type === 'bank_account' ? 'Cuenta Bancaria' : 
                                 method.type === 'paypal' ? 'PayPal' : 'Otro método'}
                              </p>
                            </div>
                          </div>
                          {method.is_default && (
                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs px-2 py-1 rounded-full font-medium">
                              Predeterminado
                            </span>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
                            Editar
                          </button>
                          <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors">
                            Eliminar
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Historial de Transacciones
                </h3>
                <div className="flex items-center gap-3">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="completed">Completadas</option>
                    <option value="pending">Pendientes</option>
                    <option value="failed">Fallidas</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-full mb-4 inline-block">
                      <TrendingUp className="w-12 h-12 text-muted-foreground/60" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No hay transacciones
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Aún no tienes transacciones registradas. Las transacciones aparecerán aquí cuando realices pagos.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-card"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                {transaction.description || `Transacción ${transaction.transaction_id}`}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {transaction.transaction_id} • {formatDate(transaction.created_at)}
                              </p>
                              {transaction.provider && (
                                <p className="text-xs text-muted-foreground">
                                  Procesado por {transaction.provider}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </p>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {getStatusIcon(transaction.status)}
                              {getStatusText(transaction.status)}
                            </div>
                            {transaction.fee_amount > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Comisión: {formatCurrency(transaction.fee_amount, transaction.currency)}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Pagar Factura {selectedInvoice.invoice_number}
              </h3>
              
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Total a pagar</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <label className="block text-sm font-medium text-foreground">
                  Método de Pago
                </label>
                <select className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option>Seleccionar método de pago</option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border border-border text-foreground hover:bg-accent font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => processPayment(selectedInvoice.id, paymentMethods[0]?.id)}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Pagar Ahora
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Detail Modal */}
      <AnimatePresence>
        {showInvoiceModal && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-card border border-border rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">
                  Detalles de Factura
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número de Factura</p>
                    <p className="font-semibold text-foreground">{selectedInvoice.invoice_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.status)}`}>
                      {getStatusIcon(selectedInvoice.status)}
                      {getStatusText(selectedInvoice.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                    <p className="font-semibold text-foreground">{formatDate(selectedInvoice.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                    <p className="font-semibold text-foreground">{formatDate(selectedInvoice.due_date)}</p>
                  </div>
                </div>

                {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Elementos de la Factura</h4>
                    <div className="space-y-2">
                      {selectedInvoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-foreground">{item.description}</span>
                          <span className="font-semibold text-foreground">{formatCurrency(item.total || item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-foreground">
                      {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 border border-border text-foreground hover:bg-accent font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </button>
                  {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                    <button
                      onClick={() => {
                        setShowInvoiceModal(false);
                        setShowPaymentModal(true);
                      }}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Pagar Ahora
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientInvoicesPage;

