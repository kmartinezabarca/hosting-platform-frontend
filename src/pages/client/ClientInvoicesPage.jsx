import React, { useState, useEffect } from 'react';
import authService from '../../services/auth';

const ClientInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStats, setPaymentStats] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = authService.getToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };

      // Load invoices (mock data for now)
      setInvoices([
        {
          id: 1,
          invoice_number: 'INV-2025-001',
          status: 'pending',
          total: 299.99,
          currency: 'MXN',
          due_date: '2025-09-15',
          created_at: '2025-08-15',
          items: [
            { description: 'VPS Hosting - Plan Pro', amount: 199.99 },
            { description: 'Domain Registration - example.com', amount: 100.00 }
          ]
        },
        {
          id: 2,
          invoice_number: 'INV-2025-002',
          status: 'paid',
          total: 149.99,
          currency: 'MXN',
          due_date: '2025-08-15',
          paid_at: '2025-08-10',
          created_at: '2025-07-15',
          items: [
            { description: 'Shared Hosting - Plan Basic', amount: 149.99 }
          ]
        }
      ]);

      // Load payment methods
      const paymentResponse = await fetch('http://localhost:8000/api/payments/methods', { headers });
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        setPaymentMethods(paymentData.data || []);
      }

      // Load transactions
      const transactionResponse = await fetch('http://localhost:8000/api/payments/transactions', { headers });
      if (transactionResponse.ok) {
        const transactionData = await transactionResponse.json();
        setTransactions(transactionData.data?.data || []);
      }

      // Load payment stats
      const statsResponse = await fetch('http://localhost:8000/api/payments/stats', { headers });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setPaymentStats(statsData.data || {});
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (methodData) => {
    try {
      const token = authService.getToken();
      const response = await fetch('http://localhost:8000/api/payments/methods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(methodData)
      });

      if (response.ok) {
        loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  const processPayment = async (invoiceId, paymentMethodId) => {
    try {
      const token = authService.getToken();
      const response = await fetch('http://localhost:8000/api/payments/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
          payment_method_id: paymentMethodId,
          provider: 'stripe'
        })
      });

      if (response.ok) {
        setShowPaymentModal(false);
        loadData(); // Reload data
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Facturación y Pagos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestiona tus facturas, métodos de pago y transacciones
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Gastado</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${paymentStats.total_spent || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendiente</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${paymentStats.pending_amount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Transacciones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {paymentStats.transactions_count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <span className="text-2xl">💳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Métodos de Pago</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {paymentMethods.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'invoices', name: 'Facturas', icon: '📄' },
                { id: 'payments', name: 'Métodos de Pago', icon: '💳' },
                { id: 'transactions', name: 'Transacciones', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Mis Facturas
                  </h3>
                </div>

                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            {invoice.invoice_number}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Creada: {new Date(invoice.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status === 'paid' ? 'Pagada' : 
                             invoice.status === 'pending' ? 'Pendiente' : 'Vencida'}
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                            ${invoice.total} {invoice.currency}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {invoice.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                            <span className="text-gray-900 dark:text-white">${item.amount}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {invoice.status === 'paid' ? 
                            `Pagada el ${new Date(invoice.paid_at).toLocaleDateString()}` :
                            `Vence el ${new Date(invoice.due_date).toLocaleDateString()}`
                          }
                        </div>
                        {invoice.status === 'pending' && (
                          <div className="space-x-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowPaymentModal(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                              Pagar Ahora
                            </button>
                            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                              Descargar PDF
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

