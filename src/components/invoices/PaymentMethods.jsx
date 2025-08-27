// PaymentMethods.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, MoreVertical, Trash2, Check, CheckCircle } from 'lucide-react';
import { PaymentMethodLogo } from './PaymentMethodLogos'; // Importa el nuevo componente de logos

// --- Funciones de Ayuda ---
const formatExpiry = (m, y) => (m && y) ? `${String(m).padStart(2, '0')}/${String(y).slice(-2)}` : '';
const brandLabel = (b) => {
  const m = { visa:'Visa', mastercard:'Mastercard', amex:'American Express', discover:'Discover', diners:'Diners Club', jcb:'JCB', unionpay:'UnionPay' };
  return m[(b || '').toLowerCase()] || (b || 'Tarjeta');
};

// --- Componente de la Tarjeta Individual ---
function PaymentMethodCard({ method, onSetDefault, onDelete, index, activeDropdown, setActiveDropdown }) {
  const isDefault = !!method.is_default;
  const expiry = formatExpiry(method.exp_month, method.exp_year);
  const cardName = method.name || brandLabel(method.brand);

  // Estilos condicionales para la tarjeta predeterminada
  const cardClasses = `
    relative overflow-hidden bg-card border rounded-xl transition-all duration-300
    ${isDefault ? 'border-emerald-500/80 dark:border-emerald-400/60' : 'border-border'}
    hover:border-primary/60 dark:hover:border-primary/50 hover:shadow-md
  `;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={cardClasses}
    >
      <div className="p-4">
        {/* Header de la tarjeta */}
        <div className="flex items-start justify-between mb-4">
          <PaymentMethodLogo brand={method.brand} className="h-8" />
          {isDefault && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Predeterminado</span>
            </div>
          )}
        </div>

        {/* Número de tarjeta */}
        <div className="font-mono text-lg tracking-wider text-foreground mb-4">
          <span className="opacity-60">****</span> **** **** {method.last4 || '----'}
        </div>

        {/* Footer de la tarjeta */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{cardName}</p>
            <p className="text-xs text-muted-foreground">
              {expiry ? `Vence ${expiry}` : 'Sin vencimiento'}
            </p>
          </div>
          
          {/* Menú de acciones */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === method.id ? null : method.id)}
              className="p-2 rounded-full hover:bg-muted/80 transition-colors"
              aria-label="Abrir acciones"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>

            <AnimatePresence>
              {activeDropdown === method.id && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 bottom-full mb-2 w-56 bg-popover border border-border rounded-lg shadow-xl z-20"
                >
                  {!isDefault && (
                    <button
                      onClick={() => { onSetDefault(method); setActiveDropdown(null); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors text-left"
                    >
                      <Check className="w-4 h-4" />
                      Establecer como predeterminado
                    </button>
                  )}
                  <button
                    onClick={() => { onDelete(method); setActiveDropdown(null); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar método
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Componente Principal ---
const PaymentMethods = ({ paymentMethods = [], onAddMethod, onSetDefault, onDeleteMethod, loading = false }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Métodos de Pago</h2>
          <p className="text-muted-foreground mt-1">
            Gestiona tus métodos de pago guardados de forma segura.
          </p>
        </div>
        <button
          onClick={onAddMethod}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Agregar Método
        </button>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <AnimatePresence>
          {paymentMethods.map((method, index) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              index={index}
              onSetDefault={onSetDefault}
              onDelete={onDeleteMethod}
              activeDropdown={activeDropdown}
              setActiveDropdown={setActiveDropdown}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Estado vacío */}
      {paymentMethods.length === 0 && !loading && (
        <div className="text-center py-16 px-6 border-2 border-dashed border-border rounded-xl">
          <CreditCard className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">No hay métodos de pago</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm mx-auto">
            Agrega una tarjeta para empezar a gestionar tus pagos de forma rápida y segura.
          </p>
          <button
            onClick={onAddMethod}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Primer Método
          </button>
        </div>
      )}

      {/* Aviso de seguridad */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-muted-foreground/80 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-foreground">Tu información está segura</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Todos los métodos de pago están protegidos por nuestro proveedor. No almacenamos detalles sensibles de las tarjetas en nuestros servidores.
          </p>
        </div>
      </div>

      {/* Overlay para cerrar dropdowns */}
      {activeDropdown && <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />}
    </div>
  );
};

export default PaymentMethods;