import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus } from 'lucide-react';

/**
 * Displays the user's saved payment methods. When there are no methods,
 * encourages the user to add one. Each method shows its name, type and
 * whether it is the default. Edit and delete actions are exposed via
 * callback props for parent handling.
 *
 * @param {Object} props
 * @param {Array} props.paymentMethods List of payment method objects.
 * @param {Function} props.onAddMethod Callback when the user clicks "Agregar Método".
 * @param {Function} props.onEditMethod Callback when the user wants to edit a method.
 * @param {Function} props.onDeleteMethod Callback when the user wants to delete a method.
 */
const PaymentMethods = ({ paymentMethods, onAddMethod, onEditMethod, onDeleteMethod }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-foreground">Métodos de Pago</h3>
        <button
          onClick={onAddMethod}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
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
              Agrega un método de pago para realizar pagos automáticos
            </p>
            <button
              onClick={onAddMethod}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
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
                className="border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                      <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{method.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {method.type === 'card'
                          ? 'Tarjeta de Crédito/Débito'
                          : method.type === 'bank_account'
                          ? 'Cuenta Bancaria'
                          : method.type === 'paypal'
                          ? 'PayPal'
                          : 'Otro método'}
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
                  <button
                    onClick={() => onEditMethod(method)}
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDeleteMethod(method)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;