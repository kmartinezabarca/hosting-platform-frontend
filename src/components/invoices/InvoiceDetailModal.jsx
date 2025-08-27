import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, Download, DollarSign } from 'lucide-react';
import {
  getStatusColor,
  getStatusIcon,
  getStatusText,
  formatCurrency,
  formatDate,
} from '../../lib/invoiceUtils';

/**
 * Modal to display full details of an invoice. Shows header information,
 * itemised list and totals. A pay button is shown when the invoice is
 * unpaid and still pending or overdue.
 *
 * @param {Object} props
 * @param {boolean} props.show Whether the modal is visible.
 * @param {Object|null} props.invoice Invoice object to display.
 * @param {Function} props.onClose Callback to close the modal.
 * @param {Function} props.onPay Callback to initiate payment; receives invoice.
 */
const InvoiceDetailModal = ({ show, invoice, onClose, onPay }) => {
  if (!show || !invoice) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="invoice-detail-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-card border border-border rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">Detalles de Factura</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-6">
            {/* Basic information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Número de Factura</p>
                <p className="font-semibold text-foreground">{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <div
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    invoice.status,
                  )}`}
                >
                  {getStatusIcon(invoice.status)}
                  {getStatusText(invoice.status)}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                <p className="font-semibold text-foreground">{formatDate(invoice.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                <p className="font-semibold text-foreground">{formatDate(invoice.due_date)}</p>
              </div>
            </div>
            {/* Items */}
            {invoice.items && invoice.items.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-3">Elementos de la Factura</h4>
                <div className="space-y-2">
                  {invoice.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <span className="text-foreground">{item.description}</span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(item.total || item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Total */}
            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                className="flex-1 border border-border text-foreground hover:bg-accent font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
              {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                <button
                  onClick={() => onPay(invoice)}
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
    </AnimatePresence>
  );
};

export default InvoiceDetailModal;