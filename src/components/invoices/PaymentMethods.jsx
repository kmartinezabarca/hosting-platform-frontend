import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Plus, 
  MoreVertical, 
  Star, 
  Trash2, 
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';

/**
 * Displays the user's saved payment methods with enhanced UI and actions.
 */
const PaymentMethods = ({ 
  paymentMethods, 
  onAddMethod, 
  onSetDefault, 
  onDeleteMethod,
  loading = false
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const getCardBrandIcon = (brand) => {
    const brandIcons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      diners: '💳',
      jcb: '💳',
      unionpay: '💳'
    };
    return brandIcons[brand?.toLowerCase()] || '💳';
  };

  const formatCardBrand = (brand) => {
    const brandNames = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
      diners: 'Diners Club',
      jcb: 'JCB',
      unionpay: 'UnionPay'
    };
    return brandNames[brand?.toLowerCase()] || brand;
  };

  const handleDropdownToggle = (methodId) => {
    setActiveDropdown(activeDropdown === methodId ? null : methodId);
  };

  const handleSetDefault = async (method) => {
    setActiveDropdown(null);
    await onSetDefault(method);
  };

  const handleDelete = async (method) => {
    setActiveDropdown(null);
    await onDeleteMethod(method);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Métodos de Pago</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona tus métodos de pago guardados de forma segura
          </p>
        </div>
        <button
          onClick={onAddMethod}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
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
              Agrega un método de pago para realizar pagos automáticos y gestionar tus servicios
            </p>
            <button
              onClick={onAddMethod}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
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
                transition={{ delay: index * 0.05 }}
                className="relative border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                      <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        {method.name}
                        {method.is_default && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {method.type === 'card' && method.details ? (
                          <>
                            <p className="flex items-center gap-2">
                              <span>{getCardBrandIcon(method.details.brand)}</span>
                              <span>{formatCardBrand(method.details.brand)} •••• {method.details.last4}</span>
                            </p>
                            <p>Expira {method.details.exp_month}/{method.details.exp_year}</p>
                          </>
                        ) : (
                          <p>
                            {method.type === 'card'
                              ? 'Tarjeta de Crédito/Débito'
                              : method.type === 'bank_account'
                              ? 'Cuenta Bancaria'
                              : method.type === 'paypal'
                              ? 'PayPal'
                              : 'Otro método'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => handleDropdownToggle(method.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {activeDropdown === method.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-card border border-border rounded-lg shadow-lg z-10"
                      >
                        {!method.is_default && (
                          <button
                            onClick={() => handleSetDefault(method)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Star className="w-4 h-4" />
                            Establecer como predeterminado
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(method)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar método
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                {method.is_default && (
                  <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      Método de pago predeterminado
                    </span>
                  </div>
                )}

                {method.type === 'card' && method.details?.exp_year && method.details?.exp_month && (
                  (() => {
                    const currentDate = new Date();
                    const expDate = new Date(method.details.exp_year, method.details.exp_month - 1);
                    const monthsUntilExp = (expDate.getFullYear() - currentDate.getFullYear()) * 12 + 
                                          (expDate.getMonth() - currentDate.getMonth());
                    
                    if (monthsUntilExp <= 2 && monthsUntilExp >= 0) {
                      return (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mt-3">
                          <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm text-yellow-600 dark:text-yellow-400">
                            Esta tarjeta expira pronto
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Security notice */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-600 dark:text-blue-400">
            <p className="font-medium mb-1">Información segura</p>
            <p className="text-xs">
              Todos los métodos de pago están protegidos por Stripe. 
              No almacenamos información sensible de tarjetas en nuestros servidores.
            </p>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default PaymentMethods;