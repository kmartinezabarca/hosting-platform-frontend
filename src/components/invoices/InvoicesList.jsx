import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusFilterDropdown from '../filters/StatusFilterDropdown';
import {
  Receipt,
  Eye,
  DollarSign,
  Download,
  Search,
} from 'lucide-react';
import {
  getStatusColor,
  getStatusIcon,
  getStatusText,
  formatCurrency,
  formatDate,
} from '../../lib/invoiceUtils';

/**
 * Renders the Invoices tab. This component is responsible for searching
 * through invoices, filtering by status and displaying each invoice card.
 * It delegates actions such as viewing details or paying to callback props.
 *
 * @param {Object} props
 * @param {Array} props.invoices A list of invoice objects fetched from the API.
 * @param {Object} props.filters Current search and status filter state.
 * @param {Function} props.setFilters Setter for updating filter state.
 * @param {Function} props.onSelectInvoice Called when a user wants to view an invoice.
 * @param {Function} props.onPayInvoice Called when a user wants to pay an invoice.
 */
const InvoicesList = ({ invoices, filters, setFilters, onSelectInvoice, onPayInvoice }) => {
  // Apply text search and status filters. Ignore dateRange for now (could be added later).
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      filters.search === '' ||
      (inv.invoice_number?.toLowerCase() || '').includes(filters.search.toLowerCase());
    const matchesStatus =
      filters.status === 'all' || inv.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-foreground">Mis Facturas</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar facturas..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent w-full"
            />
          </div>
          {/* Status filter */}
          <StatusFilterDropdown
            value={filters.status}
            onChange={(newStatus) =>
              setFilters({ ...filters, status: newStatus })
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-full mb-4 inline-block">
              <Receipt className="w-12 h-12 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No hay facturas
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Aún no tienes facturas generadas. Las facturas aparecerán aquí
              cuando realices compras.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredInvoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      {invoice.invoice_number}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          invoice.status
                        )}`}
                      >
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

                {/* Items breakdown */}
                {invoice.items && invoice.items.length > 0 && (
                  <div className="space-y-2 mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    {invoice.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.description}
                        </span>
                        <span className="text-foreground font-medium">
                          {formatCurrency(item.total || item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer actions */}
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    {invoice.status === "paid"
                      ? `Pagada el ${formatDate(invoice.paid_at)}`
                      : `Vence el ${formatDate(invoice.due_date)}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectInvoice(invoice)}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:bg-accent rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalles
                    </button>
                    {invoice.status === "sent" ||
                    invoice.status === "overdue" ? (
                      <button
                        onClick={() => onPayInvoice(invoice)}
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
  );
};

export default InvoicesList;