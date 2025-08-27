import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import {
  getStatusColor,
  getStatusIcon,
  getStatusText,
  formatCurrency,
  formatDate,
} from '../../lib/invoiceUtils';

/**
 * Displays a list of payment transactions. Users can filter by status using
 * a dropdown. Each transaction card shows description, ID, creation date,
 * provider and amount.
 *
 * @param {Object} props
 * @param {Array} props.transactions A list of transaction objects.
 * @param {Object} props.filters Filter state (only `status` is used here).
 * @param {Function} props.setFilters Setter to update the filter state.
 */
const Transactions = ({ transactions, filters, setFilters }) => {
  // Filter transactions by status if not "all"
  const filteredTransactions = transactions.filter((t) => {
    return filters.status === 'all' || t.status === filters.status;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-foreground">Historial de Transacciones</h3>
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
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-full mb-4 inline-block">
              <TrendingUp className="w-12 h-12 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No hay transacciones</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Aún no tienes transacciones registradas. Las transacciones aparecerán aquí cuando realices pagos.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
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
                        <p className="text-xs text-muted-foreground">Procesado por {transaction.provider}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}
                    >
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
  );
};

export default Transactions;