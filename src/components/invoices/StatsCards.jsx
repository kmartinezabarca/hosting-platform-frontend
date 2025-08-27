import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../lib/invoiceUtils';

/**
 * Displays a set of summarised metrics about the client's invoices and
 * payment methods. Each card uses Tailwind styles and Framer Motion
 * animations to fade in sequentially.
 *
 * @param {Object} props
 * @param {Object} props.invoiceStats Statistics aggregated from invoices.
 * @param {number} props.paymentMethodCount Total number of saved payment methods.
 */
const StatsCards = ({ invoiceStats, paymentMethodCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total amount invoiced */}
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
              {formatCurrency(invoiceStats?.total_amount || 0)}
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
            <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </motion.div>

      {/* Total amount paid */}
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
              {formatCurrency(invoiceStats?.paid_amount || 0)}
            </p>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </motion.div>

      {/* Total amount pending */}
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
              {formatCurrency(invoiceStats?.pending_amount || 0)}
            </p>
          </div>
          <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </motion.div>

      {/* Payment methods count */}
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
              {paymentMethodCount}
            </p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
            <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsCards;