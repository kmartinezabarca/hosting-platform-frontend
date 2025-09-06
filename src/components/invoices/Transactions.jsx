import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";
import StatusFilterDropdown from "../filters/StatusFilterDropdown";
import {
  getStatusColor,
  getStatusIcon,
  getStatusText,
  formatCurrency,
  formatDate,
} from "../../lib/invoiceUtils";

// Opciones visibles en el filtro (puedes ajustarlas a tu negocio)
const STATUS_OPTIONS = [
  { value: "all",     label: "Todos" },
  { value: "paid",    label: "Pagadas" },
  { value: "pending", label: "Pendientes" },
  { value: "overdue", label: "Vencidas" },
  { value: "failed",  label: "Fallidas" },
];

// Homologación por si tu API trae "completed" en lugar de "paid"
const normalizeStatus = (s) => (s === "completed" ? "paid" : s);

/**
 * @param {Object} props
 * @param {Array}  props.transactions   Lista de transacciones (puede venir undefined → se normaliza)
 * @param {Object} props.filters        Estado de filtros { status: '...' }
 * @param {Function} props.setFilters   Setter del filtro
 */
const Transactions = ({
  transactions = [],
  filters = { status: "all" },
  setFilters = () => {},
}) => {
  // Garantiza array siempre
  const safeTxs = Array.isArray(transactions) ? transactions : [];

  // Filtrado memorizado por status
  const filteredTransactions = useMemo(() => {
    const status = filters?.status ?? "all";
    if (status === "all") return safeTxs;
    return safeTxs.filter((t) => normalizeStatus(t.status) === status);
  }, [safeTxs, filters?.status]);

  return (
    <div className="space-y-6">
      {/* Header + Filtro */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-foreground">
          Historial de Transacciones
        </h3>

        <StatusFilterDropdown
          value={filters?.status ?? "all"}
          onChange={(v) => setFilters((f) => ({ ...(f || {}), status: v }))}
          // Asegúrate de que tu StatusFilterDropdown acepte `options` (como te mostré antes)
          options={STATUS_OPTIONS}
        />
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-black/5 dark:bg-white/10 rounded-full mb-4 inline-flex">
              <TrendingUp className="w-12 h-12 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No hay transacciones
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Cuando realices pagos, verás sus transacciones aquí.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTransactions.map((t, index) => {
              const normStatus = normalizeStatus(t.status);
              return (
                <motion.div
                  key={t.id ?? `${t.transaction_id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="
                    border border-border rounded-xl p-6
                    bg-white dark:bg-card
                    hover:shadow-lg transition-all duration-200
                  "
                >
                  <div className="flex items-center justify-between">
                    {/* Izquierda: descripción e IDs */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-foreground truncate">
                          {t.description || `Transacción ${t.transaction_id}`}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {t.transaction_id} • {formatDate(t.created_at)}
                        </p>
                        {t.provider && (
                          <p className="text-xs text-muted-foreground truncate">
                            Procesado por {t.provider}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Derecha: monto + status + comisión */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(t.amount, t.currency)}
                      </p>
                      <div
                        className={`
                          inline-flex items-center gap-1 px-2 py-1 rounded-full
                          text-xs font-medium
                          ${getStatusColor(normStatus)}
                        `}
                        title={normStatus}
                      >
                        {getStatusIcon(normStatus)}
                        {getStatusText(normStatus)}
                      </div>
                      {t.fee_amount > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Comisión: {formatCurrency(t.fee_amount, t.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Transactions;
