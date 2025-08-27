import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  formatCurrency,
} from '../../lib/invoiceUtils';

/**
 * Modal for processing a payment on an invoice. Presents invoice total and
 * allows the user to pick a payment method. Triggers callbacks when the
 * user confirms payment or closes the modal.
 *
 * @param {Object} props
 * @param {boolean} props.show Whether the modal is visible.
 * @param {Object|null} props.invoice The invoice being paid.
 * @param {Array} props.paymentMethods Available payment methods for selection.
 * @param {Function} props.onClose Callback to close the modal.
 * @param {Function} props.onPay Callback to process payment. Receives invoice and selected method.
 */
const PaymentModal = ({ show, invoice, paymentMethods, onClose, onPay }) => {
  const [selectedMethodId, setSelectedMethodId] = useState('');

  // When the modal is opened, reset selected method to none
  React.useEffect(() => {
    if (show) {
      setSelectedMethodId('');
    }
  }, [show]);

  if (!show || !invoice) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="payment-modal"
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
            Pagar Factura {invoice.invoice_number}
          </h3>
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <p className="text-sm text-muted-foreground mb-1">Total a pagar</p>
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(invoice.total, invoice.currency)}
            </p>
          </div>
          <div className="space-y-4 mb-6">
            <label className="block text-sm font-medium text-foreground">Método de Pago</label>
            <select
              value={selectedMethodId}
              onChange={(e) => setSelectedMethodId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Seleccionar método de pago</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-border text-foreground hover:bg-accent font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onPay(invoice.id, selectedMethodId)}
              disabled={!selectedMethodId}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Pagar Ahora
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;